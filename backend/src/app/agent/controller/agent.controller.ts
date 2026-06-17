import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { PresenceService } from '../service/presence.service.js';
import { AgentService } from '../service/agent.service.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { PresenceLocationRequestDTO } from '../dto/agent.request.dto.js';
import { sendSuccess } from '../../../lib/http/response.js';
import { OrderStatus } from '../../order/enums.js';

@injectable()
export class AgentController {
  constructor(
    @inject(TOKENS.PresenceService) private readonly presence: PresenceService,
    @inject(TOKENS.AgentService) private readonly agent: AgentService,
  ) {}

  /**
   * Online and ping share the same write — UPSERT presence + extend TTL.
   * Both /agents/presence/online and /agents/presence/ping route here.
   */
  presenceUpsert = async (req: Request, res: Response) => {
    const data = await validateBody(PresenceLocationRequestDTO, req.body);
    await this.presence.upsert(req.user!.userId, data.lat, data.lng);
    sendSuccess(res, { ok: true });
  };

  offline = async (req: Request, res: Response) => {
    await this.presence.goOffline(req.user!.userId);
    sendSuccess(res, { ok: true });
  };

  accept = async (req: Request, res: Response) => {
    const dto = await this.agent.accept(String(req.params.publicId), req.user!.userId);
    sendSuccess(res, dto);
  };

  reject = async (req: Request, res: Response) => {
    await this.agent.reject(String(req.params.publicId), req.user!.userId);
    sendSuccess(res, { ok: true });
  };

  /** Body: { status: 'picked' | 'delivered' } */
  transition = async (req: Request, res: Response) => {
    const target = String((req.body ?? {}).status) as OrderStatus;
    if (target !== OrderStatus.PICKED && target !== OrderStatus.DELIVERED) {
      return res.status(400).json({ error: "status must be 'picked' or 'delivered'" });
    }
    const dto = await this.agent.transition(String(req.params.publicId), req.user!.userId, target);
    sendSuccess(res, dto);
  };

  tasks = async (req: Request, res: Response) => {
    const status = req.query.status ? String(req.query.status) : undefined;
    const list = await this.agent.listTasks(req.user!.userId, status);
    sendSuccess(res, list);
  };

  earnings = async (req: Request, res: Response) => {
    const now = new Date();
    const defaultFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const from = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
    const to = req.query.to ? new Date(String(req.query.to)) : now;
    const dto = await this.agent.earnings(req.user!.userId, from, to);
    sendSuccess(res, dto);
  };
}
