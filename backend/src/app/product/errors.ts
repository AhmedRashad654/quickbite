import { AppError } from '../../lib/error/AppError.js';

export const NoFieldsToUpdateError = new AppError('No valid fields to update', 400);
export const MissingProductIdsQueryError = new AppError('ids query is required', 400);
export const ProductNotFoundError = new AppError('Product not found', 404);
