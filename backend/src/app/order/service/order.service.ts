import { inject, injectable } from 'tsyringe';
import { JwtPayloadType } from '../../../lib/types/jwtPayload.js';
import { CreateOrderDTO } from '../dto/order.dto.js';
import { RestaurantStatus } from '../../restaurant/enums.js';
import { BranchNotAcceptingOrdersError, OrderNotFoundError, outOfStockError } from '../errors.js';
import { findAddressById } from '../../customer_address/repository/customer-address.repo.js';
import { findBranchWithRestaurant } from '../../branch/repository/branch.repo.js';
import { BranchNotFoundError } from '../../branch/errors.js';
import { AddressNotFoundError, AddressPermissionDeniedError } from '../../customer_address/errors.js';
import {
  getBranchProductsForUpdate,
  getProductsByBranchAndIds,
  updateBranchProductDetails,
} from '../../product/repository/product-branch-details.repo.js';
import { BranchProduct, Order, OrderItem, OrderLineDraft, UnavailableItem } from '../types.js';
import { multiplyMinor, sumMinor } from '../../../lib/utils/money.js';
import { randomUUID } from 'crypto';
import { db } from '../../../lib/knex/knex.js';
import { createOrder, findOrderByPublicId, findOrdersByCustomer, updateOrderStatus } from '../repository/order.repo.js';
import { OrderStatus, OrderType, PaymentMethod } from '../enums.js';
import { CustomerAddress } from '../../customer_address/type.js';
import { bulkInsertItems, countItemsByOrderIds, findItemsByOrderIds } from '../repository/order-item.repo.js';
import { OrderDetailResponseDTO, OrderResponseDTO, OrderSummaryResponseDTO } from '../dto/order.response.dto.js';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { PaymentService } from '../../payment/service/payment.service.js';
import { AppError } from '../../../lib/error/AppError.js';
import { SystemRole } from '../../users/enums.js';
import { PermissionDeniedError } from '../../../lib/auth/error.js';
import { PaginationParams } from '../../../lib/http/pagination/cursor-pagination.js';
import { isBranchOpen } from '../../../lib/utils/branchTime.js';
import { env } from '../../../lib/config/env.js';

const SERVICE_FEE_MINOR = 1000;

@injectable()
export class OrderService {
  constructor(@inject(TOKENS.PaymentService) private readonly paymentService: PaymentService) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async placeOrder(user: JwtPayloadType, body: CreateOrderDTO) {
    const branch = await findBranchWithRestaurant(body.branch_id);
    if (!branch) throw BranchNotFoundError;
    if (branch.restaurant_status !== RestaurantStatus.ACTIVE || !isBranchOpen(branch)) {
      throw BranchNotAcceptingOrdersError;
    }

    let address = null;
    if (body.order_type === OrderType.DELIVERY) {
      address = await findAddressById(body.customer_address_id);
      if (!address) throw AddressNotFoundError;
      if (Number(address.user_id) !== Number(user.userId)) throw AddressPermissionDeniedError;
      await this.validateDeliveryZone(Number(branch.lat), Number(branch.lng), Number(address.lat), Number(address.lng));
    }

    const productIds = body.items.map((i) => i.product_id);
    const products = await getProductsByBranchAndIds(body.branch_id, productIds);
    const orderLineDrafts = this.buildOrderLineDrafts(body.items, products);
    const subtotal = sumMinor(orderLineDrafts.map((l) => l.line_total));
    const total =
      body.order_type === OrderType.DELIVERY
        ? subtotal + branch.delivery_fee + SERVICE_FEE_MINOR
        : subtotal + SERVICE_FEE_MINOR;

    const publicId = randomUUID();
    const trx = await db.transaction();

    let order: Order;
    let items: OrderItem[];
    try {
      const rows = await getBranchProductsForUpdate(body.branch_id, productIds, trx);
      const byProduct = new Map<number, { stock: number; is_available: boolean }>();
      for (const r of rows) byProduct.set(Number(r.product_id), { stock: r.stock, is_available: r.is_available });
      for (const it of body.items) {
        const newStock = byProduct.get(it.product_id)!.stock - it.quantity;
        await updateBranchProductDetails(branch.id, it.product_id, { stock: newStock }, trx);
      }
      order = await createOrder(
        {
          public_id: publicId,
          branch_id: Number(branch.id),
          restaurant_id: Number(branch.restaurant_id),
          country_code: branch.country_code,
          customer_id: Number(user.userId),
          delivery_lat: address ? Number(address.lat) : null,
          delivery_lng: address ? Number(address.lng) : null,
          delivery_address_text_snapshot: address ? this.flattenAddress(address) : null,
          branch_lat: Number(branch.lat),
          branch_lng: Number(branch.lng),
          currency: branch.currency,
          customer_address_id: address ? Number(address.id) : null,
          status: body.payment_method === PaymentMethod.ONLINE ? OrderStatus.PENDING_PAYMENT : OrderStatus.PLACED,
          order_type: body.order_type,
          subtotal,
          delivery_fee: address ? branch.delivery_fee / 100 : 0,
          service_fee: SERVICE_FEE_MINOR / 100,
          total,
          payment_method: body.payment_method,
        },
        trx,
      );
      items = await bulkInsertItems(
        orderLineDrafts.map((l) => ({
          order_id: Number(order.id),
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price_snapshot: l.unit_price,
          name_snapshot: l.name,
          line_total: l.line_total,
          image_url_snapshot: l.image_url,
        })),
        trx,
      );
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
    let paymentInfo;
    if (body.payment_method === PaymentMethod.ONLINE) {
      try {
        const result = await this.paymentService.initOnlinePayment(order);
        paymentInfo = {
          providerSessionId: result.session.provider_session_id,
          redirectUrl: result.session.redirect_url,
          expiresAt: result.expiresAt,
        };
      } catch (err) {
        await updateOrderStatus(publicId, OrderStatus.CANCELLED, 'cancelled_at');
        this.releaseStockSafe(branch.id, body.items);
        throw err;
      }
    }
    if (body.payment_method === PaymentMethod.COD) {
      this.io.to(`branch:${branch.id}`).emit('order.created', OrderSummaryResponseDTO.from(order, items.length));
    }
    return OrderResponseDTO.from(order, items, paymentInfo);
  }

  async getOrder(publicId: string, user: JwtPayloadType): Promise<OrderDetailResponseDTO> {
    const order = await findOrderByPublicId(publicId);
    if (!order) throw OrderNotFoundError;
    this.assertReadAccess(user, order);
    const items = await findItemsByOrderIds([order.id]);
    return OrderDetailResponseDTO.from(order, items);
  }

  async listCustomerOrders(actor: Partial<JwtPayloadType>, year: number, pagination: PaginationParams) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
    console.log(pagination)
    const result = await findOrdersByCustomer({ customerId: actor.userId!, yearStart, yearEnd }, pagination);
    console.log(result, 'result 654');
    const counts = await countItemsByOrderIds(result.data.map((o) => o.id));
    return {
      data: result.data.map((o) => OrderSummaryResponseDTO.from(o, counts.get(o.id) ?? 0)),
      meta: result.meta,
    };
  }

  // ── private helpers ──────────────────────────────────────────────────
  private buildOrderLineDrafts(
    requested: Array<{ product_id: number; quantity: number }>,
    products: BranchProduct[],
  ): OrderLineDraft[] {
    const byProduct = new Map<number, BranchProduct>();
    for (const p of products) byProduct.set(Number(p.product_id), p);

    const unavailableItems: UnavailableItem[] = [];
    const drafts: OrderLineDraft[] = [];

    for (const it of requested) {
      const p = byProduct.get(it.product_id);
      if (!p || !p.is_available) {
        unavailableItems.push({ product_id: it.product_id, requested: it.quantity, available: 0 });
        continue;
      }
      if (p.stock < it.quantity) {
        unavailableItems.push({ product_id: it.product_id, requested: it.quantity, available: p.stock });
        continue;
      }
      drafts.push({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_price: p.price,
        line_total: multiplyMinor(p.price, it.quantity),
        name: p.name,
        image_url: p.image_url,
      });
    }
    if (unavailableItems.length > 0) throw outOfStockError(unavailableItems);
    return drafts;
  }

  private async releaseStockSafe(
    branchId: number,
    items: Array<{ product_id: number; quantity: number }>,
  ): Promise<void> {
    for (const it of items) {
      const newStock = it.quantity;
      await updateBranchProductDetails(branchId, it.product_id, { stock: newStock });
    }
  }

  private flattenAddress(a: CustomerAddress): string {
    const parts = [a.building, a.street, a.city, a.country].filter(Boolean);
    return parts.join(', ');
  }

  private async validateDeliveryZone(
    branchLat: number,
    branchLng: number,
    customerLat: number,
    customerLng: number,
  ): Promise<void> {
    const radiusMeters = env.delivery.radiusMeters || 5000;
    const result = await db.raw<{ rows: { distance: number }[] }>(
      `
    SELECT ST_Distance(
      ST_MakePoint(?, ?)::geography,
      ST_MakePoint(?, ?)::geography 
    ) as distance
    `,
      [branchLng, branchLat, customerLng, customerLat],
    );

    const distanceMeters = result.rows[0]?.distance;

    if (distanceMeters > radiusMeters) {
      throw new AppError(
        `The restaurant is outside your delivery radius. Current distance: ${Math.round(distanceMeters / 1000)} km`,
        400,
      );
    }
  }

  private assertReadAccess(user: JwtPayloadType, order: Order) {
    if (user.role === SystemRole.SYSTEM_ADMIN) return;
    if (Number(user.userId) === Number(order.customer_id)) return;

    if (user.role === SystemRole.RESTAURANT_USER) {
      const memberships = user.memberships ?? [];

      const currentRestaurantMembership = memberships.find(
        (m) => Number(m.restaurantId) === Number(order.restaurant_id),
      );

      if (currentRestaurantMembership) {
        if (currentRestaurantMembership.restaurantRole === 'owner') return;

        const branchIds = currentRestaurantMembership.branchIds ?? [];
        if (branchIds.map(Number).includes(Number(order.branch_id))) return;
      }
    }
    throw PermissionDeniedError;
  }
}
