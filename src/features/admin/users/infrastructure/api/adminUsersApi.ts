import { apiClient } from "@/core/api/apiClient";
import type { IRegisterUserRequest } from "@/features/admin/users/domain/IRegisterUserRequest";
import type { IRegisterUserResponse } from "@/features/admin/users/domain/IRegisterUserResponse";

export function registerUserApi(request: IRegisterUserRequest) {
  return apiClient.post<IRegisterUserResponse, IRegisterUserRequest>(
    "/admin/users",
    request,
  );
}
