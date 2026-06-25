import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCustomerOrders, getOrderDetail } from "../services/orders-api";

export const useCustomerOrders = (year: number) => {
  return useInfiniteQuery({
    queryKey: ["orders", "customer", year],
    queryFn: ({ pageParam }) =>
      getCustomerOrders(year, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
  });
};

export const useOrderDetail = (publicId: string | undefined) => {
  return useQuery({
    queryKey: ["orders", publicId],
    queryFn: () => getOrderDetail(publicId!),
    enabled: publicId !== undefined,
  });
};
