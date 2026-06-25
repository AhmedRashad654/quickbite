import { Request, Response } from 'express';
import { ForgetPasswordDTO, LoginDTO, RegisterDTO, ResetPasswordDTO } from '../dto/auth.dto.js';
import { AuthService } from '../service/auth.service.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { toMs } from '../../../lib/utils/time.js';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { sendSuccess } from '../../../lib/http/response.js';
import { env } from '../../../lib/config/env.js';

@injectable()
export class AuthController {
  constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    // 1. validate req.body
    const data = await validateBody(RegisterDTO, req.body);
    // 2. call service
    const { refreshToken, ...result } = await this.authService.register(data);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      maxAge: toMs(7, 'd'),
      path: '/api/v1/auth/refresh',
    });
    sendSuccess(res, result, 'successfully registered user', 201);
  };

  login = async (req: Request, res: Response) => {
    const data = await validateBody(LoginDTO, req.body);
    const { refreshToken, ...result } = await this.authService.login(data);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      maxAge: toMs(7, 'd'),
      path: '/api/v1/auth/refresh',
    });
    sendSuccess(res, result, 'Login successful');
  };

  forgetPassword = async (req: Request, res: Response) => {
    const data = await validateBody(ForgetPasswordDTO, req.body);
    await this.authService.forgetPassword(data);
    sendSuccess(res, undefined, 'Email Sent with OTP');
  };

  resetPassword = async (req: Request, res: Response) => {
    const data = await validateBody(ResetPasswordDTO, req.body);
    await this.authService.resetPassword(data);
    sendSuccess(res, undefined, 'Password reset successfully, please login again');
  };

  refresh = async (req: Request, res: Response) => {
    const result = await this.authService.refresh(req.cookies.refresh_token);
    sendSuccess(res, result, 'success');
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      path: '/api/v1/auth/refresh',
    });
    sendSuccess(res, undefined, 'Logged out successfully');
  };
}
