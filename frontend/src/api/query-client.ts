import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toApiError } from "./api-helper";
import { toast } from "sonner";

export const client = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage === false) return;
      const apiError = toApiError(error); 
      toast.error(`Error: ${apiError.message}`);
    },
  }),

  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.disableSuccessToast) return;
      if (mutation.meta?.successMessage) {
        toast.success(mutation.meta.successMessage as string);
      } else {
        toast.success("Operation completed successfully!");
      }
    },

    onError: (error) => {
      const apiError = toApiError(error);
      toast.error(`Error: ${apiError.message}`);
    },
  }),

  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});