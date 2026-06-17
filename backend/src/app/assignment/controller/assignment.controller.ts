import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { AssignmentService } from '../service/assignment.service.js';
import { sendSuccess } from '../../../lib/http/response.js';
import { AgentIdIsRequiredError } from '../../agent/errors.js';

@injectable()
export class AssignmentController {
  constructor(@inject(TOKENS.AssignmentService) private readonly assignment: AssignmentService) {}

  /** POST /owner/orders/:publicId/assign  body: { agentId } */
  ownerAssign = async (req: Request, res: Response) => {
    const agentId = Number((req.body ?? {}).agentId);
    if (!Number.isFinite(agentId) || agentId <= 0) throw AgentIdIsRequiredError;
    const dto = await this.assignment.ownerAssign(String(req.params.publicId), agentId);
    sendSuccess(res, dto);
  };
}
