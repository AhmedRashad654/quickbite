import type { ApiResponse } from "@/api/api-helper";
import { apiClient } from "@/api/axios-client";
import type {
  NearbyRestaurantsParams,
  NearbyRestaurantsResponse,
} from "../types";
import {unwrapResponse } from "@/features/auth/services/auth-api";

export const getNearbyRestaurants = async ({
  lat,
  lng,
}: NearbyRestaurantsParams) => {
  const response = await apiClient.get<ApiResponse<NearbyRestaurantsResponse>>(
    "/branches/nearby",
    {
      params: { lat, lng },
    },
  );
  return unwrapResponse(response);
};
