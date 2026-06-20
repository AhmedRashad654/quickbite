import { useQuery } from "@tanstack/react-query";
import { getBranchMenu } from "../services/menu-api";

export const useBranchMenu = (branchId: number | undefined) => {
  return useQuery({
    queryKey: ["menu", branchId],
    queryFn: () => getBranchMenu(branchId!),
    enabled: branchId !== undefined,
  });
};
