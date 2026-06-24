import type { IAdminUsersPaginatedResponse } from "@/features/admin/users/domain/IAdminUsersPaginatedResponse";
import type { IGetAdminUsersParams } from "@/features/admin/users/domain/IGetAdminUsersParams";
import { getAdminUsersApi } from "@/features/admin/users/infrastructure/api/adminUsersApi";
import { mapAdminUsersPaginatedResponse } from "@/features/admin/users/mappers/mapAdminUserResponse";

export async function getAdminUsers(
  params: IGetAdminUsersParams = {},
): Promise<IAdminUsersPaginatedResponse> {
  const response = await getAdminUsersApi(params);
  return mapAdminUsersPaginatedResponse(response);
}
