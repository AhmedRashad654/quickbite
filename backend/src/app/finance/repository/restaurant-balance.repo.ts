import { Knex } from 'knex';
import { RestaurantBalance } from '../types.js';
import { db } from '../../../lib/knex/knex.js';

const COLUMNS = ['restaurant_id', 'region', 'currency', 'balance', 'updated_at'] as const;

export async function findByRestaurant(restaurantId: number, conn: Knex = db): Promise<RestaurantBalance[]> {
  const rows = await conn('restaurant_balances')
    .select(COLUMNS as unknown as string[])
    .where({ restaurant_id: restaurantId });
  return rows;
}

export async function getForUpdate(
  restaurantId: number,
  currency: string,
  conn: Knex = db,
): Promise<RestaurantBalance | null> {
  const row = await conn('restaurant_balances')
    .select(COLUMNS as unknown as string[])
    .where({ restaurant_id: restaurantId, currency })
    .forUpdate()
    .first();
  return row || null;
}

/**
 * UPSERT-with-increment. Atomic: if no row exists for (restaurant_id, currency)
 * the supplied delta is the initial balance; if one does, it's added. Used by
 * the `delivered` settlement trx.
 */
export async function upsertIncrement(
  input: { restaurant_id: number; currency: string; delta: number },
  conn: Knex = db,
): Promise<RestaurantBalance> {
  const [row] = await conn
    .raw(
      `INSERT INTO restaurant_balances (restaurant_id, region, currency, balance, updated_at)
         VALUES (?, ?, ?, ?, NOW())
         ON CONFLICT (restaurant_id, currency)
         DO UPDATE SET balance = restaurant_balances.balance + EXCLUDED.balance,
                       updated_at = NOW()
         RETURNING ${COLUMNS.join(',')}`,
      [input.restaurant_id, input.currency, input.delta],
    )
    .then((res: any) => res.rows ?? res);
  return row;
}

/**
 * Decrement-with-floor. Used by recordPayout. Updates only when current
 * balance >= amount; returns undefined if it would go negative (caller
 * surfaces 409 InsufficientBalance).
 */
export async function decrementIfSufficient(
  input: { restaurantId: number; currency: string; amount: number },
  conn: Knex = db,
): Promise<RestaurantBalance | null> {
  const [row] = await conn('restaurant_balances')
    .where({ restaurant_id: input.restaurantId, currency: input.currency })
    .where('balance', '>=', input.amount)
    .update({
      balance: conn.raw('balance - ?', [input.amount]),
      updated_at: conn.fn.now(),
    })
    .returning(COLUMNS as unknown as string[]);
  return row || null;
}
