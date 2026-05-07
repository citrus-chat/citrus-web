import type { IValidateUserAccountRequest } from "../../domain/IValidateUserAccountRequest";
import { validateUserAccountApi } from "../../infrastructure/api/authApi";

export function validateUserAccountUseCase(
  request: IValidateUserAccountRequest,
) {
  return validateUserAccountApi(request);
}
