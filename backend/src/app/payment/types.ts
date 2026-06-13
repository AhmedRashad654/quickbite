import { PaymentSessionStatus, TransactionMethod, TransactionStatus, TransactionType } from './enums.js';

export interface PaymentSession {
  id: number;
  order_id: number;
  provider_id: number;
  provider_session_id: string;
  redirect_url: string;
  amount: number;
  currency: string;
  status: PaymentSessionStatus;
  rawInit_payload: unknown;
  rawLast_payload: unknown | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentWebhook {
  id: number;
  provider_id: number;
  provider_event_id: string;
  signature: string;
  payload: unknown;
  received_at: Date;
  processed_at: Date | null;
  process_error: string | null;
}

export interface Transaction {
  id: number;
  order_id: number | null;
  transaction_type: TransactionType;
  method: TransactionMethod;
  provider_id: number | null;
  provider_reference_id: string | null;
  status: TransactionStatus;
  amount: number;
  currency: string;
  srcAcc_id: number | null;
  dstAcc_id: number | null;
  is_refunded: boolean;
  refunded_payment_id: number | null;
  idempotency_key: string | null;
  created_at: Date;
  updated_at: Date;

}

export interface UpdateSessionInput {
  status: PaymentSessionStatus;
  raw_last_payload?: unknown;
}

export interface CreateSessionRowInput {
  order_id: number;
  provider_id: number;
  provider_session_id: string;
  redirect_url: string;
  amount: number;
  currency: string;
  status: PaymentSessionStatus;
  raw_init_payload: unknown;
}

export interface InitOnlinePaymentResult {
  session: PaymentSession;
  expiresAt: string;
}

export interface CreateTransactionInput {
  order_id: number | null;
  transaction_type: TransactionType;
  method: TransactionMethod;
  provider_id: number | null;
  provider_reference_id: string | null;
  status: TransactionStatus;
  amount: number;
  currency: string;
  src_acc_id: number | null;
  dst_acc_id: number | null;
  idempotency_key: string | null;
}

export interface RecordWebhookInput {
  providerId: number;
  providerEventId: string;
  signature: string;
  payload: unknown;
}
