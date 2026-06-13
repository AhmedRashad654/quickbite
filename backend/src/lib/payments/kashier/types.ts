import { EVENT_KASHEIR_WEBHOOK, STATUS_KASHEIR_WEBHOOK } from "./enums.js";

export interface CreateSessionResult {
  providerSessionId: string;
  redirectUrl: string;
  rawResponse: unknown;
  expiresAt?: string;
}

export interface VerifyWebhookInput {
  payload: Record<string, unknown>;
  signatureKeys: string[];
  signature: string;
}

export interface CreateSessionInput {
  merchantOrderId: string;
  amount: string;
  currency: string;
  description?: string;
  allowedMethods?: string;
  customerReference: string;
}

export interface IPaymentProvider {
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>;
  verifyWebhook(input: VerifyWebhookInput): boolean;
}

export interface KashierCreateSessionResponse {
  _id: string;
  status: string;
  sessionUrl: string;
  expireAt?: string;
  paymentParams?: {
    order?: string;
    amount?: string;
    currency?: string;
    hash?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

export interface KashierCreateSessionRequest {
  merchantId: string;
  paymentType: string; // e.g. "credit"
  amount: string; // major units, "18.40"
  currency: string; // "EGP"
  order: string; // merchant order ref (we pass our publicId)
  type: 'one-time';
  allowedMethods: string; // "card,wallet"
  enable3DS: boolean;
  serverWebhook: string;
  merchantRedirect?: string;
  failureRedirect?: boolean;
  description?: string;
  interactionSource?: 'ECOMMERCE';
  expireAt?: string;
  customer: { reference: string; email?: string };
}

export interface VerifyWebhookInput {
  /** raw signed query string ("k=v&k=v") OR object whose keys are listed in signatureKeys */
  payload: Record<string, unknown>;
  /** the value of signatureKeys[] from the inbound payload */
  signatureKeys: string[];
  /** the provider's signature header (hex-encoded HMAC-SHA256) */
  signature: string;
}

export interface KashierWebhookEnvelope {
  event: EVENT_KASHEIR_WEBHOOK;
  data: KashierWebhookData;
}

export interface KashierWebhookData {
  merchantOrderId: string;
  kashierOrderId: string;
  orderReference?: string;
  transactionId: string;
  status: STATUS_KASHEIR_WEBHOOK;
  method?: string;
  amount: number;
  currency: string;
  signatureKeys: string[];
  [k: string]: unknown;
}
