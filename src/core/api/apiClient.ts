import { env } from "../config/env";
import { tokenService } from "../auth/tokenService";
import { ApiError } from "./apiError";
import type { ApiResponse, ApiErrorResponse } from "./apiTypes";

export type ApiOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
};

function buildUrl(path: string, params?: ApiOptions["params"]): string {
  const base = env.apiUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const url = new URL(`${base}/${cleanPath}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.append(k, String(v));
    });
  }

  return url.toString();
}

function buildHeaders(extra?: Record<string, string>): HeadersInit {
  const token = tokenService.getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// 👉 core: devuelve SIEMPRE T (no ApiResponse<T>)
async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  options: ApiOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    method,
    headers: buildHeaders(options.headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  // manejar error
  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;

    try {
      errorData = await response.json();
    } catch {
      errorData = undefined;
    }

    throw new ApiError(
      errorData?.message || "API Error",
      response.status,
      errorData,
    );
  }

  // manejar éxito
  const json = (await response.json()) as ApiResponse<T>;

  // opcional: validar contrato
  if (!json.success) {
    throw new ApiError(json.message || "API Error", response.status, {
      success: false,
      message: json.message || "API Error",
      statusCode: response.status,
      errorCode: "UNKNOWN_ERROR",
    });
  }

  return json.data;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, "GET", undefined, options),

  post: <T, B = unknown>(path: string, body: B, options?: ApiOptions) =>
    request<T>(path, "POST", body, options),

  put: <T, B = unknown>(path: string, body: B, options?: ApiOptions) =>
    request<T>(path, "PUT", body, options),

  patch: <T, B = unknown>(path: string, body: B, options?: ApiOptions) =>
    request<T>(path, "PATCH", body, options),

  delete: <T>(path: string, options?: ApiOptions) =>
    request<T>(path, "DELETE", undefined, options),
};
