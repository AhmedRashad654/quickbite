import { AppError } from '../../lib/error/AppError.js';

export const BranchNotAcceptingOrdersError = new AppError('BranchNotAcceptingOrders', 409);

export function outOfStockError(offending: unknown) {
  return new AppError(`OutOfStock: ${JSON.stringify(offending)}`, 409);
}
