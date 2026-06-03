import {Router} from "express";
import { memberController } from "./controller/member.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac.js";

export const rbacRouter = Router();

rbacRouter.get('/roles/:role/permissions', memberController.getRolePermissions);

rbacRouter.post('/restaurants/:restaurantId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'create'}),
    memberController.createMember
);

rbacRouter.get('/restaurants/:restaurantId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'read'}),
    memberController.listMembers
);

rbacRouter.patch('/restaurants/:restaurantId/member/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update'}),
    memberController.updateMember
);

rbacRouter.delete('/restaurants/:restaurantId/member/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'delete'}),
    memberController.deleteMember
);

rbacRouter.put('/restaurants/:restaurantId/member/:memberId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update'}),
    memberController.updateMemberBranches
);