export interface OfferPayload {
    order_id: string;           
    branch: {id: number; lat: number; lng: number; name: string; address_text: string};
    dropoff: {lat: number; lng: number; address_text: string};
    total: number;
    currency: string;
    payment_method: string;
    expires_at: string;
}
