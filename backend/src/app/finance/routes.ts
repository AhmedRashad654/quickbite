import { Router } from 'express';
import { FinanceController } from './controller/finance.controller.js';
import { container } from '../../lib/di/container.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { authenticate } from '../../lib/auth/guard.js';
import { rbac, requireRestaurantMember } from '../../lib/auth/rbac.js';
import { idempotency } from '../../lib/idempotency/idempotency.js';

export const financeRouter = Router();

const ctrl = container.resolve<FinanceController>(TOKENS.FinanceController);

// Restaurant-scoped reads. requireRestaurantMember pins :restaurantId to the
// JWT's restaurantId; system_admin bypasses.
financeRouter.get(
  '/restaurants/:restaurantId/balance',
  authenticate,
  requireRestaurantMember('restaurantId'),
  rbac({ resource: 'finance', action: 'read' }),
  ctrl.getBalance,
);

financeRouter.get(
  '/restaurants/:restaurantId/payouts',
  authenticate,
  requireRestaurantMember('restaurantId'),
  rbac({ resource: 'finance', action: 'read' }),
  ctrl.listPayouts,
);

// Admin-only write. requireRestaurantMember would block non-admins anyway, but
// rbac covers admin bypass + future operator role.
financeRouter.post(
  '/admin/restaurants/:restaurantId/payouts',
  authenticate,
  rbac({ resource: 'finance', action: 'payout_create' }),
  idempotency({ strict: true }),
  ctrl.createPayout,
);
