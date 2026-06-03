import { AppError } from '../../lib/error/AppError.js';

export const CannotCreateOwnerUserError = new AppError('Not allowed to create another owner', 400);
export const InvalidBranchIdsError = new AppError(
  'One or more branch IDs do not belong to this restaurant',
  400,
);
export const UserAlreadyMemberInThisRestaurantError = new AppError(
  'User is already a member in this restaurant',
  400,
);
export const MemberNotFoundError = new AppError('Member not found', 404);

export const RoleNotFoundError = new AppError('Role not found', 404);

export const CannotDeleteOwnerError = new AppError('Cannot delete the restaurant owner', 400);
export const CannotUpdateStatusOrRoleForOwner = new AppError("Cannot update Statues or Role for owner",400)
export const CannotAssignTwoOwnerForRestaurant = new AppError("cannot assign tow owner for same restaurant",400)

export const CannotAssignBranchesToOwnerError = new AppError('Cannot assign branches to owners, they have access to all branches', 400);
