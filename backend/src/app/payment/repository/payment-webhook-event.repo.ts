import { Knex } from 'knex';
import { PaymentWebhook, RecordWebhookInput } from '../types.js';
import { db } from '../../../lib/knex/knex.js';

export const WEBHOOK_EVENT_COLUMNS = [
  'id',
  'provider_id',
  'provider_event_id',
  'signature',
  'payload',
  'received_at',
  'processed_at',
  'process_error',
] as const;

export async function recordWebhookOrSkip(input: RecordWebhookInput, conn: Knex = db): Promise<PaymentWebhook | null> {
  const [rows] = await conn('payment_webhook_events')
    .insert({
      provider_id: input.providerId,
      provider_event_id: input.providerEventId,
      signature: input.signature,
      payload: JSON.stringify(input.payload),
    })
    .onConflict(['provider_id', 'provider_event_id'])
    .ignore()
    .returning(WEBHOOK_EVENT_COLUMNS);
  return rows || null;
}

export async function markWebhookProcessed(id: number, error: string | null, conn: Knex = db): Promise<void> {
  await conn('payment_webhook_events').where({ id }).update({
    processed_at: conn.fn.now(),
    process_error: error,
  });
}
