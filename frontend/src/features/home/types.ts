export type NearbyBranch = {
  id: number;
  restaurant_id: number;
  address_text: string;
  label: string;
  lat: number;
  lng: number;
  is_active: boolean;
  opens_at: string;
  closes_at: string;
  is_open:boolean;
  accept_orders: boolean;
  currency: "EGP" | "SAR";
  name: string;
  logo_url?: string | null;
  distance_meters?: number | string;
};

export type NearbyRestaurantsResponse = {
  branches: NearbyBranch[];
  isFallback: boolean;
};

export type NearbyRestaurantsParams = {
  lat: number;
  lng: number;
};
