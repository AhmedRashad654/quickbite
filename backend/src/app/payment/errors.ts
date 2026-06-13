import { AppError } from '../../lib/error/AppError.js';

export const PaymentProviderUnavailableError = new AppError('Payment provider unavailable', 503);
export const InvalidWebhookSignatureError = new AppError('InvalidSignature', 401);
export const MalformedWebhookError = new AppError('MalformedWebhook', 400);
