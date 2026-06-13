import { Router } from 'express';
import { container } from '../../lib/di/container.js';
import { authenticate } from '../../lib/auth/guard.js';
import { rbac, requireBranchAccess, requireRestaurantMember } from '../../lib/auth/rbac.js';
import { BranchController } from './controller/branch.controller.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { withCache } from '../../lib/cache/withCache.js';

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);

branchRouter.get('/nearby', withCache(), branchController.findNearby);
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
branchRouter.patch(
  '/:id/status',
  authenticate,
  branchController.updateStatus,
);
