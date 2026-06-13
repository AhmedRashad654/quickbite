import { Redis } from 'ioredis';

export interface ICacheProvider {
  getRawClient(): Redis;
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlSeconds?: number): Promise<any>;
  del(key: string): Promise<any>;
  delByPattern(pattern: string): Promise<any>;
}
