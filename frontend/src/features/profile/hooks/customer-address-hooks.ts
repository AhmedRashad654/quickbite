import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../services/customer-address-api";
import type { AddressFormValues } from "../schemas";

const ADDRESSES_KEY = ["customer", "addresses"];

export const useCustomerAddresses = () => {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: getAddresses,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressFormValues) => createAddress(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADDRESSES_KEY,
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddressFormValues & { addressId: number }) =>
      updateAddress(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADDRESSES_KEY,
      });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: number) => deleteAddress(addressId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADDRESSES_KEY,
      });
    },
  });
};
