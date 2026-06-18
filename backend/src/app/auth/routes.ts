import { Router } from 'express';
import { container } from '../../lib/di/container.js';
import { AuthController } from './controller/auth.controller.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { idempotency } from '../../lib/idempotency/idempotency.js';
import { toSeconds } from '../../lib/utils/time.js';

export const authRouter = Router();
const ctrl = container.resolve<AuthController>(TOKENS.AuthController);

authRouter.post('/register', ctrl.register);
authRouter.post('/login', ctrl.login);
authRouter.post('/forget-password', idempotency({ strict: true, ttlSeconds: toSeconds(1, 'm') }), ctrl.forgetPassword);
authRouter.post('/reset-password', ctrl.resetPassword);
authRouter.post('/refresh', ctrl.refresh);
authRouter.post('/logout', ctrl.logout);
