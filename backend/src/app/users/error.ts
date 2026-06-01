import { AppError } from "../../lib/error/AppError.js";

export const UserNotFoundError = new AppError('User not found', 404);

export const PhoneAlreadyInUseError = new AppError('Phone number already in use by another user', 400);