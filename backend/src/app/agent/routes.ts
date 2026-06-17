import { Router } from 'express';
import { container } from '../../lib/di/container.js';
import { AgentController } from './controller/agent.controller.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { authenticate } from '../../lib/auth/guard.js';
import { requireAgent } from '../../lib/auth/rbac.js';
import { idempotency } from '../../lib/idempotency/idempotency.js';

export const agentRouter = Router();

const ctrl = container.resolve<AgentController>(TOKENS.AgentController);

// Presence — online + ping share the same UPSERT handler; offline is its own
// thing because it has the "can't go offline while picked" rule.
agentRouter.post('/presence/online', authenticate, requireAgent, ctrl.presenceUpsert);
agentRouter.post('/presence/ping', authenticate, requireAgent, ctrl.presenceUpsert);
agentRouter.post('/presence/offline', authenticate, requireAgent, ctrl.offline);

// Offers
agentRouter.post(
  '/orders/:publicId/accept',
  authenticate,
  requireAgent,
  idempotency({ strict: true }),
  ctrl.accept,
);
agentRouter.post('/agents/orders/:publicId/reject', authenticate, requireAgent, ctrl.reject);

// In-flight transitions (picked / delivered)
agentRouter.patch(
  '/orders/:publicId/status',
  authenticate,
  requireAgent,
  idempotency({ strict: true }),
  ctrl.transition,
);

// Reads
agentRouter.get('/tasks', authenticate, requireAgent, ctrl.tasks);
agentRouter.get('/earnings', authenticate, requireAgent, ctrl.earnings);
