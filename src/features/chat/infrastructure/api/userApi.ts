import { apiClient } from "@/core/api/apiClient";
import type { IUserResponse } from "../../domain/IUserResponse";
import type { IUserDeviceKeysResponse } from "../../domain/IUserDeviceKeysResponse";

export async function getUsersApi(): Promise<IUserResponse[]> {
  const data = await apiClient.get<IUserResponse[]>("/users");

  return data;
}

export async function getUserKeysApi(
  userId: string,
): Promise<IUserDeviceKeysResponse> {
  const data = await apiClient.get<IUserDeviceKeysResponse>(
    `/users/${userId}/keys`,
  );

  return data;
}
