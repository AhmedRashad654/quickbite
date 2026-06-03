import { Router } from 'express';
import { healthRouter } from './app/health/health.routes.js';
import { usersRouter } from './app/users/routes.js';
import { authRouter } from './app/auth/route.js';
import { customerAddressRouter } from './app/customer_address/routes.js';
import { branchRouter } from './app/branch/routes.js';
import { restaurantRouter } from './app/restaurant/routes.js';
import { productRouter } from './app/product/routes.js';
import { rbacRouter } from './app/rbac/routes.js';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/user', usersRouter);
routes.use('/auth', authRouter);
routes.use('/customer/addresses', customerAddressRouter);
routes.use('/restaurant', restaurantRouter);
routes.use('/branches', branchRouter);
routes.use('/products', productRouter);
routes.use('/members', rbacRouter);
