import { apiClient } from "@/core/api/apiClient";
import type { AdminAccessResponse } from "@/features/admin/domain/AdminAccessResponse";

export const adminAccessApi = () => {
  return apiClient.get<AdminAccessResponse>("/admin/access");
};
