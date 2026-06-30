import { apiClient } from "@/core/api/apiClient";
import { env } from "@/core/config/env";

// Forma del perfil público de otro usuario según la respuesta del backend
export interface IPublicUserProfile {
  user_id: string;
  username: string;
  avatar_url: string | null;

  // Datos personales (null si el usuario los ocultó y el solicitante no es su jefe)
  phone_number: string | null;
  email: string | null;
  description: string | null;
  status: string | null;

  // Datos de organización (siempre visibles)
  position_name: string | null;
  department: string | null;
  hierarchy_level: number | null;
  manager_id: string | null;
  manager_username: string | null;

  // Banderas para mostrar candados en la UI
  show_phone: boolean;
  show_email: boolean;
  show_status: boolean;
  show_description: boolean;
}

/**
 * Obtiene el perfil publico de otro usuario.
 * El backend aplica las reglas de privacidad automáticamente.
 * GET /api/v1/users/{userId}/profile
 */
export function getPublicUserProfileApi(
  userId: string,
): Promise<IPublicUserProfile> {
  return apiClient.get<IPublicUserProfile>(`/users/${userId}/profile`);
}

/**
 * Convierte una URL de avatar relativa (del backend) a absoluta.
 * Si ya es absoluta la devuelve tal cual.
 */
export function toAbsoluteAvatarUrl(relativeUrl: string | null): string | null {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  const serverOrigin = new URL(env.apiUrl).origin;
  return `${serverOrigin}${relativeUrl}`;
}
