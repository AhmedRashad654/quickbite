import { Router } from 'express';
import { restaurantController } from './controller/restaurant.controller.js';
import { authenticate } from '../../lib/auth/guard.js';
import { rbac, requireRestaurantMember } from '../../lib/auth/rbac.js';

export const restaurantRouter = Router();

restaurantRouter.get('/', restaurantController.getAll);
restaurantRouter.get('/:id', restaurantController.getById);
restaurantRouter.post('/', authenticate, restaurantController.createWithOwner);
restaurantRouter.patch(
  '/:id',
  authenticate,
  requireRestaurantMember('id'),
  rbac({ resource: 'core:restaurant', action: 'update' }),
  restaurantController.update,
);
restaurantRouter.patch('/:id/status', authenticate, restaurantController.updateStatus);
