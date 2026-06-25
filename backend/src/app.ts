import express from 'express';
import { correlationId } from './lib/correlation/correlationId.js';
import { errorHandler } from './lib/error/errorHandler.js';
import { routes } from './routes.js';
import { AppError } from './lib/error/AppError.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.set('query parser', 'extended');
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        if (req.originalUrl && req.originalUrl.includes('/webhook/kashier')) {
          req.rawBody = buf;
          console.log('[Express BodyParser] Saved rawBody ONLY for Kashier Webhook! ✅');
        }
      },
    }),
  );
  app.use(cookieParser());
  app.use(correlationId);
  app.use('/api/v1', routes);
  app.use((req, _res, next) => {
    const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404, true, true);
    next(error);
  });
  app.use(errorHandler);
  return app;
}
