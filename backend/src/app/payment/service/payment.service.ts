import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { InitOnlinePaymentResult } from '../types.js';
import { toMs } from '../../../lib/utils/time.js';
import { env } from '../../../lib/config/env.js';
import { Order } from '../../order/types.js';
import { createSession, findActiveSessionByOrderId } from '../repository/payment-session.repo.js';
import { fromMinor } from '../../../lib/utils/money.js';
import { Logger } from '../../../lib/logger/logger.js';
import { PaymentProviderUnavailableError } from '../errors.js';
import { PAYMENT_PROVIDER_IDS, PaymentProviderName, PaymentSessionStatus } from '../enums.js';
import { kashierClient } from '../../../lib/payments/kashier/kashier.client.js';

@injectable()
export class PaymentService {
  constructor(
    @inject(TOKENS.KashierProvider) private readonly kashier: kashierClient,
    @inject(TOKENS.Logger) private readonly logger: Logger,
  ) {}

  async initOnlinePayment(order: Order): Promise<InitOnlinePaymentResult> {
    const sessionTtlMs = toMs(env.payments.sessionTimeoutMin, 'm');

    const existing = await findActiveSessionByOrderId(Number(order.id));
    if (existing) {
      const expiresAt = new Date(existing.created_at.getTime() + sessionTtlMs).toISOString();
      return {
        session: existing,
        expiresAt,
      };
    }

    let providerResp;
    try {
      providerResp = await this.kashier.createSession({
        merchantOrderId: order.public_id,
        amount: fromMinor(order.total).toFixed(2),
        currency: order.currency,
        description: `QuickBite order ${order.public_id}`,
        allowedMethods: 'card,wallet',
        customerReference: String(order.customer_id),
      });
    } catch (err) {
      this.logger.error('kashier createSession failed', {
        orderPublicId: order.public_id,
        error: (err as Error).message,
      });
      throw PaymentProviderUnavailableError;
    }

    const session = await createSession({
      order_id: order.id,
      provider_id: PAYMENT_PROVIDER_IDS[PaymentProviderName.KASHIER],
      provider_session_id: providerResp.providerSessionId,
      redirect_url: providerResp.redirectUrl,
      amount: order.total,
      currency: order.currency,
      status: PaymentSessionStatus.INITIALIZED,
      raw_init_payload: providerResp.rawResponse,
    });

    const expiresAt = providerResp.expiresAt ?? new Date(Date.now() + sessionTtlMs).toISOString();

    return {
      session,
      expiresAt,
    };
  }
}
