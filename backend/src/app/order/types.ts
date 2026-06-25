import { Currency } from '../branch/enums.js';
import { OrderStatus, OrderType, PaymentMethod } from './enums.js';
export interface Order {
  id: number;
  public_id: string;
  restaurant_owner_id: number | null;
  country_code: string;
  restaurant_id: number;
  branch_id: number;
  customer_id: number;
  customer_address_id: string;
  delivery_lat: number;
  delivery_lng: number;
  delivery_address_text_snapshot: string;
  branch_lat: number;
  branch_lng: number;
  status: OrderStatus;
  order_type: OrderType;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  currency: Currency;
  payment_method: PaymentMethod;
  created_at: Date;
  updated_at: Date;
  accepted_at: Date | null;
  rejected_at: Date | null;
  ready_at: Date | null;
  assigned_at: Date | null;
  delivery_agent_id: number | null;
  picked_at: Date | null;
  delivered_at: Date | null;
  cancelled_at: Date | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_snapshot: number;
  name_snapshot: string;
  image_url_snapshot: string;
  line_total: number;
  created_at: Date;
}

export interface CreateOrderInput {
  public_id: string;
  country_code: string;
  restaurant_id: number;
  branch_id: number;
  customer_id: number;
  customer_address_id: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  delivery_address_text_snapshot: string | null;
  branch_lat: number;
  branch_lng: number;
  status: OrderStatus;
  order_type: OrderType;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  currency: Currency;
  payment_method: PaymentMethod;
}

export interface InsertOrderItemInput {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price_snapshot: number;
  name_snapshot: string;
  image_url_snapshot: string | null;
  line_total: number;
}

export interface ListCustomerOrdersFilter {
  customerId: number;
  yearStart: Date;
  yearEnd: Date;
}

export interface ListRestaurantBranchOrdersFilter {
  restaurantId: number;
  branchId: number;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
}

export interface BranchProduct {
  product_id: number;
  name: string;
  image_url: string | null;
  price: number;
  stock: number;
  is_available: boolean;
}

export interface OrderLineDraft {
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  name: string;
  image_url: string | null;
}
export interface UnavailableItem {
  product_id: number;
  requested: number;
  available: number;
}

export interface ListResult<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
}
