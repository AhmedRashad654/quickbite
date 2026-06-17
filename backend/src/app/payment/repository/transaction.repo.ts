import { Knex } from 'knex';
import { CreateTransactionInput, Transaction } from '../types.js';
import { db } from '../../../lib/knex/knex.js';

export const TRANSACTION_COLUMNS = [
  'id',
  'order_id',
  'transaction_type',
  'method',
  'provider_id',
  'provider_reference_id',
  'status',
  'amount',
  'currency',
  'src_acc_id',
  'dst_acc_id',
  'is_refunded',
  'refunded_payment_id',
  'idempotency_key',
  'created_at',
  'updated_at',
] as const;

export async function createTransaction(input: CreateTransactionInput, conn: Knex): Promise<Transaction> {
  const [row] = await conn('transactions')
    .insert({
      order_id: input.order_id,
      transaction_type: input.transaction_type,
      method: input.method,
      provider_id: input.provider_id,
      provider_reference_id: input.provider_reference_id,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      src_acc_id: input.src_acc_id,
      dst_acc_id: input.dst_acc_id,
      idempotency_key: input.idempotency_key,
    })
    .returning(TRANSACTION_COLUMNS);
  return row;
}

export async function createTransactionIdempotent(
  input: CreateTransactionInput,
  conn: Knex,
): Promise<Transaction | null> {
  const [row] = await conn('transactions')
    .insert({
      order_id: input.order_id,
      transaction_type: input.transaction_type,
      method: input.method,
      provider_id: input.provider_id,
      provider_reference_id: input.provider_reference_id,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      src_acc_id: input.src_acc_id,
      dst_acc_id: input.dst_acc_id,
      idempotency_key: input.idempotency_key,
    })
    .onConflict('idempotency_key')
    .ignore()
    .returning(TRANSACTION_COLUMNS as unknown as string[]);

  return row || null;
}

export async function findTransactionById(id: number, conn: Knex = db): Promise<Transaction | null> {
  const row = await conn('transactions')
    .select(TRANSACTION_COLUMNS as unknown as string[])
    .where({ id })
    .first();
  return row || null;
}

export async function findTransactionWithRestaurant(
  id: number,
  conn: Knex = db,
): Promise<
  | {
      transaction: Transaction;
      restaurantId: number | null;
    }
  | undefined
> {
  const row = await conn('transactions as t')
    .leftJoin('orders as o', 'o.id', 't.order_id')
    .select([...TRANSACTION_COLUMNS.map((c) => `t.${c}`), 'o.restaurant_id as _restaurant_id'])
    .where('t.id', id)
    .first();
  if (!row) return undefined;
  return {
    transaction: row,
    restaurantId: row._restaurant_id !== null && row._restaurant_id !== undefined ? Number(row._restaurant_id) : null,
  };
}

export async function findTransactionByIdempotencyKey(key: string, conn: Knex = db): Promise<Transaction | null> {
  const row = await conn('transactions')
    .select(TRANSACTION_COLUMNS as unknown as string[])
    .where({ idempotency_key: key })
    .first();
  return row || null;
}

export async function findPayouts(
  filter: { ownerId: number; from: Date; to: Date },
  limit: number,
  conn: Knex = db,
): Promise<Transaction[]> {
  const rows = await conn('transactions')
    .select(TRANSACTION_COLUMNS as unknown as string[])
    .where('transaction_type', 'payout')
    .where('dst_acc_id', filter.ownerId)
    .where('created_at', '>=', filter.from)
    .where('created_at', '<', filter.to)
    .orderBy('created_at', 'desc')
    .limit(limit);
  return rows;
}

export async function findTransactionsByOrderIds(orderIds: number[], conn: Knex = db): Promise<Transaction[]> {
  if (orderIds.length === 0) return [];
  const rows = await conn('transactions')
    .select(TRANSACTION_COLUMNS as unknown as string[])
    .whereIn('order_id', orderIds)
    .orderBy('id', 'asc');
  return rows;
}
