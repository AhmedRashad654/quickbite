import express from 'express';
import { correlationId } from './lib/correlation/correlationId.js';
import { errorHandler } from './lib/error/errorHandler.js';
import { routes } from './routes.js';
import { AppError } from './lib/error/AppError.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(correlationId);
  app.use('/api/v1', routes);
  app.use((req, _res, next) => {
    const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
    next(error);
  });
  app.use(errorHandler);
  return app;
}
