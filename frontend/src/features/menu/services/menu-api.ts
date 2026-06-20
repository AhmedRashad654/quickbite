import { apiClient } from "@/api/axios-client";
import { unwrapResponse } from "@/features/auth/services/auth-api";
import type { ApiResponse } from "@/api/api-helper";
import type { BranchMenu } from "../types";

export const getBranchMenu = async (branchId: number) => {
  const response = await apiClient.get<ApiResponse<BranchMenu>>(
    `/products/branches/${branchId}`,
  );
  return unwrapResponse(response);
};
