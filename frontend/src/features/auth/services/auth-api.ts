import type { ApiResponse } from "@/api/api-helper";
import type {
  AuthResponse,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RefreshResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "../types";
import { apiClient } from "@/api/axios-client";

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/login",
    payload,
  );
  return unwrap(response);
};

export const register = async (payload: RegisterPayload) => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/register",
    payload,
  );
  return unwrap(response);
};

export const refreshToken = async () => {
  const response =
    await apiClient.post<ApiResponse<RefreshResponse>>("/auth/refresh");
  return unwrap(response);
};

export const logout = async () => {
  const response =
    await apiClient.post<ApiResponse<{ message: string }>>("/auth/logout");
  return unwrap(response);
};

export const getMe = async () => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/user/me");
  return unwrap(response);
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
  idempotencyKey: string,
) => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forget-password",
    payload,
    {
      headers: {
        ...(idempotencyKey && { "idempotency-Key": idempotencyKey }),
      },
    },
  );
  return unwrap(response);
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    payload,
  );
  return unwrap(response);
};
