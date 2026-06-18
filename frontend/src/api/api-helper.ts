import axios from "axios";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
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
    return error instanceof Error ? error : new ApiClientError("Something went wrong");
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
