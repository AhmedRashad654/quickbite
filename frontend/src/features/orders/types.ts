export interface OrderSummary {
  public_id: string;
  status: string;
  total: number;
  currency: string;
  items_count: number;
  restaurant: { id: number };
  branch_id: number;
  created_at: string;
}

export interface OrderDetail {
  public_id: string;
  status: string;
  payment_method: string;
  branch: { id: number };
  restaurant: { id: number };
  customer_address: { lat: number; lng: number; address_text: string };
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  currency: string;
  items: OrderItem[];
  created_at: string;
  history: OrderHistoryEntry[];
}

export interface OrderItem {
  product_id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderHistoryEntry {
  status: string;
  ts: string;
}

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
}
