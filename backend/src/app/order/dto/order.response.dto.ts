import { OrderStatus, PaymentMethod } from '../enums.js';
import { Order, OrderItem } from '../types.js';

export class OrderItemResponseDTO {
  product_id!: number;
  name!: string;
  image_url!: string | null;
  quantity!: number;
  unit_price!: number;
  line_total!: number;

  static from(item: OrderItem): OrderItemResponseDTO {
    const dto = new OrderItemResponseDTO();
    dto.product_id = item.product_id;
    dto.name = item.name_snapshot;
    dto.image_url = item.image_url_snapshot;
    dto.quantity = item.quantity;
    dto.unit_price = item.unit_price_snapshot;
    dto.line_total = item.line_total;
    return dto;
  }
}

export class OrderSummaryResponseDTO {
  public_id!: string;
  status!: OrderStatus;
  total!: number;
  currency!: string;
  items_count!: number;
  restaurant!: { id: number };
  branch_id!: number;
  created_at!: string;

  static from(order: Order, itemsCount: number): OrderSummaryResponseDTO {
    const dto = new OrderSummaryResponseDTO();
    dto.public_id = order.public_id;
    dto.status = order.status;
    dto.total = order.total;
    dto.currency = order.currency;
    dto.items_count = itemsCount;
    dto.restaurant = { id: Number(order.restaurant_id) };
    dto.branch_id = Number(order.branch_id);
    dto.created_at = order.created_at.toISOString();
    return dto;
  }
}

export interface OrderResponsePaymentInfo {
  sessionId: string;
  providerSessionId: string;
  redirectUrl: string;
  expiresAt: string;
}

export class OrderResponseDTO {
  public_id!: string;
  status!: OrderStatus;
  payment_method!: PaymentMethod;
  branch!: { id: number };
  restaurant!: { id: number };
  customer_address!: { lat: number; lng: number; address_text: string };
  subtotal!: number;
  delivery_fee!: number;
  service_fee!: number;
  total!: number;
  currency!: string;
  items!: OrderItemResponseDTO[];
  created_at!: string;
  payment?: OrderResponsePaymentInfo;

  static from(order: Order, items: OrderItem[], payment?: OrderResponsePaymentInfo): OrderResponseDTO {
    const dto = new OrderResponseDTO();
    dto.public_id = order.public_id;
    dto.status = order.status;
    dto.payment_method = order.payment_method;
    dto.branch = { id: Number(order.branch_id) };
    dto.restaurant = { id: Number(order.restaurant_id) };
    dto.customer_address = {
      lat: Number(order.delivery_lat),
      lng: Number(order.delivery_lng),
      address_text: order.delivery_address_text_snapshot,
    };
    dto.subtotal = order.subtotal;
    dto.delivery_fee = order.delivery_fee;
    dto.service_fee = order.service_fee;
    dto.total = order.total;
    dto.currency = order.currency;
    dto.items = items.map(OrderItemResponseDTO.from);
    dto.created_at = order.created_at.toISOString();
    if (payment) dto.payment = payment;
    return dto;
  }
}

export class OrderStatusResponseDTO {
  publicId!: string;
  status!: OrderStatus;
  updatedAt!: string;

  static from(order: Order): OrderStatusResponseDTO {
    const dto = new OrderStatusResponseDTO();
    dto.publicId = order.public_id;
    dto.status = order.status;
    dto.updatedAt = order.updated_at.toISOString();
    return dto;
  }
}
