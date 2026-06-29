import { apiClient } from "@/core/api/apiClient";
import { toAbsoluteAvatarUrl } from "./publicProfileApi";

/**
 * Representa un nodo del organigrama tal como lo devuelve el backend.
 * Se usa tanto en Profile.vue (propio) como en UserProfilePage.vue (otros usuarios).
 */
export interface IOrgUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  position: string | null;
  hierarchyLevel: number | null;
  managerId: string | null;
}

interface IOrgUserRaw {
  id: string;
  username: string;
  avatar_url: string | null;
  position: string | null;
  hierarchy_level: number | null;
  manager_id: string | null;
}

/**
 * Obtiene todos los usuarios activos con sus datos de organización.
 * GET /api/v1/users/org
 */
export async function getOrgUsersApi(): Promise<IOrgUser[]> {
  const raw = await apiClient.get<IOrgUserRaw[]>("/users/org");
  return raw.map((u) => ({
    id: u.id,
    username: u.username,
    avatarUrl: toAbsoluteAvatarUrl(u.avatar_url),
    position: u.position,
    hierarchyLevel: u.hierarchy_level,
    managerId: u.manager_id,
  }));
}
