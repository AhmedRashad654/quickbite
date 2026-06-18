import type { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';
import { logger } from '../logger/logger.js';

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const operational = err.isOperational;
  const statusCode = err.statusCode || 500;
  const correlationId = req.correlationId || 'no-id';
  const userId = req?.user?.userId || 'anonymous';
  const userRole = req?.user?.role || 'guest';

  if (statusCode >= 500) {
    logger.error(err.message, {
      statusCode,
      stack: err.stack,
      correlationId,
      userId,
      userRole,
      path: req.path,
    });
  }

  if (statusCode === 400 || (statusCode === 404 && err.isRouteNotFound)) {
    logger.warn(err.message, {
      statusCode,
      correlationId,
      userId,
      userRole,
      path: req.path,
    });
  }

  if (operational) {
    return res.status(statusCode).json({
      success: false,
      error: err.message,
      correlationId,
    });
  }

  return res.status(500).json({
    success: false,
    error: 'Something went wrong on our end',
    correlationId,
  });
}
