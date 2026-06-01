import { Router } from 'express';
import { authController } from './controller/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/forget-password', authController.forgetPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
