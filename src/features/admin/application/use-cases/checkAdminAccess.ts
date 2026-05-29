import { adminAccessApi } from "@/features/admin/infrastructure/api/adminAccessApi";
import type { AdminAccessResponse } from "@/features/admin/domain/AdminAccessResponse";
import { adminAccessCache } from "@/core/auth/adminAccessCache";
import { tokenService } from "@/core/auth/tokenService";

export const checkAdminAccess = async (): Promise<boolean> => {
  try {
    const token = tokenService.getAccessToken();

    if (!token) {
      adminAccessCache.clearAdminAccessCache();
      return false;
    }

    const cached = adminAccessCache.getCachedAdminAccess(token);
    if (cached !== null) return cached;

    const data = await adminAccessApi();

    // apiClient returns the data object (AdminAccessResponse)
    const isAdmin = (data as AdminAccessResponse)?.admin === true;

    adminAccessCache.setCachedAdminAccess(token, isAdmin);

    return isAdmin;
  } catch (err: unknown) {
    // handle common auth errors: 401/403 -> not admin
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      (err as { status?: number }).status === 401
    ) {
      adminAccessCache.clearAdminAccessCache();
      return false;
    }
    if (
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      (err as { status?: number }).status === 403
    ) {
      return false;
    }

    // other errors: return false to avoid breaking navigation
    return false;
  }
};
