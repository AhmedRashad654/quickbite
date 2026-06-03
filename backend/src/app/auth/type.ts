export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  memberships?: {
    restaurantId: number;
    restaurantRole: string;
    branchIds: number[];
  }[];
}

export interface PasswordReset {
  id: number;
  user_id: number;
  otp_hash: string;
  expires_at: Date;
  consumed_at: Date | null;
  created_at: Date;
}
