import { Request, Response, NextFunction } from 'express';
import { container } from '../di/container.js';
import { ICacheProvider } from './cache.interface.js';
import { TOKENS } from '../di/tokens.js';

export function clearCache(keyExtractor: (req: Request) => string | string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheProvider: ICacheProvider = container.resolve(TOKENS.CacheProvider);

    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const keysToEvict = keyExtractor(req);
        const keysArray = Array.isArray(keysToEvict) ? keysToEvict : [keysToEvict];

        (async () => {
          for (const key of keysArray) {
            try {
              if (key.includes('*')) {
                await cacheProvider.delByPattern(key);
              } else {
                await cacheProvider.del(key);
              }
            } catch (err) {
              console.error(`[Cache clear Failed] for key: ${key}`, err);
            }
          }
        })();
      }
      return originalJson(body);
    };

    next();
  };
}
