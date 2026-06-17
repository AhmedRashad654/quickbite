import { Request, Response, NextFunction } from 'express';
import { NotAuthenticated } from './error.js';
import { SystemRole } from '../../app/users/enums.js';
import { container } from '../../lib/di/container.js';
import { TOKENS } from '../di/tokens.js';
import { PermissionCacheService } from '../../app/rbac/service/permission-cache.service.js';
import { getRestaurantIdByBranch } from '../../app/branch/repository/branch.repo.js';

export interface RBACOptions {
  resource: string;
  action: string;
  allowSystemAdmin?: boolean; // by default will be true
}
// check for permissions
// system admin bypass this
// restaurant users must have permissions for their role

export function rbac(options: RBACOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw NotAuthenticated;
      }

      const { resource, action, allowSystemAdmin = true } = options;

      if (allowSystemAdmin && req.user.role == SystemRole.SYSTEM_ADMIN) {
        return next();
      }

      if (req.user.role == SystemRole.RESTAURANT_USER) {
        const currentMembership = req.currentMembership;

        if (!currentMembership) {
          return res.status(500).json({
            error: 'Security Configuration Error: Missing tenant validation middleware before RBAC',
          });
        }

        if (currentMembership.restaurantRole === 'owner') {
          return next();
        }

        const permissionCacheService = container.resolve<PermissionCacheService>(TOKENS.PermissionCacheService);

        const permissions = await permissionCacheService.getPermissions(currentMembership.restaurantRole);

        if (!permissionCacheService.hasPermission(permissions, resource, action)) {
          return res.status(403).json({
            error: 'Permission denied',
          });
        }

        return next();
      }

      return res.status(403).json({
        error: 'Permission denied',
      });
    } catch (error) {
      next(error);
    }
  };
}

export function requireRestaurantMember(paramName: string = 'restaurantId') {
  return (req: Request, res: Response, next: NextFunction) => {
    const restaurantId = parseInt(req.params[paramName] as string); // req.params.restaurantId
    if (!restaurantId) {
      return res.status(500).json({ message: 'something went wrong' });
    }

    if (req.user?.role == SystemRole.SYSTEM_ADMIN) {
      return next();
    }
    const currentMembership = req.user?.memberships?.find((m) => Number(m.restaurantId) === Number(restaurantId));

    if (!currentMembership) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    req.currentMembership = currentMembership;

    next();
  };
}

export function requireBranchAccess(paramName: string = 'branchId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role == SystemRole.SYSTEM_ADMIN) {
        return next();
      }

      const branchId = parseInt(req.params[paramName] as string) || parseInt(req.query[paramName] as string);
      if (!branchId) {
        return next();
      }

      const targetRestaurantId = await getRestaurantIdByBranch(branchId);
      if (!targetRestaurantId) {
        return res.status(404).json({ error: 'Branch not found' });
      }

      const currentMembership = req.user?.memberships?.find(
        (m) => Number(m.restaurantId) === Number(targetRestaurantId),
      );

      if (!currentMembership) {
        return res.status(403).json({
          error: 'You do not have access to this branch',
        });
      }

      if (currentMembership.restaurantRole === 'owner') {
        req.currentMembership = currentMembership;
        return next();
      }

      if (!currentMembership.branchIds.includes(branchId)) {
        return res.status(403).json({
          error: 'You do not have access to this branch',
        });
      }

      req.currentMembership = currentMembership;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireAgent(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
  if (req.user.role !== SystemRole.DELIVERY_AGENT) return res.status(403).json({ error: 'Agent role required' });
  next();
}
