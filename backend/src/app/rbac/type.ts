import { MemberStatus } from './enums.js';

export interface RestaurantMember {
  id: number;
  restaurant_id: number;
  user_id: number;
  role_id: number;
  status: MemberStatus;
  created_at: Date;
  updated_at: Date;
}

export interface RestaurantMembership {
  restaurantId: number;
  restaurantRole: string;
  branchIds: number[];
}

export interface MemberBranch {
  member_id: number;
  branch_id: number;
  created_at: Date;
}
