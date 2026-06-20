import { apiClient } from "@/api/axios-client";
import { type ApiResponse } from "@/api/api-helper";
import type { CustomerAddress } from "../types";
import type { AddressFormValues } from "../schemas";
import { unwrap, unwrapResponse } from "@/features/auth/services/auth-api";

export const getAddresses = async () => {
  const response = await apiClient.get<
    ApiResponse<CustomerAddress[]>
  >("/customer/addresses");
  return unwrapResponse(response);
};

export const createAddress = async (payload: AddressFormValues) => {
  const response = await apiClient.post<
    ApiResponse<CustomerAddress>
  >("/customer/addresses", payload);
  return unwrap(response);
};

export const updateAddress = async ({
  addressId,
  ...payload
}: AddressFormValues & { addressId: number }) => {
  const response = await apiClient.patch<
    ApiResponse<CustomerAddress>
  >(`/customer/addresses/${addressId}`, payload);
  return unwrap(response);
};

export const deleteAddress = async (addressId: number) => {
  const response = await apiClient.delete<ApiResponse>(
    `/customer/addresses/${addressId}`,
  );
  return unwrap(response);
};
