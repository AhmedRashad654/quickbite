import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { MalformedWebhookError } from '../errors.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { KashierWebhookService } from '../service/kashier-webhook.service.js';
import { sendSuccess } from '../../../lib/http/response.js';

@injectable()
export class WebhookController {
  constructor(@inject(TOKENS.KashierWebhookService) private readonly kashierWebhook: KashierWebhookService) {}

  kashier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('[Kashier Webhook] Enter Controller');
      console.log('[Kashier Webhook] Headers received:', JSON.stringify(req.headers));
      
      if (!req.rawBody) {
        console.error('[Kashier Webhook Error] req.rawBody is MISSING or UNDEFINED! Check your body-parser configuration.');
        throw MalformedWebhookError;
      }

      console.log(`[Kashier Webhook] req.rawBody status: EXISTS, Type: ${typeof req.rawBody}, Length/Size: ${req.rawBody.length} bytes`);

      const sigHeader = req.headers['x-kashier-signature'];
      const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;
      console.log('[Kashier Webhook] Signature extracted:', signature);

      await this.kashierWebhook.processKashierWebhook(req.rawBody, signature);
      
      console.log('[Kashier Webhook] Processed successfully, sending response 200');
      sendSuccess(res, { success: true });
    } catch (err) {
      console.error('[Kashier Webhook Controller Catch]', err);
      next(err);
    }
  };
}
