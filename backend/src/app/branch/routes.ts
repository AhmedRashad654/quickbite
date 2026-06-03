import { Router } from 'express';
import { branchController } from './controller/branch.controller.js';
import { authenticate } from '../../lib/auth/guard.js';
import { rbac, requireBranchAccess, requireRestaurantMember } from '../../lib/auth/rbac.js';

export const branchRouter = Router();

branchRouter.get('/nearby', branchController.findNearby);
branchRouter.get('/:restaurantId', branchController.findByRestaurant);
branchRouter.post(
  '/:restaurantId',
  authenticate,
  requireRestaurantMember('restaurantId'),
  rbac({ resource: 'core:branch', action: 'create' }),
  branchController.create,
);
branchRouter.patch(
  '/:id',
  authenticate,
  requireBranchAccess('id'),
  rbac({ resource: 'core:branch', action: 'update' }),
  branchController.update,
);
branchRouter.patch('/:id/status', authenticate, branchController.updateStatus);
