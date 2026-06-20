import { z } from "zod";
import { ADDRESS_TYPE } from "../types";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10).max(11),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const addressFormSchema = z.object({
  label: z.string().min(1, "Label is required"),
  country: z.enum(["EG", "SA"], {
    message: "Please select a supported country",
  }),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  building: z.string().optional(),
  apartment_number: z.string().optional(),
  type: z.enum([
    ADDRESS_TYPE.OFFICE,
    ADDRESS_TYPE.HOME,
    ADDRESS_TYPE.PUBLIC_PLACE,
  ]),
  lat: z.coerce
    .number()
    .min(-90)
    .max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  is_default: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;
