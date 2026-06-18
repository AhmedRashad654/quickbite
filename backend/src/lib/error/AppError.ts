export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  isRouteNotFound: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    isRouteNotFound: boolean = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isRouteNotFound = isRouteNotFound;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
