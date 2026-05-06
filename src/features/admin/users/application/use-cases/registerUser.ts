import type { RegisterUserRequest } from "@/features/admin/users/domain/RegisterUserRequest";

import { registerUserApi } from "@/features/admin/users/infrastructure/api/adminUsersApi";

export async function registerUser(request: RegisterUserRequest) {
  return await registerUserApi(request);
}
