import { tokenService } from "@/core/auth/tokenService";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { logoutApi } from "@/features/auth/logout/Infraestructure/api/logoutApi";
import { clearClientSession } from "@/features/auth/logout/application/clearClientSession";
import { router } from "@/app/router";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import { profileStorage } from "@/features/profile/infrastructure/indexedDb/profileStorage";

export async function logoutUseCase(): Promise<void> {
  // 1. Notificar al backend que el usuario se está deslogueando, para que invalide el token de sesión
  //    Si en el futuro el backend usa cookies httpOnly de sesión, este es
  //    el lugar donde el servidor debería responder con un Set-Cookie
  //    expirado para invalidarlas
  try {
    await logoutApi();
  } catch {
    // Si el backend falla o el token ya expiró, continuamos igual
  }

  // 2. Limpiar token y cache de admin del localStorage
  tokenService.removeAccessToken();

  // 3. Limpiar claves criptográficas E2E del IndexedDB
  try {
    await cryptoStorage.clear();
  } catch {
    // ignore
  }

  // 4. Limpiar el dispositivo del IndexedDB
  try {
    await deviceStorage.remove();
  } catch {
    // ignore
  }

  // 5. Limpiar perfil en memoria y en IndexedDB
  try {
    const { profile, clearProfile } = useProfileStore();
    if (profile.value?.userId) {
      await profileStorage.remove(profile.value.userId);
    }
    clearProfile();
  } catch {
    // ignore
  }

  // 6. Limpiar todo lo demás: localStorage residual, sessionStorage
  //    y cookies no-httpOnly accesibles desde JS.
  // Limpiar stores de IndexedDB (chats, mensajes, usuarios, etc.)
  try {
    const db = await (
      await import("@/shared/infrastructure/indexedDb/citrusDb")
    ).citrusDb;
    const storeNames = [
      "chatRooms",
      "messages",
      "encryptedMessages",
      "outgoingQueue",
      "users",
      "profile",
      "metadata",
      "sync",
    ];
    await Promise.all(storeNames.map((store) => db.clear(store)));
  } catch {
    // ignore
  }

  await clearClientSession();

  // 7. Redirigir al login
  await router.push({ name: "login" });
}
