import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { kashierClient } from '../../../lib/payments/kashier/kashier.client.js';
import { Server as IoServer } from 'socket.io';
import { container } from '../../../lib/di/container.js';
import { KashierWebhookEnvelope } from '../../../lib/payments/kashier/types.js';
import { InvalidWebhookSignatureError, MalformedWebhookError } from '../errors.js';
import { Logger } from '../../../lib/logger/logger.js';
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

const KASHIER_PROVIDER_ID = PAYMENT_PROVIDER_IDS[PaymentProviderName.KASHIER];

@injectable()
export class KashierWebhookService {
  constructor(
    @inject(TOKENS.KashierProvider) private readonly kashier: kashierClient,
    @inject(TOKENS.Logger) private readonly logger: Logger,
  ) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async processKashierWebhook(rawBody: Buffer, signatureHeader: string | undefined): Promise<void> {
    const envelope = this.parseEnvelope(rawBody);
    if (!signatureHeader) throw InvalidWebhookSignatureError;

    const ok = this.kashier.verifyWebhook({
      payload: envelope.data,
      signatureKeys: envelope.data.signatureKeys ?? [],
      signature: signatureHeader,
    });
    if (!ok) throw InvalidWebhookSignatureError;

    const recorded = await recordWebhookOrSkip({
      providerId: KASHIER_PROVIDER_ID,
      providerEventId: envelope.data.transactionId,
      signature: signatureHeader,
      payload: envelope,
    });

    if (!recorded) {
      this.logger.info('kashier webhook duplicate, skipping', { transactionId: envelope.data.transactionId });
      return;
    }

    try {
      await this.reconcile(envelope);
      await markWebhookProcessed(recorded.id, null);
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      this.logger.error('kashier webhook reconciliation failed', {
        transactionId: envelope.data.transactionId,
        error: msg,
      });
      await markWebhookProcessed(recorded.id, msg);
      throw err;
    }
  }

  private async reconcile(envelope: KashierWebhookEnvelope): Promise<void> {
    if (envelope.event !== EVENT_KASHEIR_WEBHOOK.PAY) {
      this.logger.info('kashier webhook event ignored', { event: envelope.event });
      return;
    }

    const order = await findOrderByPublicId(envelope.data.merchantOrderId);
    if (!order) {
      this.logger.warn('kashier webhook for unknown order', { merchantOrderId: envelope.data.merchantOrderId });
      return;
    }

    const session = await findActiveSessionByOrderId(order.id);
    if (!session) {
      this.logger.warn('kashier webhook with no active session for order', {
        merchantOrderId: envelope.data.merchantOrderId,
        kashierOrderId: envelope.data.kashierOrderId,
      });
      return;
    }

    const trx = await db.transaction();
    try {
      if (envelope.data.status === STATUS_KASHEIR_WEBHOOK.SUCCESS) {
        await updateSession(
          session.id,
          {
            status: PaymentSessionStatus.CAPTURED,
            raw_last_payload: envelope,
          },
          trx,
        );

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

        if (order.status === OrderStatus.PENDING_PAYMENT) {
          const placed = await updateOrderStatus(order.public_id, OrderStatus.PLACED, null, trx);
          const items = await findItemsByOrderIds([placed.id], trx);

          await trx.commit();
          this.io
            .to(`branch:${placed.branch_id}`)
            .emit('order.created', OrderSummaryResponseDTO.from(placed, items.length));
          this.io.to(`customer:${placed.customer_id}`).emit('order.status_changed', OrderStatusResponseDTO.from(placed));
          return;
        }
        await trx.commit();
        return;
      }

      await updateSession(
        session.id,
        {
          status: PaymentSessionStatus.FAILED,
          raw_last_payload: envelope,
        },
        trx,
      );

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

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  private parseEnvelope(rawBody: Buffer): KashierWebhookEnvelope {
    let parsed: any;
    try {
      parsed = JSON.parse(rawBody.toString('utf8'));
    } catch {
      throw MalformedWebhookError;
    }
    if (!parsed?.event || !parsed?.data?.transactionId || !Array.isArray(parsed?.data?.signatureKeys)) {
      throw MalformedWebhookError;
    }
    return parsed;
  }
}
