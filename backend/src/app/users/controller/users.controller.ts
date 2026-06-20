import { Request, Response } from 'express';
import { UserService } from '../service/users.service.js';
import { UpdateUserDTO } from '../dto/users.dto.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { sendSuccess } from '../../../lib/http/response.js';

@injectable()
export class UsersController {
  constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {}

  getMe = async (req: Request, res: Response) => {
    const user = await this.userService.getByUserId(req?.user?.userId!);
    sendSuccess(res, user);
  };

  updateMe = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateUserDTO, req.body);
    const user = await this.userService.updateProfile(req.user?.userId!, data);
    sendSuccess(res, user,'Profile updated');
  };
}
