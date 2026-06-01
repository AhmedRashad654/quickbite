import { AppError } from "../error/AppError.js";

export const NotAuthenticated = new AppError('User not authenticated', 401);

export const InvalidToken = new AppError('Invalid or expired token', 401);

export const PermissionDenied = new AppError('You do not have permission to perform this action', 403);