import { env } from '../../lib/config/env.js';
import { register } from '../../lib/jobs/job-registry.js';
import { container } from '../../lib/di/container.js';
import { AssignmentService } from './service/assignment.service.js';
import { TOKENS } from '../../lib/di/tokens.js';
import { logger } from '../../lib/logger/logger.js';

export function registerAssignmentJobs(): void {
  const everyNSec = `*/${env.delivery.assignmentTickSec} * * * * *`;

  register({
    name: `assignment-tick`,
    cron: everyNSec,
    handler: async () => {
      const assignmentService = container.resolve<AssignmentService>(TOKENS.AssignmentService);
      const result = await assignmentService.tickRegion();

      if (result.processed > 0) {
        logger.info('assignment.tick processed successfully', { ...result });
      }
    },
  });
}
