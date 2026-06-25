import { inject, injectable } from 'tsyringe';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import {
  claimReadyOrderForAgent,
  findOrderByPublicId,
  findReadyUnassigned,
} from '../../order/repository/order.repo.js';
import { logger } from '../../../lib/logger/logger.js';
import { Order } from '../../order/types.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { ICacheProvider } from '../../../lib/cache/cache.interface.js';
import { PresenceService } from '../../agent/service/presence.service.js';
import { findBranchById } from '../../branch/repository/branch.repo.js';
import { OfferPayload } from '../types.js';
import {
  NotInCandidateListError,
  OfferNotFoundOrExpiredError,
  OrderAlreadyClaimedError,
  OrderNotInReadyStateError,
} from '../../agent/errors.js';
import { DeliveryTaskResponseDTO } from '../../agent/dto/agent.response.dto.js';
import { db } from '../../../lib/knex/knex.js';
import { OrderStatusResponseDTO } from '../../order/dto/order.response.dto.js';
import { env } from '../../../lib/config/env.js';

@injectable()
export class AssignmentService {
  constructor(
    @inject(TOKENS.CacheProvider) private readonly cache: ICacheProvider,
    @inject(TOKENS.PresenceService) private readonly presence: PresenceService,
  ) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  static offerKey(orderPublicId: string): string {
    return `offer:order:${orderPublicId}`;
  }

  static claimKey(orderPublicId: string): string {
    return `claim:order:${orderPublicId}`;
  }
  static attemptsKey(orderPublicId: string): string {
    return `assign:attempts:${orderPublicId}`;
  }

  async tickRegion(): Promise<{ processed: number; offered: number; skipped: number }> {
    const orders = await findReadyUnassigned(env.delivery.batch);
    let offered = 0;
    let skipped = 0;
    for (const o of orders) {
      const result = await this.tryAssign(o).catch((err) => {
        logger.error('tryAssign failed', { public_id: o.public_id, error: (err as Error).message });
        return 'error' as const;
      });
      if (result === 'offered') offered++;
      else skipped++;
    }
    return { processed: orders.length, offered, skipped };
  }

  /**
   * Find candidates → broadcast `task.offered` → set offer marker. The
   * acceptance is owned by `claim()` (called from POST /agents/orders/:id/accept).
   */
  async tryAssign(order: Order): Promise<'offered' | 'skipped' | 'exhausted' | 'no-candidates'> {
    if (await this.cache.exists(AssignmentService.offerKey(order.public_id))) return 'skipped';

    // Cap reassignment attempts. Beyond the cap → admin alert; order stays ready.
    const attemptsRaw = await this.cache.get(AssignmentService.attemptsKey(order.public_id));
    const attempts = Number(attemptsRaw ?? 0);
    if (attempts >= env.delivery.maxAttempts) {
      this.io.to(`branch:${order.branch_id}`).emit('assignment.exhausted', { order_id: order.public_id, attempts });
      return 'exhausted';
    }

    // GEOSEARCH uses the snapshotted branch_lat/branch_lng on the order
    const candidates = await this.findCandidates(order.branch_lng, order.branch_lat);
    if (candidates.length === 0) {
      await this.cache.incr(AssignmentService.attemptsKey(order.public_id));
      await this.cache.expire(AssignmentService.attemptsKey(order.public_id), 3600);
      return 'no-candidates';
    }

    const offerSet = await this.cache.trySet(
      AssignmentService.offerKey(order.public_id),
      candidates.join(','),
      env.delivery.offerTtlSec,
    );
    if (!offerSet) return 'skipped';

    await this.cache.incr(AssignmentService.attemptsKey(order.public_id));
    await this.cache.expire(AssignmentService.attemptsKey(order.public_id), 3600);

    const branch = await findBranchById(order.branch_id).catch(() => null);
    const expires_at = new Date(Date.now() + env.delivery.offerTtlSec * 1000).toISOString();
    const payload: OfferPayload = {
      order_id: order.public_id,
      branch: {
        id: order.branch_id,
        lat: order.branch_lat,
        lng: order.branch_lng,
        name: branch?.label ?? '',
        address_text: branch?.address_text ?? '',
      },
      dropoff: { lat: order.delivery_lat, lng: order.delivery_lng, address_text: order.delivery_address_text_snapshot },
      total: order.total,
      currency: order.currency,
      payment_method: order.payment_method,
      expires_at,
    };

    for (const agentId of candidates) {
      this.io.to(`agent:${agentId}`).emit('task.offered', payload);
    }
    logger.info('assignment.broadcast', { publicId: order.public_id, candidates, attempts: attempts + 1 });
    return 'offered';
  }

  /**
   * Atomic claim. Returns the DeliveryTaskResponseDTO on success;
   * throws OrderAlreadyClaimedError if another agent won the race.
   */
  async claim(publicId: string, agentId: number): Promise<DeliveryTaskResponseDTO> {
    // Verify the agent was offered this order.
    const offered = await this.cache.get(AssignmentService.offerKey(publicId));
    if (!offered) throw OfferNotFoundOrExpiredError;
    const candidateIds: number[] = offered.split(',').map(Number);
    if (!candidateIds.includes(agentId)) throw NotInCandidateListError;

    // Atomic SETNX claim — first acceptor wins.
    const ok = await this.cache.trySet(AssignmentService.claimKey(publicId), String(agentId), env.delivery.claimTtlSec);
    if (!ok) throw OrderAlreadyClaimedError;

    const trx = await db.transaction();
    let updated: Order;
    try {
      const order = await findOrderByPublicId(publicId, trx);
      if (!order) {
        await this.cache.del(AssignmentService.claimKey(publicId));
        throw OrderNotInReadyStateError;
      }
      const claimed = await claimReadyOrderForAgent(publicId, agentId, trx);
      if (!claimed) {
        await this.cache.del(AssignmentService.claimKey(publicId));
        throw OrderNotInReadyStateError;
      }
      updated = claimed;
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      await this.cache.del(AssignmentService.claimKey(publicId));
      throw err;
    }

    await this.presence.markBusy(agentId);

    // Fan out: winner -> task.assigned, losers -> offer.cancelled,
    // customer/branch -> order.status_changed.
    const losers = candidateIds.filter((id) => id !== agentId);
    const branch = await findBranchById(updated.branch_id).catch(() => null);
    const taskDto = DeliveryTaskResponseDTO.from(updated, branch ?? undefined);
    const statusDto = OrderStatusResponseDTO.from(updated);

    this.io.to(`agent:${agentId}`).emit('task.assigned', taskDto);
    for (const loser of losers) {
      this.io.to(`agent:${loser}`).emit('offer.cancelled', { orderId: publicId, reason: 'claimed_by_other' });
    }
    this.io.to(`customer:${updated.customer_id}`).emit('order.status_changed', statusDto);
    this.io.to(`branch:${updated.branch_id}`).emit('order.status_changed', statusDto);

    // Drop the offer marker (claim TTL keeps the lock).
    await this.cache.del(AssignmentService.offerKey(publicId));

    return taskDto;
  }

  /** Caller already verified the agent is in the offer; just decrement. */
  async reject(publicId: string, agentId: number): Promise<void> {
    const offered = await this.cache.get(AssignmentService.offerKey(publicId));
    if (!offered) throw OfferNotFoundOrExpiredError;
    const candidateIds: number[] = offered.split(',').map(Number);
    if (!candidateIds.includes(agentId)) throw NotInCandidateListError;
    const remaining = candidateIds.filter((id) => id !== agentId);
    if (remaining.length === 0) {
      await this.cache.del(AssignmentService.offerKey(publicId));
    } else {
      const remainingTtl = await this.cache.ttl(AssignmentService.offerKey(publicId));
      await this.cache.set(AssignmentService.offerKey(publicId), remaining.join(','), Math.max(remainingTtl, 1));
    }
  }

  /**
   * owner override — bypasses the offer/candidate flow entirely. Force-claims
   * the order for the specified agent regardless of distance/busy state.
   */
  async ownerAssign(publicId: string, agentId: number): Promise<DeliveryTaskResponseDTO> {
    const ok = await this.cache.trySet(AssignmentService.claimKey(publicId), String(agentId), env.delivery.claimTtlSec);
    if (!ok) throw OrderAlreadyClaimedError;

    const trx = await db.transaction();
    let updated: Order;
    try {
      const claimed = await claimReadyOrderForAgent(publicId, agentId, trx);
      if (!claimed) {
        await this.cache.del(AssignmentService.claimKey(publicId));
        throw OrderNotInReadyStateError;
      }
      updated = claimed;
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      await this.cache.del(AssignmentService.claimKey(publicId));
      throw err;
    }

    await this.presence.markBusy(agentId);

    const branch = await findBranchById(updated.branch_id).catch(() => null);
    const taskDto = DeliveryTaskResponseDTO.from(updated, branch ?? undefined);
    const statusDto = OrderStatusResponseDTO.from(updated);
    this.io.to(`agent:${agentId}`).emit('task.assigned', taskDto);
    this.io.to(`customer:${updated.customer_id}`).emit('order.status_changed', statusDto);
    this.io.to(`branch:${updated.branch_id}`).emit('order.status_changed', statusDto);
    await this.cache.del(AssignmentService.offerKey(publicId));
    return taskDto;
  }

  /** GEOSEARCH + filter by presence:meta TTL + filter out busy agents. */
  private async findCandidates(lng: number, lat: number): Promise<number[]> {
    const overscan = env.delivery.candidates * 4;
    const raw = await this.cache.geosearchByRadius(
      PresenceService.geoKey(),
      lng,
      lat,
      env.delivery.radiusMeters,
      overscan,
    );

    const result: number[] = [];
    for (const idStr of raw) {
      const agentId = Number(idStr);
      if (!Number.isFinite(agentId)) continue;
      if (!(await this.cache.exists(PresenceService.metaKey(agentId)))) continue;
      if (await this.cache.sismember(PresenceService.busyKey(), idStr)) continue;
      result.push(agentId);
      if (result.length >= env.delivery.candidates) break;
    }
    return result;
  }
}
