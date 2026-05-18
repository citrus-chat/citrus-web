import { apiClient } from "@/core/api/apiClient";
import type { AdminAccessResponse } from "@/features/admin/domain/AdminAccessResponse";

/**
 * Calls the backend endpoint to check admin access.
 * Chooses the path depending on env.apiUrl contents (avoid duplicating /api/v1).
 */
export const adminAccessApi = () => {
  return apiClient.get<AdminAccessResponse>("/admin/access");
};
