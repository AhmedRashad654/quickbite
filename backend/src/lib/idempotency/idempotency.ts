import { Request, Response, NextFunction } from 'express';
import { toSeconds } from '../utils/time.js';
import { container } from '../di/container.js';
import { ICacheProvider } from '../cache/cache.interface.js';
import { TOKENS } from '../di/tokens.js';

const DEFAULT_TTL = toSeconds(5, 'm'); 

interface IdempotencyOptions {
  strict?: boolean;
  ttlSeconds?: number;
}

export function idempotency(options: IdempotencyOptions = {}) {
  const { strict = false, ttlSeconds = DEFAULT_TTL } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

    if (!idempotencyKey) {
      if (strict) {
        return res.status(400).json({ error: 'Missing Idempotency-Key header' });
      }
      return next();
    }

    try {
      const cacheProvider: ICacheProvider = container.resolve(TOKENS.CacheProvider);
      const key = `idempotency:${req.method}:${req.originalUrl}:${idempotencyKey}`;

      const isLockAcquired = await cacheProvider.trySet(key, 'PROCESSING', ttlSeconds);

      if (!isLockAcquired) {
        const cachedValue = await cacheProvider.get(key);
        
        if (cachedValue === 'PROCESSING') {
          return res.status(409).json({ error: 'Concurrent request in progress. Please wait.' });
        }
        
        if (cachedValue) {
          return res.status(200).json(JSON.parse(cachedValue));
        }
      }

      const originalJson = res.json.bind(res);

      res.json = (body: any) => {
        cacheProvider.set(key, JSON.stringify(body), ttlSeconds);
        return originalJson(body);
      };

      next();
    } catch(error) {
      console.log(error)
      if (strict) {
        return res.status(503).json({ error: 'Idempotency service unavailable' });
      }
      next();
    }
  };
}