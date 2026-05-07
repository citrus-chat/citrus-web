export type ApiResponse<T> = {
  success: boolean;
  message?: string | null;
  data: T;
  timestamp?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
  errorCode?: string;
  errors?: Record<string, string[]>;
  path?: string;
  timestamp?: string;
};
