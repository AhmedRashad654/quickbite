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
      if (!req.rawBody) throw MalformedWebhookError;

      const sigHeader = req.headers['x-kashier-signature'];
      const signature = Array.isArray(sigHeader) ? sigHeader[0] : sigHeader;

      await this.kashierWebhook.processKashierWebhook(req.rawBody, signature);
      sendSuccess(res, { success: true });
    } catch (err) {
      next(err);
    }
  };
}
