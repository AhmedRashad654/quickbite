import Mailjet from 'node-mailjet';
import { IEmailProvider } from './email.interface.js';
import { injectable } from 'tsyringe';
import { AppError } from '../error/AppError.js';
import { env } from '../config/env.js';

@injectable()
export class MailjetEmailProvider implements IEmailProvider {
  private readonly client: any;

  constructor() {
    this.client = new (Mailjet as any)({
      apiKey: env.mailjet.mailjetApiKey,
      apiSecret: env.mailjet.mailjetSecretKey,
    });
  }
  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.client.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: env.mailjet.mailjetFromEmail,
              Name: env.mailjet.mailjetFromName,
            },
            To: [
              {
                Email: to,
              },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
    } catch {
      throw new AppError('Failed to send email via Mailjet', 400);
    }
  }
}
