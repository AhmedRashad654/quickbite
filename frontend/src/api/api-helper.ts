import axios from "axios";

export type ApiResponse<T = void> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
};

export class ApiClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export const toApiError = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error
      : new ApiClientError("Something went wrong");
  }

  const responseData = error.response?.data as
    | { error?: unknown; message?: unknown }
    | undefined;
  const message =
    (typeof responseData?.error === "string" && responseData.error) ||
    (typeof responseData?.message === "string" && responseData.message) ||
    error.message ||
    "Something went wrong";

  return new ApiClientError(message, error.response?.status);
};
