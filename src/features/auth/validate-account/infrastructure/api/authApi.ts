import { apiClient } from "@/core/api/apiClient";

import type { IValidateUserAccountRequest } from "@/features/auth/validate-account/domain/IValidateUserAccountRequest";
import type { IValidateUserAccountResponse } from "@/features/auth/validate-account/domain/IValidateUserAccountResponse";

export function validateUserAccountApi(request: IValidateUserAccountRequest) {
  return apiClient.post<
    IValidateUserAccountResponse,
    IValidateUserAccountRequest
  >("/auth/validate-account", request);
}
