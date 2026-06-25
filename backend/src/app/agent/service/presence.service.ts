import { inject, injectable } from 'tsyringe';
import { ICacheProvider } from '../../../lib/cache/cache.interface.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { db } from '../../../lib/knex/knex.js';
import { OrderStatus } from '../../order/enums.js';
import { OfflineWhilePickedForbidden } from '../errors.js';
import { env } from '../../../lib/config/env.js';

@injectable()
export class PresenceService {
  constructor(@inject(TOKENS.CacheProvider) private readonly cache: ICacheProvider) {}

  static metaKey(agentId: number): string {
    return `presence:meta:${agentId}`;
  }

  static geoKey(): string {
    return `presence:geo`;
  }

  static busyKey(): string {
    return `presence:busy`;
  }

  /** Online and ping share the same write path — UPSERT + extend TTL. */
  async upsert( agentId: number, lat: number, lng: number): Promise<void> {
    const ttl = env.delivery.presenceStaleSec;
    await this.cache.hsetWithTtl(
      PresenceService.metaKey(agentId),
      { lat: String(lat), lng: String(lng), lastSeenAt: String(Date.now()) },
      ttl,
    );
    await this.cache.geoadd(PresenceService.geoKey(), lng, lat, String(agentId));
  }

  /**
   * Reject if the agent is currently holding an order in `picked` (food in
   * transit). For `assigned`, we reset the order to `ready` so the worker
   * re-broadcasts on the next tick.
   */
  async goOffline(agentId: number): Promise<void> {
    const stuck = await db('orders')
      .select('public_id', 'status')
      .where({ delivery_agent_id: agentId, status: OrderStatus.PICKED })
      .first();
    if (stuck) throw OfflineWhilePickedForbidden;

    await db('orders')
      .where({ delivery_agent_id: agentId, status: OrderStatus.ASSIGNED })
      .update({ delivery_agent_id: null, status: OrderStatus.READY, assigned_at: null, updated_at: db.fn.now() });

    await this.cache.del(PresenceService.metaKey(agentId));
    await this.cache.zrem(PresenceService.geoKey(), String(agentId));
    await this.cache.srem(PresenceService.busyKey(), String(agentId));
  }

  async markBusy(agentId: number): Promise<void> {
    await this.cache.sadd(PresenceService.busyKey(), String(agentId));
  }

  async clearBusy(agentId: number): Promise<void> {
    await this.cache.srem(PresenceService.busyKey(), String(agentId));
  }
}
