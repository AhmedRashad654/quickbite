import { injectable } from 'tsyringe';
import { PermissionDeniedError } from '../../../lib/auth/error.js';
import { RestaurantNotFoundError } from '../../restaurant/errors.js';
import { findRestaurantById } from '../../restaurant/repository/restaurant.repo.js';
import { SystemRole } from '../../users/enums.js';
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from '../dto/branch.dto.js';
import { BranchNotFoundError } from '../errors.js';
import {
  createBranch,
  findBranchById,
  findBranchesByRestaurant,
  findBranchWithRestaurant,
  findNearbyBranches,
  updateBranch,
  updateBranchStatus,
} from '../repository/branch.repo.js';
import { BranchWithRestaurant } from '../type.js';

@injectable()
export class BranchService {
  findNearby = async (lat: number, lng: number) => {
    const rows = await findNearbyBranches(lat, lng);
    return rows;
  };

  findByRestaurant = async (restaurantId: number) => {
    return await findBranchesByRestaurant(restaurantId);
  };

  create = async (restaurantId: number, userId: number, userRole: SystemRole, data: CreateBranchDTO) => {
    const restaurant = await findRestaurantById(restaurantId);

    if (!restaurant) {
      throw RestaurantNotFoundError;
    }

    if (userRole != SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
      throw PermissionDeniedError;
    }

    const branch = await createBranch({
      restaurant_id: restaurantId,
      label: data.label,
      country_code: data.country_code,
      lat: data.lat,
      lng: data.lng,
      address_text: data.address_text,
      is_active: false,
      opens_at: data.opens_at,
      closes_at: data.closes_at,
      currency: data.currency,
      delivery_radius: data.delivery_radius,
      commission: 0,
      accept_orders: false,
    });

    return branch;
  };

  update = async (branchId: number, userId: number, userRole: SystemRole, data: UpdateBranchDTO) => {
    const branch = await findBranchById(branchId);
    if (!branch) {
      throw BranchNotFoundError;
    }

    const restaurant = await findRestaurantById(branch.restaurant_id);
    if (!restaurant) throw RestaurantNotFoundError;
    if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
      throw PermissionDeniedError;
    }

    return await updateBranch(branchId, data);
  };

  updateStatus = async (branchId: number, userRole: SystemRole, data: UpdateBranchStatusDTO) => {
    if (userRole !== SystemRole.SYSTEM_ADMIN) {
      throw PermissionDeniedError;
    }

    const branch = await findBranchById(branchId);
    if (!branch) {
      throw BranchNotFoundError;
    }

    return await updateBranchStatus(branchId, data);
  };

}
