export interface PlaceOrderItem {
  productId: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  branchId: number;
  customerAddressId: number;
  paymentMethod: "cod" | "online";
  items: PlaceOrderItem[];
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
  payment_method: string;
  branch: { id: number };
  restaurant: { id: number };
  customer_address: {
    lat: number;
    lng: number;
    address_text: string;
  };
  subtotal: number;
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
