import { computed, ref, toRaw } from "vue";
import type { IProfileData } from "../domain/IProfileData";
import { profileStorage } from "../infrastructure/indexedDb/profileStorage";
import {
  getMyProfileApi,
  updateMyProfileApi,
} from "../infrastructure/api/profileApi";
import { env } from "@/core/config/env";

/**
 * Convierte una ruta de avatar relativa al servidor (por ejemplo, "/api/v1/users/avatars/abc.jpg")
 * en una URL absoluta utilizando el origen del servidor derivado de VITE_API_URL.
 * Devuelve null cuando la entrada es nula/vacía.
 */
function toAbsoluteAvatarUrl(relativeUrl: string | null): string | null {
  if (!relativeUrl) return null;
  // Already absolute (e.g. already processed or external)
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }
  const serverOrigin = new URL(env.apiUrl).origin;
  return `${serverOrigin}${relativeUrl}`;
}

const profile = ref<IProfileData | null>(null);
const isSaving = ref(false);
const saveError = ref<string | null>(null);

export const useProfileStore = () => {
  const setProfile = (data: IProfileData) => {
    profile.value = data;
  };

  const clearProfile = () => {
    profile.value = null;
  };

  /**
   * Carga el perfil del usuario actualmente autenticado.
   * No recibe userId como parámetro: el ID real lo confirma el backend via /users/me/profile
   *
   * Estrategia:
   * 1. Pedir al backend quién soy yo porque no lo se xd
   * 2. Si había datos en memoria de otro usuario random, descartamelos antes de traemelos
   * 3. Intentar completar con cache del IndexedDB solo si el userId coincide
   * 4. Si el backend explota y hay cache válida para del usuario, la usamo como fallback
   */
  const loadProfile = async (): Promise<void> => {
    try {
      // 1. El backend es la única fuente de verdad de "quién soy yo"
      const remote = await getMyProfileApi();

      // 2. Si había perfil de otro usuario en memoria, descartamelo plis
      if (profile.value && profile.value.userId !== remote.userId) {
        profile.value = null;
        console.warn(
          "[ProfileStore] Usuario cambió, descartando perfil anterior.",
        );
      }

      // 3. Intentar completar con cache de IndexedDB solo si el userId coincide
      if (!profile.value) {
        const cached = await profileStorage.get(remote.userId);
        if (cached && cached.userId === remote.userId) {
          profile.value = cached;
        }
      }

      // 4. Construir/actualizar profile.value con datos del backend
      // Si no había nada (ni memoria ni cache válida), se construye desde cero
      profile.value = {
        userId: remote.userId,
        email: profile.value?.email ?? "",
        username: remote.username,
        avatarUrl: toAbsoluteAvatarUrl(remote.avatarUrl),
        description: remote.description,
        privacy: remote.privacy,
        privacySettings: {
          showPhone: remote.showPhone,
          showEmail: remote.showEmail,
          showStatus: remote.showStatus,
          showDescription: remote.showDescription,
          allowGroupInvites: remote.allowGroupInvites,
        },
      };

      // 5. Persistir en IndexedDB con el userId correcto como clave
      // toRaw extrae el objeto plano del Proxy reactivo de Vue — IndexedDB no puede clonar Proxies
      await profileStorage.save(toRaw(profile.value));
    } catch (err) {
      // La red falló: usar cache local si pertenece al mismo usuario
      console.error("[ProfileStore] Error cargando perfil desde backend:", err);
      // Si ya hay algo en memoria (mismo usuario), lo dejamos tal cual
      // Si no hay nada, no cargamos nada (evita mostrar datos de otro usuario)
    }
  };

  /**

* Estrategia de guardado: primero se realiza una actualización local y luego se persiste en la API
* IndexedDB siempre se actualiza, independientemente si explota o no la API

*/
  const saveProfile = async (updated: IProfileData): Promise<void> => {
    if (isSaving.value) return;
    isSaving.value = true;
    saveError.value = null;

    // 1. Actualización optimista en memoria + IndexedDB
    profile.value = updated;
    await profileStorage.save(updated);

    // 2. Persistir en el backend
    try {
      const payload = {
        username: updated.username,
        description: updated.description,
        privacy: updated.privacy,
        showPhone: updated.privacySettings.showPhone,
        showEmail: updated.privacySettings.showEmail,
        showStatus: updated.privacySettings.showStatus,
        showDescription: updated.privacySettings.showDescription,
        allowGroupInvites: updated.privacySettings.allowGroupInvites,
      };
      await updateMyProfileApi(payload);
    } catch {
      // Offline — Los cambios se guardan localmente y se sincronizarán la proxima vez
      saveError.value = "offline";
    } finally {
      isSaving.value = false;
    }
  };

  return {
    profile: computed(() => profile.value),
    isSaving: computed(() => isSaving.value),
    saveError: computed(() => saveError.value),
    setProfile,
    clearProfile,
    loadProfile,
    saveProfile,
  };
};
