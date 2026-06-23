import { env } from "@/core/config/env";
import { tokenService } from "@/core/auth/tokenService";
import { ApiError } from "@/core/api/apiError";
import type { ApiErrorResponse, ApiResponse } from "@/core/api/apiTypes";

export interface IAvatarResponse {
  avatar_url: string | null;
}

/**

* Sube el avatar como multipart/form-data.
* Usamos la función `raw fetch` en lugar de `apiClient` porque `apiClient` impone
* `Content-Type: application/json`, lo que provoca errores en las subidas multipart.
* El navegador debe establecer el límite automáticamente cuando el cuerpo es FormData.

*/
export async function uploadAvatarApi(file: File): Promise<IAvatarResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const base = env.apiUrl.replace(/\/+$/, "");
  const token = tokenService.getToken();

  const response = await fetch(`${base}/users/me/avatar`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = await response.json();
    } catch {
      errorData = undefined;
    }
    throw new ApiError(
      errorData?.message ?? "Error al subir el avatar",
      response.status,
      errorData,
    );
  }
  // El backend envuelve todo en ApiResponse<T> — desenvuelve .data
  const json = (await response.json()) as ApiResponse<IAvatarResponse>;
  return json.data;
}

export async function deleteAvatarApi(): Promise<IAvatarResponse> {
  const base = env.apiUrl.replace(/\/+$/, "");
  const token = tokenService.getToken();

  const response = await fetch(`${base}/users/me/avatar`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let errorData: ApiErrorResponse | undefined;
    try {
      errorData = await response.json();
    } catch {
      errorData = undefined;
    }
    throw new ApiError(
      errorData?.message ?? "Error al eliminar el avatar",
      response.status,
      errorData,
    );
  }

  const json = (await response.json()) as ApiResponse<IAvatarResponse>;
  return json.data;
}