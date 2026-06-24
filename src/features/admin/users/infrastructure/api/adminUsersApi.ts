import { apiClient } from "@/core/api/apiClient";
import type { IRegisterUserRequest } from "@/features/admin/users/domain/IRegisterUserRequest";
import type { IRegisterUserResponse } from "@/features/admin/users/domain/IRegisterUserResponse";
import type { IAdminUsersPaginatedResponse } from "@/features/admin/users/domain/IAdminUsersPaginatedResponse";
import type { IGetAdminUsersParams } from "@/features/admin/users/domain/IGetAdminUsersParams";

export function getAdminUsersApi(
  params: IGetAdminUsersParams = {},
): Promise<IAdminUsersPaginatedResponse> {
  return apiClient.get<IAdminUsersPaginatedResponse>("/admin/users", {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 20,
      search: params.search || undefined,
      status: params.status || undefined,
      sortBy: params.sortBy || undefined,
      direction: params.direction || undefined,
    },
  });
}

export function registerUserApi(
  request: IRegisterUserRequest,
): Promise<IRegisterUserResponse> {
  return apiClient.post<IRegisterUserResponse, IRegisterUserRequest>(
    "/admin/users",
    request,
  );
}
