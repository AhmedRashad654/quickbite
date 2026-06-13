export interface JwtPayloadType {
  userId: number;
  email: string;
  role: string;
  memberships?: {
    restaurantId: number;
    restaurantRole: string;
    branchIds: number[];
  }[];
}
