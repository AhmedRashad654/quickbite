import { AddressType } from "./enums.js";

export interface CustomerAddress {
  id: number;
  user_id: number;
  label: string;
  country: string;
  city: string;
  street: string;
  building: string | null;
  apartment_number: string | null;
  type: AddressType;
  lat: number;
  lng: number;
  is_default: boolean;
}
