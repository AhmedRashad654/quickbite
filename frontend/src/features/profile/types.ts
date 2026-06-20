import type { Country } from "@/types";

export const ADDRESS_TYPE = {
  OFFICE: "office",
  HOME: "home",
  PUBLIC_PLACE: "public_place",
} as const;

export type AddressType = (typeof ADDRESS_TYPE)[keyof typeof ADDRESS_TYPE];

export interface CustomerAddress {
  id: number;
  user_id: number;
  label: string;
  country: Country;
  city: string;
  street: string;
  building: string | null;
  apartment_number: string | null;
  type: AddressType;
  lat: number;
  lng: number;
  is_default: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}
