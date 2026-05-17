import { apiClient } from "@/core/api/apiClient";

import type { ILoginRequest } from "@/features/auth/login/domain/ILoginRequest";
import type { ILoginResponse } from "@/features/auth/login/domain/ILoginResponse";

export function loginApi(request: ILoginRequest) {
  // backend expects /auth/login according to project spec
  return apiClient.post<ILoginResponse, ILoginRequest>("/auth/login", request);
}
