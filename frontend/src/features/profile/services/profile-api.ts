import { apiClient } from "@/api/axios-client";
import { type ApiResponse } from "@/api/api-helper";
import type { UpdateProfilePayload } from "../types";
import type { AuthUser } from "@/features/auth/types";
import { unwrap } from "@/features/auth/services/auth-api";

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await apiClient.patch<ApiResponse<AuthUser>>(
    "/user/me",
    payload,
  );
  const r = unwrap(response);
  console.log(r, "update");
  return r;
};
