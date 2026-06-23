import { computed, ref } from "vue";
import type { IProfileData } from "../domain/IProfileData";
import { profileStorage } from "../infrastructure/indexedDb/profileStorage";
import { getMyProfileApi, updateMyProfileApi } from "../infrastructure/api/profileApi";
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
   * Load strategy: primero se carga la cache de IndexedDB (instantánea) y luego se sincroniza desde la API.
   * Si la API devuelve datos más recientes, se actualiza la cache y el estado reactivo.
   */
  const loadProfile = async (userId: string): Promise<void> => {
    // 1. Cargar desde IndexedDB inmediatamente (lectura local rápida)
    const cached = await profileStorage.get(userId);
    if (cached) {
      profile.value = cached;
    }

    // 2. Obtener datos del backend y sincronizar (fuente de verdad)
    try {
      const remote = await getMyProfileApi();
      if (profile.value) {
        // Fusionar la privacidad/descripcion remota con los datos de perfil existentes
        profile.value = {
          ...profile.value,

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
      }
      // Actualizar la cache de IndexedDB con datos nuevos
      if (profile.value) {
        await profileStorage.save(profile.value);
      }
    } catch {
      // La red revento: mantenga la cache local tal cual no me la toques
    }
  };

  /**

* Estrategia de guardado: primero se realiza una actualización local y luego se persiste en la API.

* IndexedDB siempre se actualiza, independientemente si explota o no la API.

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
      // Offline — Los cambios se guardan localmente y se sincronizarán la proxima vez.
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