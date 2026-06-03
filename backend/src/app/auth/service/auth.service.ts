import { NotAuthenticated } from '../../../lib/auth/error.js';
import { db } from '../../../lib/knex/knex.js';
import { findBranchIdsByMemberId } from '../../rbac/repository/member-branch.repo.js';
import { findRestaurantsWithRole } from '../../rbac/repository/restaurant_member.repo.js';
import { memberService, MemberService } from '../../rbac/service/member.service.js';
import { RestaurantMembership } from '../../rbac/type.js';
import {
  RestaurantService,
  restaurantService,
} from '../../restaurant/service/restaurant.service.js';
import { SystemRole } from '../../users/enums.js';
import {
  findUserByEmail,
  findUserExistsByEmailOrPhone,
  updateUserPassword,
} from '../../users/repository/users.repo.js';
import { userService, UserService } from '../../users/service/users.service.js';
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from '../dto/auth.dto.js';
import {
  CannotSignupAsSystemAdmin,
  IncorrectCredentials,
  InvalidOTPError,
  RestaurantDataRequiredError,
  UserAlreadyExistsError,
} from '../error.js';
import {
  createPasswordReset,
  findLatestPasswordResetByUserId,
  updatePasswordResetConsumedAt,
} from '../repository/auth.repo.js';
import { JwtPayload } from '../type.js';
import {
  comparePassword,
  createAccessToken,
  createRefreshToken,
  generateOTP,
  hashOTP,
  hashPassword,
  verifyRefreshToken,
} from '../utils.js';

export class AuthService {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly userService: UserService,
    private readonly memberService: MemberService,
  ) {}

  register = async (data: RegisterDTO) => {
    if (data.role === SystemRole.SYSTEM_ADMIN) {
      throw CannotSignupAsSystemAdmin;
    }

    const existing = await findUserExistsByEmailOrPhone(data.email, data.phone);
    if (existing) {
      throw UserAlreadyExistsError;
    }

    const trx = await db.transaction();
    let user;
    let restaurant;
    let membershipsInfo: RestaurantMembership[] = [];

    try {
      user = await this.userService.create(
        {
          email: data.email,
          phone: data.phone,
          name: data.name,
          password: data.password,
          system_role: data.role,
        },
        trx,
      );

      if (data.role == SystemRole.RESTAURANT_USER) {
        if (data.restaurant == undefined) {
          throw RestaurantDataRequiredError;
        }
        restaurant = await this.restaurantService.create(user.id, data.restaurant, trx);

        await this.memberService.createOwnerMember(restaurant.id, user.id, trx);
        membershipsInfo.push({
          restaurantId: restaurant.id,
          restaurantRole: 'owner',
          branchIds: [],
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: data.role,
      email: user.email,
    };
    const accessToken = createAccessToken({ ...payload, memberships: membershipsInfo });
    const refreshToken = createRefreshToken(payload);

    return {
      message: 'successfully registered user',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.system_role,
        createdAt: user.created_at,
      },
      restaurant,
    };
  };

  login = async (data: LoginDTO) => {
    const user = await findUserByEmail(data.email);
    if (!user) {
      throw IncorrectCredentials;
    }

    const match = await comparePassword(data.password, user.password_hash);

    if (!match) {
      throw IncorrectCredentials;
    }

    let membershipsInfo: RestaurantMembership[] = [];
    if (user.system_role == SystemRole.RESTAURANT_USER) {
      const rows = await findRestaurantsWithRole(user.id);
      membershipsInfo = await Promise.all(
        rows.map(async (row: { restaurant_id: number; member_id: number; role_name: string }) => {
          const branchIds = await findBranchIdsByMemberId(row.member_id);
          return {
            restaurantId: row.restaurant_id,
            restaurantRole: row.role_name,
            branchIds: branchIds,
          };
        }),
      );
    }

    const payload: JwtPayload = {
      userId: user.id,
      role: user.system_role,
      email: user.email,
    };
    const accessToken = createAccessToken({ ...payload, memberships: membershipsInfo });
    const refreshToken = createRefreshToken(payload);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.system_role,
        createdAt: user.created_at,
      },
    };
  };

  forgetPassword = async (data: ForgetPasswordDTO) => {
    // check if user exists
    const user = await findUserByEmail(data.email);
    if (!user) {
      return;
    }
    // generate an otp
    const otp = generateOTP();
    console.log(`Generated OTP for ${data.email} is ${otp}`);
    // hash the otp
    const hashedOtp = hashOTP(otp);
    // insert the otp
    await createPasswordReset({
      user_id: user.id,
      otp_hash: hashedOtp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });
    // TODO: send email
    console.log(`mocked email sent ${otp}`);
  };

  resetPassword = async (data: ResetPasswordDTO) => {
    // find user
    const user = await findUserByEmail(data.email);
    if (!user) {
      throw InvalidOTPError;
    }
    // find reset password
    const reset = await findLatestPasswordResetByUserId(user.id);
    if (!reset) {
      throw InvalidOTPError;
    }
    // verify otp and expiry date
    const inputOTPHash = hashOTP(data.otp);

    if (inputOTPHash != reset.otp_hash || reset.expires_at < new Date()) {
      throw InvalidOTPError;
    }
    // update user password
    const hashedPassword = await hashPassword(data.newPassword);
    await updateUserPassword(user.id, hashedPassword);
    // update reset password
    await updatePasswordResetConsumedAt(reset.id);
  };

  refresh = async (refreshToken: string) => {
    if (!refreshToken) {
      throw NotAuthenticated;
    }
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = createAccessToken({
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    });
    return { accessToken };
  };
}

export const authService = new AuthService(restaurantService, userService, memberService);
