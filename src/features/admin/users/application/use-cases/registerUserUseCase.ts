import type { IRegisterUserRequest } from "@/features/admin/users/domain/IRegisterUserRequest";

import { registerUserApi } from "@/features/admin/users/infrastructure/api/adminUsersApi";

export async function registerUserUseCase(request: IRegisterUserRequest) {
  return await registerUserApi(request);
}
