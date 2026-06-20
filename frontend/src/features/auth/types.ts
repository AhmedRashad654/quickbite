export const SYSTEM_ROLES = {
  CUSTOMER: "customer",
  DELIVERY_AGENT: "delivery_agent",
  RESTAURANT_USER: "restaurant_user",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export type AuthUser = {
  id: number;
  email: string;
  phone: string;
  name?: string;
  system_role?: SystemRole;
  created_at?: string;
  updated_at?: string;
};

export type RestaurantRegistration = {
  name: string;
  logo_url?: string;
  primary_country: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  phone: string;
  name: string;
  password: string;
  role: SystemRole;
  restaurant?: RestaurantRegistration;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
  restaurant?: unknown;
};

export type RefreshResponse = {
  accessToken: string;
};



