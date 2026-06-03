import { Knex } from 'knex';
import { MemberStatus } from '../enums.js';
import {
  CannotAssignBranchesToOwnerError,
  CannotAssignTwoOwnerForRestaurant,
  CannotCreateOwnerUserError,
  CannotDeleteOwnerError,
  CannotUpdateStatusOrRoleForOwner,
  InvalidBranchIdsError,
  MemberNotFoundError,
  RoleNotFoundError,
  UserAlreadyMemberInThisRestaurantError,
} from '../errors.js';
import {
  checkMemberExists,
  createRestaurantMember,
  deleteMember,
  findMembersByRestaurantId,
  findMemberWithRoleName,
  updateMember,
} from '../repository/restaurant_member.repo.js';
import { findRoleByName } from '../repository/role.repo.js';
import { RestaurantMember } from '../type.js';
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from '../dto/member.dto.js';
import {
  countBranchesByIdsAndRestaurant,
  setMemberBranches,
} from '../repository/member-branch.repo.js';
import { db } from '../../../lib/knex/knex.js';
import { findUserByEmail, findUserByEmailOrPhone } from '../../users/repository/users.repo.js';
import { userService, UserService } from '../../users/service/users.service.js';
import { User } from '../../users/types.js';
import { SystemRole } from '../../users/enums.js';
import { generateOTP, hashOTP } from '../../auth/utils.js';
import { createPasswordReset } from '../../auth/repository/auth.repo.js';
import { toMs } from '../../../lib/utils/time.js';
import { getPermissionsByRoleName } from '../repository/permission.repo.js';

export class MemberService {
  constructor(private readonly userService: UserService) {}

  async createOwnerMember(
    restaurantId: number,
    userId: number,
    trx?: Knex | Knex.Transaction,
  ): Promise<RestaurantMember> {
    const ownerRoleId = await findRoleByName('owner');
    if (!ownerRoleId) throw RoleNotFoundError;
    return createRestaurantMember(
      {
        restaurant_id: restaurantId,
        user_id: userId,
        role_id: ownerRoleId,
        status: MemberStatus.ACTIVE,
      },
      trx,
    );
  }

  async createMember(restaurantId: number, data: CreateMemberDTO) {
    if (data.role == 'owner') {
      throw CannotCreateOwnerUserError;
    }

    // find roleId by role name
    const roleId = await findRoleByName(data.role);
    if (!roleId) {
      throw RoleNotFoundError;
    }

    const branchIds = data.branchIds || [];
    await this.validateBranchOwnership(branchIds, restaurantId);

    let user: User | null = null;
    if (data.email && data.phone) {
      user = await findUserByEmailOrPhone(data.email, data.phone);
    } else if (data.email) {
      user = await findUserByEmail(data.email);
    }

    const trx = await db.transaction();
    try {
      if (!user) {
        user = await this.userService.create(
          {
            email: data.email,
            phone: data.phone || '',
            name: data.name || '',
            password: '',
            system_role: SystemRole.RESTAURANT_USER,
          },
          trx,
        );
      } else {
        const isAlreadyMember = await checkMemberExists(user.id, restaurantId);
        if (isAlreadyMember) {
          throw UserAlreadyMemberInThisRestaurantError;
        }
      }

      const member = await createRestaurantMember(
        {
          restaurant_id: restaurantId,
          user_id: user.id,
          role_id: roleId,
          status: MemberStatus.INACTIVE,
        },
        trx,
      );

      const rows = branchIds.map((branchId) => ({
        branch_id: branchId,
        member_id: member.id,
      }));

      await setMemberBranches(member.id, rows, trx);

      const otp = generateOTP();
      const hashedOtp = hashOTP(otp);
      await createPasswordReset(
        {
          user_id: user.id,
          otp_hash: hashedOtp,
          expires_at: new Date(Date.now() + toMs(7, 'd')),
        },
        trx,
      );
      console.log(`mocked email sent ${otp}`);

      await trx.commit();

      return {
        message: 'Member invited successfully',
        member: {
          id: member.id,
          user_id: user.id,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: data.role,
          status: MemberStatus.INACTIVE,
          branchIds,
        },
      };
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async listMembers(restaurantId: number) {
    const members = await findMembersByRestaurantId(restaurantId);
    return { data: members };
  }

  async updateMember(restaurantId: number, memberId: number, data: UpdateMemberDTO) {
    const result = await findMemberWithRoleName(memberId);
    if (!result || Number(result.member.restaurant_id) !== Number(restaurantId)) {
      throw MemberNotFoundError;
    }

    if (result.roleName === 'owner') {
      throw CannotUpdateStatusOrRoleForOwner;
    }

    const updateData: { role_id?: number; status?: string } = {};
    if (data.role) {
      const roleId = await findRoleByName(data.role);
      if (!roleId) throw RoleNotFoundError;
      updateData.role_id = roleId;
    }
    if (data.status) {
      if(data.role === "owner") throw CannotAssignTwoOwnerForRestaurant;
      updateData.status = data.status;
    }

    await updateMember(memberId, updateData);
    return { message: 'Member updated successfully' };
  }

  async deleteMember(restaurantId: number, memberId: number) {
    const result = await findMemberWithRoleName(memberId);
    if (!result || Number(result.member.restaurant_id) !== Number(restaurantId)) {
      throw MemberNotFoundError;
    }
    if (result.roleName === 'owner') {
      throw CannotDeleteOwnerError;
    }
    await deleteMember(memberId);
    return { message: 'Member deleted successfully' };
  }

  async updateMemberBranches(
    restaurantId: number,
    memberId: number,
    data: UpdateMemberBranchesDTO,
  ) {
    // single query: member + role name (no N+1)
    const result = await findMemberWithRoleName(memberId);
    if (!result || Number(result.member.restaurant_id) !== Number(restaurantId)) {
      throw MemberNotFoundError;
    }
    if (result.roleName === 'owner') {
      throw CannotAssignBranchesToOwnerError;
    }

    // validate branchIds belong to this restaurant (single COUNT query)
    await this.validateBranchOwnership(data.branchIds, restaurantId);

    const rows = data.branchIds.map((branchId) => ({
      branch_id: branchId,
      member_id: result.member.id,
    }));
    await setMemberBranches(memberId, rows);

    return {
      message: 'Member branch assignments updated successfully',
      branchIds: data.branchIds,
    };
  }

  async getRolePermissions(roleName: string) {
    const permissions = await getPermissionsByRoleName(roleName);
    return { role: roleName, permissions };
  }

  private async validateBranchOwnership(branchIds: number[], restaurantId: number) {
    if (branchIds.length === 0) return;
    const count = await countBranchesByIdsAndRestaurant(branchIds, restaurantId);
    if (count !== branchIds.length) {
      throw InvalidBranchIdsError;
    }
  }
}

export const memberService = new MemberService(userService);
