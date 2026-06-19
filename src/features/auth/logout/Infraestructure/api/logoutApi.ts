import { apiClient } from "@/core/api/apiClient";

export function logoutApi(): Promise<void> {
  return apiClient.post<void, Record<string, never>>("/auth/logout", {});
}