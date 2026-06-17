import { Request, Response } from 'express';
import { BranchService } from '../service/branch.service.js';
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from '../dto/branch.dto.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { SystemRole } from '../../users/enums.js';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { sendSuccess } from '../../../lib/http/response.js';

@injectable()
export class BranchController {
  constructor(@inject(TOKENS.BranchService) private readonly branchService: BranchService) {}

  create = async (req: Request, res: Response) => {
    const data = await validateBody(CreateBranchDTO, req.body);
    const branch = await this.branchService.create(
      Number(req.params.restaurantId),
      req.user?.userId!,
      req.user?.role! as SystemRole,
      data,
    );
    sendSuccess(res, { message: 'Branch added', branch }, 201);
  };

  findNearby = async (req: Request, res: Response) => {
    const results = await this.branchService.findNearby(Number(req.query.lat), Number(req.query.lng));
    sendSuccess(res, { data: results });
  };

  findByRestaurant = async (req: Request, res: Response) => {
    const results = await this.branchService.findByRestaurant(Number(req.params.restaurantId));
    sendSuccess(res, { data: results });
  };

  update = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateBranchDTO, req.body);
    const branch = await this.branchService.update(
      Number(req.params.id),
      req.user?.userId!,
      req.user?.role! as SystemRole,
      data,
    );
    sendSuccess(res, { message: 'Branch updated', branch });
  };

  updateStatus = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateBranchStatusDTO, req.body);
    const branch = await this.branchService.updateStatus(Number(req.params.id), req.user?.role! as SystemRole, data);
    sendSuccess(res, {
      message: 'Branch status updated',
      branch: {
        id: branch.id,
        is_active: branch.is_active,
        accept_orders: branch.accept_orders,
        commission: branch.commission,
      },
    });
  };

}
