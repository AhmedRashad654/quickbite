import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { PresenceService } from './presence.service.js';
import { ICacheProvider } from '../../../lib/cache/cache.interface.js';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import { AssignmentService } from '../../assignment/service/assignment.service.js';
import { OrderStatusResponseDTO } from '../../order/dto/order.response.dto.js';
import { findOrderByPublicId, updateOrderCommission, updateOrderStatus } from '../../order/repository/order.repo.js';
import { OrderStatus, PaymentMethod } from '../../order/enums.js';
import { insertEarning } from '../repository/agent-earning.repo.js';
import { createTransactionIdempotent } from '../../payment/repository/transaction.repo.js';
import { TransactionMethod, TransactionStatus, TransactionType } from '../../payment/enums.js';
import { NotYourTaskError } from '../errors.js';
import { findBranchById } from '../../branch/repository/branch.repo.js';
import { logger } from '../../../lib/logger/logger.js';
import { env } from '../../../lib/config/env.js';
import { Order } from '../../order/types.js';
import { db } from '../../../lib/knex/knex.js';
import { upsertIncrement } from '../../finance/repository/restaurant-balance.repo.js';

@injectable()
export class SettlementService {
  constructor(
    @inject(TOKENS.PresenceService) private readonly presence: PresenceService,
    @inject(TOKENS.CacheProvider) private readonly cache: ICacheProvider,
  ) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async settleDelivered(publicId: string, agentId: number): Promise<Order> {

    // Pre-trx fetch (read-only) so we can pull commissionBps from core's cache
    // without holding row locks across an HTTP call.
    const order = await findOrderByPublicId(publicId);
    if (!order) throw new Error('OrderNotFound');
    if (order.delivery_agent_id !== agentId) throw NotYourTaskError;

    // Branch fetch is cached in core's read-through; failure => commission stays 0.
    let commissionBps = 0;
    try {
      const branch = await findBranchById(order.branch_id);
      commissionBps = Number(branch?.commission ?? 0);
    } catch (err) {
      logger.warn('settlement: branch fetch failed; commission set to 0', { publicId, error: (err as Error).message });
    }
    const commission = Math.floor((order.subtotal * commissionBps) / 10000);
    const earning = Math.floor((order.delivery_fee * env.delivery.agentEarningShareBps) / 10000);

    const trx = await db.transaction();
    let updated: Order;
    try {
      // Stamp commission FIRST so subsequent writes see the right number.
      await updateOrderCommission(publicId, commission, trx);

      // For COD, write the charge transaction now (succeeded; the agent took the cash).
      if (order.payment_method === PaymentMethod.COD) {
        await createTransactionIdempotent(
          {
            order_id: order.id,
            transaction_type: TransactionType.COD_COLLECTION,
            method: TransactionMethod.COD,
            provider_id: null,
            provider_reference_id: null,
            status: TransactionStatus.SUCCEEDED,
            amount: order.total,
            currency: order.currency,
            src_acc_id: order.customer_id,
            dst_acc_id: order.restaurant_owner_id,
            idempotency_key: `cod-collect:${order.public_id}`,
          },
          trx,
        );
      }

      // Commission: src=restaurant owner, dst=NULL (platform — no user record).
      if (commission > 0) {
        await createTransactionIdempotent(
          {
            order_id: order.id,
            transaction_type: TransactionType.COMMISSION,
            method: TransactionMethod.SYSTEM,
            provider_id: null,
            provider_reference_id: null,
            status: TransactionStatus.SUCCEEDED,
            amount: commission,
            currency: order.currency,
            src_acc_id: order.restaurant_owner_id,
            dst_acc_id: null,
            idempotency_key: `commission:${order.public_id}`,
          },
          trx,
        );
      }

      // Service fee: customer paid it as part of `total`. For COD the
      // cod_collection above credits `total` to the restaurant owner;
      // the service fee is owed back to the platform. Book the
      // restaurant → platform transfer explicitly so finance reconciles.
      if (order.service_fee > 0) {
        await createTransactionIdempotent(
          {
            order_id: order.id,
            transaction_type: TransactionType.ADJUSTMENT,
            method: TransactionMethod.SYSTEM,
            provider_id: null,
            provider_reference_id: null,
            status: TransactionStatus.SUCCEEDED,
            amount: order.service_fee,
            currency: order.currency,
            src_acc_id: order.restaurant_owner_id,
            dst_acc_id: null,
            idempotency_key: `service-fee:${order.public_id}`,
          },
          trx,
        );
      }

      // Delivery fee: same story — customer paid it inside `total`, it's
      // not the restaurant's money. Book restaurant → platform; the
      // agent's share is paid out separately via agent_earnings.
      if (order.delivery_fee > 0) {
        await createTransactionIdempotent(
          {
            order_id: order.id,
            transaction_type: TransactionType.ADJUSTMENT,
            method: TransactionMethod.SYSTEM,
            provider_id: null,
            provider_reference_id: null,
            status: TransactionStatus.SUCCEEDED,
            amount: order.delivery_fee,
            currency: order.currency,
            src_acc_id: order.restaurant_owner_id,
            dst_acc_id: null,
            idempotency_key: `delivery-fee:${order.public_id}`,
          },
          trx,
        );
      }

      // Restaurant balance: net of commission.
      const netToRestaurant = order.subtotal - commission;
      if (netToRestaurant !== 0) {
        await upsertIncrement(
          {
            restaurant_id: order.restaurant_id,
            currency: order.currency,
            delta: netToRestaurant,
          },
          trx,
        );
      }

      // Agent earning. UNIQUE(order_id) makes this idempotent.
      await insertEarning(
        {
          agent_id: order.delivery_agent_id!,
          order_id: order.id,
          amount: earning,
          currency: order.currency,
        },
        trx,
      );

      // Finally flip status to delivered.
      updated = await updateOrderStatus(publicId, OrderStatus.DELIVERED, 'delivered_at', trx);


      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }

    // After-commit Redis + WS — never publish state we then roll back.
    await this.presence.clearBusy(agentId);
    await this.cache.del(AssignmentService.claimKey(publicId));

    const statusDto = OrderStatusResponseDTO.from(updated);
    this.io.to(`customer:${updated.customer_id}`).emit('order.status_changed', statusDto);
    this.io.to(`branch:${updated.branch_id}`).emit('order.status_changed', statusDto);

    return updated;
  }
}
