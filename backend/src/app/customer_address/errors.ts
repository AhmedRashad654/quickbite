import { AppError } from "../../lib/error/AppError.js";

export const AddressNotFoundError = new AppError('Address not found', 404);
export const NoFieldsToUpdateError = new AppError('No valid fields to update', 400);
export const AddressPermissionDeniedError = new AppError(
    'The selected address does not belong to your account', 
    403
);