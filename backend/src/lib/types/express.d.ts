declare namespace Express {
  interface Request {
    correlationId?: string;
    rawBody?: Buffer;
    user?: {
      userId: number;
      role: string;
      email: string;
      memberships?: {
        restaurantId: number;
        restaurantRole: string;
        branchIds: number[];
      }[];
    };
    currentMembership?: {
      restaurantId: number;
      restaurantRole: string;
      branchIds: number[];
    };
  }
}
