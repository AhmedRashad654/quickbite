import { AppError } from "../error/AppError.js";

export const WsNoTokenError = new AppError('No token provided', 401);
