import { Knex } from 'knex';
import { CreateSessionRowInput, PaymentSession, UpdateSessionInput } from '../types.js';
import { PaymentSessionStatus } from '../enums.js';
import { db } from '../../../lib/knex/knex.js';
import { toMs } from '../../../lib/utils/time.js';
import { env } from '../../../lib/config/env.js';

export const PAYMENT_SESSION_COLUMNS = [
  'id',
  'order_id',
  'provider_id',
  'provider_session_id',
  'redirect_url',
  'amount',
  'currency',
  'status',
  'raw_init_payload',
  'raw_last_payload',
  'created_at',
  'updated_at',
] as const;

export async function createSession(input: CreateSessionRowInput, conn: Knex = db): Promise<PaymentSession> {
  const [row] = await conn('payment_sessions')
    .insert({
      order_id: input.order_id,
      provider_id: input.provider_id,
      provider_session_id: input.provider_session_id,
      redirect_url: input.redirect_url,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      raw_init_payload: JSON.stringify(input.raw_init_payload),
    })
    .returning(PAYMENT_SESSION_COLUMNS);
  return row;
}

export async function findSessionByProviderId(providerSessionId: string, conn: Knex): Promise<PaymentSession | null> {
  const row = await conn('payment_sessions')
    .select(PAYMENT_SESSION_COLUMNS as unknown as string[])
    .where({ provider_session_id: providerSessionId })
    .first();
  return row || null;
}

export async function findActiveSessionByOrderId(orderId: number, conn: Knex = db): Promise<PaymentSession | null> {
  const sessionTtlMs = toMs(env.payments.sessionTimeoutMin, 'm');
  const minCreatedAt = new Date(Date.now() - sessionTtlMs);
  const row = await conn('payment_sessions')
    .select(PAYMENT_SESSION_COLUMNS as unknown as string[])
    .where('order_id', orderId)
    .whereIn('status', [PaymentSessionStatus.INITIALIZED, PaymentSessionStatus.PENDING])
    .where('created_at', '>=', minCreatedAt)
    .orderBy('id', 'desc')
    .first();
  return row || null;
}

export async function updateSession(id: number, input: UpdateSessionInput, conn: Knex): Promise<PaymentSession> {
  const update: Record<string, unknown> = {
    status: input.status,
    updated_at: conn.fn.now(),
  };
  if (input.raw_last_payload !== undefined) {
    update.raw_last_payload = JSON.stringify(input.raw_last_payload);
  }
  const [row] = await conn('payment_sessions')
    .where({ id })
    .update(update)
    .returning(PAYMENT_SESSION_COLUMNS as unknown as string[]);
  return row;
}
