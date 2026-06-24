import { apiClient } from "@/core/api/apiClient";
import type { IUserResponse } from "../../domain/IUserResponse";

export async function getUsersApi(): Promise<IUserResponse[]> {
  const data = await apiClient.get<IUserResponse[]>("/users");

  return data;
}
