import { env } from '../../config/env.js';
import { AppError } from '../../error/AppError.js';
import { retry } from '../../utils/retry.js';
import { verifyWebhookSignature } from './kashier.signature.js';
import {
  CreateSessionInput,
  CreateSessionResult,
  IPaymentProvider,
  KashierCreateSessionRequest,
  KashierCreateSessionResponse,
  VerifyWebhookInput,
} from './types.js';

export class kashierClient implements IPaymentProvider {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly paymentType: string;
  private readonly serverWebhookUrl: string;
  private readonly merchantRedirect?: string;
  private readonly failureRedirectEnabled?: boolean;
  private readonly sessionTimeoutSec: number;

  constructor() {
    this.baseUrl = env.kashier.baseUrl;
    this.merchantId = env.kashier.merchantId;
    this.apiKey = env.kashier.apiKey;
    this.secretKey = env.kashier.secretKey;
    this.paymentType = env.kashier.paymentType;
    this.serverWebhookUrl = env.kashier.webhookUrl;
    this.merchantRedirect = env.kashier.returnUrl;
    this.failureRedirectEnabled = false;
    this.sessionTimeoutSec = env.payments.sessionTimeoutMin * 60;
  }

  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const expireAt = new Date(Date.now() + this.sessionTimeoutSec * 1000).toISOString();
    const body: KashierCreateSessionRequest = {
      merchantId: this.merchantId,
      paymentType: this.paymentType,
      amount: input.amount,
      currency: input.currency,
      order: input.merchantOrderId,
      type: 'one-time',
      allowedMethods: input.allowedMethods ?? 'card,wallet',
      enable3DS: true,
      serverWebhook: this.serverWebhookUrl,
      merchantRedirect: this.merchantRedirect,
      failureRedirect: this.failureRedirectEnabled ?? false,
      description: input.description,
      interactionSource: 'ECOMMERCE',
      expireAt,
      customer: { reference: input.customerReference },
    };

    const response = await retry(
      async () => {
        const res = await fetch(`${this.baseUrl}/v3/payment/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.apiKey,
            Authorization: this.secretKey,
          },
          body: JSON.stringify(body),
        });
        if (res.status >= 500) {
          throw new Error(`kashier ${res.status}: ${await res.text().catch(() => '')}`);
        }
        if (!res.ok) {
          // Non-retryable upstream error (4xx) — surface verbatim.
          const text = await res.text().catch(() => '');
          const err = new Error(`kashier ${res.status}: ${text}`);
          (err as any).statusCode = res.status;
          (err as any).retryable = false;
          throw err;
        }
        return (await res.json()) as KashierCreateSessionResponse;
      },
      {
        attempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 1500,
        isRetryable: (err) => (err as any)?.retryable !== false,
      },
    );

    if (!response?._id || !response?.sessionUrl) {
      throw new AppError(`kashier: malformed session response: ${JSON.stringify(response)}`, 409);
    }

    return {
      providerSessionId: response._id,
      redirectUrl: response.sessionUrl,
      rawResponse: response,
      expiresAt: response.expireAt ?? expireAt,
    };
  }

  verifyWebhook(input: VerifyWebhookInput): boolean {
    return verifyWebhookSignature(input.payload, input.signatureKeys, this.apiKey, input.signature);
  }
}
