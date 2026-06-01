import { NotAuthenticated } from '../../../lib/auth/error.js';
import { SystemRole } from '../../users/enums.js';
import {
  createUser,
  findUserByEmail,
  findUserExistsByEmailOrPhone,
  updateUserPassword,
} from '../../users/repository/users.repo.js';
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from '../dto/auth.dto.js';
import {
  CannotSignupAsSystemAdmin,
  IncorrectCredentials,
  InvalidOTPError,
  UserAlreadyExistsError,
} from '../error.js';
import {
  createPasswordReset,
  findLatestPasswordResetByUserId,
  updatePasswordResetConsumedAt,
} from '../repository/auth.repo.js';
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
  register = async (data: RegisterDTO) => {
    if (data.role === SystemRole.SYSTEM_ADMIN) {
      throw CannotSignupAsSystemAdmin;
    }

    // 1. check if user exists by email
    const existing = await findUserExistsByEmailOrPhone(data.email, data.phone);

    // 2. if exists we throw an error
    if (existing) {
      throw UserAlreadyExistsError;
    }

    // 3. hashPassword
    const hashedPassword = await hashPassword(data.password);

    // 4. create user
    const user = await createUser({
      email: data.email,
      phone: data.phone,
      name: data.name,
      password_hash: hashedPassword,
      system_role: data.role,
    });

    // 5. create access token , refresh token
    const payload = { userId: user.id, role: data.role, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // 6. return tokens and user data
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
    };
  };

  login = async (data: LoginDTO) => {
    // find the user by email input
    const user = await findUserByEmail(data.email);
    if (!user) {
      throw IncorrectCredentials;
    }
    // compare passwords
    const match = await comparePassword(data.password, user.password_hash);
    // if passwords doesnt match throw err
    if (!match) {
      throw IncorrectCredentials;
    }
    // generate tokens
    const payload = { userId: user.id, role: user.system_role, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    // return the data
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

export const authService = new AuthService();
