import { Router } from 'express';
import { container } from '../../lib/di/container.js';
import { AssignmentController } from './controller/assignment.controller.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { authenticate } from '../../lib/auth/guard.js';
import { rbac } from '../../lib/auth/rbac.js';
import { idempotency } from '../../lib/idempotency/idempotency.js';

export const assignmentRouter = Router();

const assignmentController = container.resolve<AssignmentController>(TOKENS.AssignmentController);

// owner override — force-assigns regardless of distance / busy state.
// rbac{deliveries:assign} or system_admin (admin always bypasses).
assignmentRouter.post(
  '/owner/orders/:publicId/assign',
  authenticate,
  rbac({ resource: 'deliveries', action: 'assign' }),
  idempotency({ strict: true }),
  assignmentController.ownerAssign,
);
