type statusText = "success" | "error";

export type ApiSuccess<T> = {
  status: statusText;
  data: T;
  message?: string;
};

export type ApiError = {
  status: statusText;
  error: string;
  code?: string;
};

export type ApiResponse<T> = ApiError | ApiSuccess<T>;

export function successResponse<T>(data: T, message?: string): ApiSuccess<T> {
  return {
    status: "success",
    data,
    ...(message && { message }),
  };
}

export function errorResponse(error: string | Error, code?: string): ApiError {
  return {
    status: "error",
    error: error instanceof Error ? error.message : error,
    ...(code && { code }),
  };
}
