export interface PlaceOrderItem {
  product_id: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  branch_id: number;
  order_type: "delivery" | "pickup";
  customer_address_id?: number | null;
  payment_method: "cod" | "online";
  items: { product_id: number; quantity: number }[];
}

export interface OrderItemResponse {
  product_id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderResponse {
  public_id: string;
  status: string;
  payment_method: "online" | "cod";
  branch: { id: number };
  restaurant: { id: number };
  customer_address: {
    lat: number;
    lng: number;
    address_text: string;
  };
  sub_total: number;
  delivery_fee: number;
  service_fee: number;
  total: number;
  currency: string;
  items: OrderItemResponse[];
  created_at: string;
  payment?: {
    providerSessionId: string;
    redirectUrl: string;
    expiresAt: string;
  };
}
