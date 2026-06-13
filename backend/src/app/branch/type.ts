import { Currency } from './enums.js';

export interface Branch {
  id: number;
  restaurant_id: number;
  country_code: string;
  address_text: string;
  label: string;
  lat: number;
  lng: number;
  is_active: boolean;
  opens_at: string;
  closes_at: string;
  accept_orders: boolean;
  delivery_fee:number;
  created_at: Date;
  updated_at: Date;
  delivery_radius: number;
  currency: Currency;
  commission: number;
  location: string;
}

export interface BranchWithRestaurant {
  branch: Branch;
  restaurantStatus: string;
}
