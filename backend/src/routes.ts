import { Router } from 'express';
import { healthRouter } from './app/health/health.routes.js';
import { usersRouter } from './app/users/routes.js';
import { authRouter } from './app/auth/route.js';
import { customerAddressRouter } from './app/customer_address/routes.js';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/user', usersRouter);
routes.use('/auth', authRouter);
routes.use('/customer/addresses', customerAddressRouter);
