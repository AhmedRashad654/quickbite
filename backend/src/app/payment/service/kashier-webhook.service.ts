import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import { KashierWebhookEnvelope } from '../../../lib/payments/kashier/types.js';
import { InvalidWebhookSignatureError, MalformedWebhookError } from '../errors.js';
import { markWebhookProcessed, recordWebhookOrSkip } from '../repository/payment-webhook-event.repo.js';
import { PAYMENT_PROVIDER_IDS, PaymentProviderName, PaymentSessionStatus, TransactionMethod, TransactionStatus, TransactionType } from '../enums.js';
import { EVENT_KASHEIR_WEBHOOK, STATUS_KASHEIR_WEBHOOK } from '../../../lib/payments/kashier/enums.js';
import { findOrderByPublicId, updateOrderStatus } from '../../order/repository/order.repo.js';
import { findActiveSessionByOrderId, updateSession } from '../repository/payment-session.repo.js';
import { db } from '../../../lib/knex/knex.js';
import { createTransaction } from '../repository/transaction.repo.js';
import { OrderStatus } from '../../order/enums.js';
import { findItemsByOrderIds } from '../../order/repository/order-item.repo.js';
import { OrderStatusResponseDTO, OrderSummaryResponseDTO } from '../../order/dto/order.response.dto.js';
import { logger } from '../../../lib/logger/logger.js';
import { kashierClient } from '../../../lib/payments/kashier/kashier.client.js';

const KASHIER_PROVIDER_ID = PAYMENT_PROVIDER_IDS[PaymentProviderName.KASHIER];

@injectable()
export class KashierWebhookService {
  constructor(@inject(TOKENS.KashierProvider) private readonly kashier: kashierClient) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async processKashierWebhook(rawBody: Buffer, signatureHeader: string | undefined): Promise<void> {
    console.log('[Kashier Service] Starting processKashierWebhook...');

    const envelope = this.parseEnvelope(rawBody);
    console.log('[Kashier Service] Envelope parsed successfully. Event:', envelope.event, 'TransactionID:', envelope.data?.transactionId);

    if (!signatureHeader) {
      console.error('[Kashier Service Error] Missing signatureHeader!');
      throw InvalidWebhookSignatureError;
    }

    console.log('[Kashier Service] Verifying Webhook Signature via client...');
    const ok = this.kashier.verifyWebhook({
      payload: envelope.data,
      signatureKeys: envelope.data.signatureKeys ?? [],
      signature: signatureHeader,
    });

    if (!ok) {
      console.error('[Kashier Service Error] Webhook signature verification FAILED!');
      throw InvalidWebhookSignatureError;
    }
    console.log('[Kashier Service] Webhook signature verified successfully! ✅');

    const recorded = await recordWebhookOrSkip({
      providerId: KASHIER_PROVIDER_ID,
      providerEventId: envelope.data.transactionId,
      signature: signatureHeader,
      payload: envelope,
    });

    if (!recorded) {
      logger.info('kashier webhook duplicate, skipping', { transactionId: envelope.data.transactionId });
      return;
    }

    try {
      console.log('[Kashier Service] Reconciling transaction...');
      await this.reconcile(envelope);
      await markWebhookProcessed(recorded.id, null);
      console.log('[Kashier Service] Reconciliation done. Webhook finished completely. 🎉');
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      logger.error('kashier webhook reconciliation failed', {
        transactionId: envelope.data.transactionId,
        error: msg,
      });
      await markWebhookProcessed(recorded.id, msg);
      throw err;
    }
  }

  private async reconcile(envelope: KashierWebhookEnvelope): Promise<void> {
    console.log('[Kashier Reconcile] Starting reconciliation for merchantOrderId:', envelope.data?.merchantOrderId);

    if (envelope.event !== EVENT_KASHEIR_WEBHOOK.PAY) {
      logger.info('kashier webhook event ignored', { event: envelope.event });
      console.log(`[Kashier Reconcile] Event ignored because it is not PAY. Event received: ${envelope.event}`);
      return;
    }

    console.log('[Kashier Reconcile] Fetching order from DB via publicId:', envelope.data.merchantOrderId);
    const order = await findOrderByPublicId(envelope.data.merchantOrderId);
    if (!order) {
      logger.warn('kashier webhook for unknown order', { merchantOrderId: envelope.data.merchantOrderId });
      console.error('[Kashier Reconcile Error] Order NOT FOUND in DB for merchantOrderId:', envelope.data.merchantOrderId);
      return;
    }
    console.log(`[Kashier Reconcile] Order found. Internal Order ID: ${order.id}, Current Status: ${order.status}`);

    console.log('[Kashier Reconcile] Fetching active payment session for Order ID:', order.id);
    const session = await findActiveSessionByOrderId(order.id);
    if (!session) {
      logger.warn('kashier webhook with no active session for order', {
        merchantOrderId: envelope.data.merchantOrderId,
        kashierOrderId: envelope.data.kashierOrderId,
      });
      console.error('[Kashier Reconcile Error] No ACTIVE session found for Order ID:', order.id);
      return;
    }
    console.log(`[Kashier Reconcile] Active session found. Session ID: ${session.id}, Amount: ${session.amount} ${session.currency}`);

    console.log('[Kashier Reconcile] Starting Database Transaction (trx)...');
    const trx = await db.transaction();

    try {
      console.log('[Kashier Reconcile] Checking Kashier transaction status:', envelope.data.status);

      if (envelope.data.status === STATUS_KASHEIR_WEBHOOK.SUCCESS) {
        console.log('[Kashier Reconcile] Status is SUCCESS. Updating session to CAPTURED...');
        await updateSession(
          session.id,
          {
            status: PaymentSessionStatus.CAPTURED,
            raw_last_payload: envelope,
          },
          trx,
        );

        console.log('[Kashier Reconcile] Creating success transaction record...');
        await createTransaction(
          {
            order_id: order.id,
            transaction_type: TransactionType.CHARGE,
            method: TransactionMethod.ONLINE,
            provider_id: KASHIER_PROVIDER_ID,
            provider_reference_id: envelope.data.transactionId,
            status: TransactionStatus.SUCCEEDED,
            amount: session.amount,
            currency: session.currency,
            src_acc_id: order.customer_id,
            dst_acc_id: order.restaurant_owner_id!,
            idempotency_key: `kashier:${envelope.data.transactionId}`,
          },
          trx,
        );

        console.log(`[Kashier Reconcile] Checking if order status needs update. Current: ${order.status}`);
        if (order.status === OrderStatus.PENDING_PAYMENT) {
          console.log('[Kashier Reconcile] Order is PENDING_PAYMENT. Updating to PLACED...');
          const placed = await updateOrderStatus(order.public_id, OrderStatus.PLACED, null, trx);

          console.log('[Kashier Reconcile] Fetching order items for WebSocket payload...');
          const items = await findItemsByOrderIds([placed.id], trx);

          console.log('[Kashier Reconcile] Committing DB Transaction (Success Path - Status Updated)...');
          await trx.commit();
          console.log('[Kashier Reconcile] DB Transaction committed successfully! ✅');

          console.log('[Kashier Reconcile] Triggering WebSockets emits...');
          console.log(`[Kashier Ws] Emitting order.created to branch:${placed.branch_id}`);
          this.io.to(`branch:${placed.branch_id}`).emit('order.created', OrderSummaryResponseDTO.from(placed, items.length));

          console.log(`[Kashier Ws] Emitting order.status_changed to customer:${placed.customer_id}`);
          this.io.to(`customer:${placed.customer_id}`).emit('order.status_changed', OrderStatusResponseDTO.from(placed));
          return;
        }

        console.log('[Kashier Reconcile] Committing DB Transaction (Success Path - No Status Update Needed)...');
        await trx.commit();
        console.log('[Kashier Reconcile] DB Transaction committed successfully! ✅');
        return;
      }

      console.log('[Kashier Reconcile] Status is NOT success. Updating session to FAILED...');
      await updateSession(
        session.id,
        {
          status: PaymentSessionStatus.FAILED,
          raw_last_payload: envelope,
        },
        trx,
      );

      console.log('[Kashier Reconcile] Creating failed transaction record...');
      await createTransaction(
        {
          order_id: order.id,
          transaction_type: TransactionType.CHARGE,
          method: TransactionMethod.ONLINE,
          provider_id: KASHIER_PROVIDER_ID,
          provider_reference_id: envelope.data.transactionId,
          status: TransactionStatus.FAILED,
          amount: session.amount,
          currency: session.currency,
          src_acc_id: order.customer_id,
          dst_acc_id: null,
          idempotency_key: `kashier:${envelope.data.transactionId}`,
        },
        trx,
      );

      console.log('[Kashier Reconcile] Committing DB Transaction (Failed Payment Path)...');
      await trx.commit();
      console.log('[Kashier Reconcile] DB Transaction committed successfully for failed payment. ✅');
    } catch (err) {
      console.error('[Kashier Reconcile Catch Error] Something crashed inside try block. Rolling back trx...');
      try {
        await trx.rollback();
        console.log('[Kashier Reconcile] DB Transaction rollback completed.');
      } catch (rollbackErr) {
        console.error('[Kashier Reconcile] CRITICAL: DB Rollback failed too!', rollbackErr);
      }
      throw err;
    }
  }

  private parseEnvelope(rawBody: Buffer): KashierWebhookEnvelope {
    const rawString = rawBody.toString('utf8');
    console.log('[Kashier Service] Raw string payload to parse:', rawString);

    let parsed: any;
    try {
      parsed = JSON.parse(rawString);
    } catch (parseError) {
      console.error('[Kashier Service Error] JSON.parse FAILED! Raw content might not be valid JSON.', parseError);
      throw MalformedWebhookError;
    }

    console.log('[Kashier Service] JSON parsed correctly. Checking structure properties...');
    console.log('[Kashier Service Struct Check] event:', parsed?.event);
    console.log('[Kashier Service Struct Check] transactionId:', parsed?.data?.transactionId);
    console.log('[Kashier Service Struct Check] isSignatureKeysArray:', Array.isArray(parsed?.data?.signatureKeys));

    if (!parsed?.event || !parsed?.data?.transactionId || !Array.isArray(parsed?.data?.signatureKeys)) {
      console.error(
        '[Kashier Service Error] Validation FAILED! One or more required fields (event, data.transactionId, data.signatureKeys) are missing or invalid.',
      );
      throw MalformedWebhookError;
    }

    return parsed;
  }
}
