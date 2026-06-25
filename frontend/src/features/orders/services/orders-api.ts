import { apiClient } from "@/api/axios-client";
import type { ApiResponse } from "@/api/api-helper";
import type { OrderDetail, OrderSummary } from "../types";
import { unwrap, unwrapResponse } from "@/features/auth/services/auth-api";

export const getCustomerOrders = async (year: number, cursor?: string) => {
  const params: Record<string, string | number> = {
    year,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "desc",
  };
  if (cursor) params.cursor = cursor;

  const response = await apiClient.get<ApiResponse<OrderSummary[]>>(
    "/orders/customer",
    { params },
  );
  return unwrap(response);
};

export const getOrderDetail = async (publicId: string) => {
  const response = await apiClient.get<ApiResponse<OrderDetail>>(
    `/orders/${publicId}`,
  );
  return unwrapResponse(response);
};
