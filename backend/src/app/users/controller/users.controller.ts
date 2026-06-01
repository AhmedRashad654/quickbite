import { Request, Response } from 'express';
import { userService, UserService } from '../service/users.service.js';
import { UpdateUserDTO } from '../dto/users.dto.js';
import { validateBody } from '../../../lib/validation/validate.js';

export class UsersController {
  constructor(private readonly userService: UserService) {}

  getMe = async (req: Request, res: Response) => {
    const user = await this.userService.getByUserId(req?.user?.userId!);
    return res.status(200).json(user);
  };

  updateMe = async (req: Request, res: Response) => {
    const data = await validateBody(UpdateUserDTO, req.body);
    const user = await this.userService.updateProfile(req.user?.userId!, data);
    res.status(200).json({ message: 'Profile updated', user });
  };
}

export const usersController = new UsersController(userService);
