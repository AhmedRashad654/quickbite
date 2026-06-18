import { z } from "zod";
import { SYSTEM_ROLES } from "../types";
import { COUNTRY } from "@/types";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol");

const phoneSchema = z
  .string()
  .min(10, "Phone must be at least 10 characters")
  .max(11, "Phone must be at most 11 characters");

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Enter a valid email"),
    phone: phoneSchema,
    password: passwordSchema,
    role: z.enum([
      SYSTEM_ROLES.CUSTOMER,
      SYSTEM_ROLES.DELIVERY_AGENT,
      SYSTEM_ROLES.RESTAURANT_USER,
    ]),
    restaurantName: z.string().optional(),
    restaurantCountry: z.nativeEnum(COUNTRY).optional(),
    restaurantLogoUrl: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== SYSTEM_ROLES.RESTAURANT_USER) {
      return;
    }

    if (!data.restaurantName?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Restaurant name is required",
        path: ["restaurantName"],
      });
    }

    if (!data.restaurantCountry?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Primary country is required",
        path: ["restaurantCountry"],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
