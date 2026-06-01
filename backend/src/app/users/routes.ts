import { Router } from 'express';
import { usersController } from './controller/users.controller.js';
import { authenticate } from '../../lib/auth/guard.js';

export const usersRouter = Router();

usersRouter.get('/me', authenticate ,usersController.getMe);
usersRouter.patch('/me', authenticate, usersController.updateMe);
