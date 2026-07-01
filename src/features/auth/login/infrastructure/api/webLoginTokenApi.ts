import { apiClient } from "@/core/api/apiClient";
import type {
  ICreateWebLoginTokenRequest,
  ICreateWebLoginTokenResponse,
} from "@/features/auth/login/domain/IWebLoginToken";

export function createWebLoginTokenApi(
  request: ICreateWebLoginTokenRequest,
): Promise<ICreateWebLoginTokenResponse> {
  return apiClient.post<
    ICreateWebLoginTokenResponse,
    ICreateWebLoginTokenRequest
  >("/web-login-tokens", request);
}
