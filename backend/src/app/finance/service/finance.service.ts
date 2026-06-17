import { injectable } from 'tsyringe';
import { decrementIfSufficient, findByRestaurant } from '../repository/restaurant-balance.repo.js';
import { PayoutResponseDTO, RestaurantBalanceResponseDTO } from '../dto/finance.response.dto.js';
import { createTransaction, findPayouts } from '../../payment/repository/transaction.repo.js';
import { findRestaurantById } from '../../restaurant/repository/restaurant.repo.js';
import { CreatePayoutRequestDTO } from '../dto/finance.request.dto.js';
import { db } from '../../../lib/knex/knex.js';
import { InsufficientBalanceError, RestaurantNotFoundError } from '../errors.js';
import { TransactionMethod, TransactionStatus, TransactionType } from '../../payment/enums.js';

@injectable()
export class FinanceService {
  async getBalance(restaurantId: number): Promise<RestaurantBalanceResponseDTO> {
    const rows = await findByRestaurant(restaurantId);
    return RestaurantBalanceResponseDTO.from(restaurantId, rows);
  }

  async listPayouts(restaurantId: number, from: Date, to: Date, limit: number): Promise<PayoutResponseDTO[]> {
    const restaurant = await findRestaurantById(restaurantId);
    const ownerId = restaurant?.owner_id;
    if (!ownerId) return [];
    const rows = await findPayouts({ ownerId, from, to }, limit);
    return rows.map(PayoutResponseDTO.from);
  }

  /**
   * Admin-only. Records an externally-completed bank transfer and decrements
   * the balance atomically. Idempotent on `idempotency_key` (set by the
   * idempotency middleware via the `Idempotency-Key` header).
   */
  async recordPayout(body: CreatePayoutRequestDTO, idempotencyKey: string): Promise<PayoutResponseDTO> {
    const restaurant = await findRestaurantById(body.restaurant_id);
    const ownerId = restaurant?.owner_id;
    if (!ownerId) throw RestaurantNotFoundError;

    const trx = await db.transaction();
    try {
      const decremented = await decrementIfSufficient(
        { restaurantId: body.restaurant_id, currency: body.currency, amount: body.amount },
        trx,
      );
      if (!decremented) {
        await trx.rollback();
        throw InsufficientBalanceError;
      }
      const tx = await createTransaction(
        {
          order_id: null,
          transaction_type: TransactionType.PAYOUT,
          method: TransactionMethod.BANK_TRANSFER,
          provider_id: null,
          provider_reference_id: body.provider_reference_id,
          status: TransactionStatus.SUCCEEDED,
          amount: body.amount,
          currency: body.currency,
          src_acc_id: null, // platform → restaurant: no platform user record
          dst_acc_id: ownerId,
          idempotency_key: idempotencyKey,
        },
        trx,
      );
      await trx.commit();
      return PayoutResponseDTO.from(tx);
    } catch (err) {
      // If trx is already rolled back (InsufficientBalance) this is a no-op.
      try {
        await trx.rollback();
      } catch {}
      throw err;
    }
  }
}
