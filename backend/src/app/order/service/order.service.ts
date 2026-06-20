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
import { createOrder, findOrderByPublicId, updateOrderStatus } from '../repository/order.repo.js';
import { OrderStatus, PaymentMethod } from '../enums.js';
import { CustomerAddress } from '../../customer_address/type.js';
import { bulkInsertItems, findItemsByOrderIds } from '../repository/order-item.repo.js';
import { OrderDetailResponseDTO, OrderResponseDTO, OrderSummaryResponseDTO } from '../dto/order.response.dto.js';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { PaymentService } from '../../payment/service/payment.service.js';

const SERVICE_FEE_MINOR = 1000;

@injectable()
export class OrderService {
  constructor(@inject(TOKENS.PaymentService) private readonly paymentService: PaymentService) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async placeOrder(user: JwtPayloadType, body: CreateOrderDTO) {
    const branch = await findBranchWithRestaurant(body.branchId);
    if (!branch) throw BranchNotFoundError;
    if (
      !branch?.branch.is_active ||
      !branch?.branch.accept_orders ||
      branch.restaurantStatus !== RestaurantStatus.ACTIVE
    ) {
      throw BranchNotAcceptingOrdersError;
    }

    const address = await findAddressById(body.customerAddressId);
    if (!address) throw AddressNotFoundError;
    if (Number(address.user_id) !== Number(user.userId)) throw AddressPermissionDeniedError;

    const productIds = body.items.map((i) => i.productId);
    const products = await getProductsByBranchAndIds(body.branchId, productIds);
    const orderLineDrafts = this.buildOrderLineDrafts(body.items, products);

    const subtotal = sumMinor(orderLineDrafts.map((l) => l.line_total));
    const total = subtotal + branch.branch.delivery_fee + SERVICE_FEE_MINOR;

    const publicId = randomUUID();

    const trx = await db.transaction();

    let order: Order;
    let items: OrderItem[];

    try {
      const rows = await getBranchProductsForUpdate(body.branchId, productIds, trx);
      const byProduct = new Map<number, { stock: number; isAvailable: boolean }>();
      for (const r of rows) byProduct.set(Number(r.product_id), { stock: r.stock, isAvailable: r.is_available });

      for (const it of body.items) {
        const newStock = byProduct.get(it.productId)!.stock - it.quantity;
        await updateBranchProductDetails(branch.branch.id, it.productId, { stock: newStock });
      }

      order = await createOrder(
        {
          public_id: publicId,
          branch_id: Number(branch.branch.id),
          restaurant_id: Number(branch.branch.restaurant_id),
          country_code: branch.branch.country_code,
          customer_id: Number(user.userId),
          delivery_lat: Number(address.lat),
          delivery_lng: Number(address.lng),
          delivery_address_text_snapshot: this.flattenAddress(address),
          branch_lat: Number(branch.branch.lat),
          branch_lng: Number(branch.branch.lng),
          currency: branch.branch.currency,
          customer_address_id: Number(address.id),
          status: body.paymentMethod === PaymentMethod.ONLINE ? OrderStatus.PENDING_PAYMENT : OrderStatus.PLACED,
          subtotal,
          delivery_fee: branch.branch.delivery_fee,
          service_fee: SERVICE_FEE_MINOR,
          total,
          payment_method: body.paymentMethod,
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
    if (body.paymentMethod === PaymentMethod.ONLINE) {
      try {
        const result = await this.paymentService.initOnlinePayment(order);
        paymentInfo = {
          providerSessionId: result.session.provider_session_id,
          redirectUrl: result.session.redirect_url,
          expiresAt: result.expiresAt,
        };
      } catch (err) {
        await updateOrderStatus(publicId, OrderStatus.CANCELLED, 'cancelled_at');
        this.releaseStockSafe(branch.branch.id, body.items);
        throw err;
      }
    }

    if (body.paymentMethod === PaymentMethod.COD) {
      this.io.to(`branch:${branch.branch.id}`).emit('order.created', OrderSummaryResponseDTO.from(order, items.length));
    }

    return OrderResponseDTO.from(order, items, paymentInfo);
  }

  async getOrder(publicId: string): Promise<OrderDetailResponseDTO> {
    const order = await findOrderByPublicId(publicId);
    if (!order) throw OrderNotFoundError;
    const items = await findItemsByOrderIds([order.id]);
    return OrderDetailResponseDTO.from(order, items);
  }

  // ── private helpers ──────────────────────────────────────────────────
  private buildOrderLineDrafts(
    requested: Array<{ productId: number; quantity: number }>,
    products: BranchProduct[],
  ): OrderLineDraft[] {
    const byProduct = new Map<number, BranchProduct>();
    for (const p of products) byProduct.set(Number(p.product_id), p);

    const unavailableItems: UnavailableItem[] = [];
    const drafts: OrderLineDraft[] = [];

    for (const it of requested) {
      const p = byProduct.get(it.productId);
      if (!p || !p.is_available) {
        unavailableItems.push({ product_id: it.productId, requested: it.quantity, available: 0 });
        continue;
      }
      if (p.stock < it.quantity) {
        unavailableItems.push({ product_id: it.productId, requested: it.quantity, available: p.stock });
        continue;
      }
      drafts.push({
        product_id: it.productId,
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
    items: Array<{ productId: number; quantity: number }>,
  ): Promise<void> {
    for (const it of items) {
      const newStock = it.quantity;
      await updateBranchProductDetails(branchId, it.productId, { stock: newStock });
    }
  }

  private flattenAddress(a: CustomerAddress): string {
    const parts = [a.building, a.street, a.city, a.country].filter(Boolean);
    return parts.join(', ');
  }
}
