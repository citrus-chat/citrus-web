import { tokenService } from "@/core/auth/tokenService";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { logoutApi } from "@/features/auth/logout/Infraestructure/api/logoutApi";
import { clearClientSession } from "@/features/auth/logout/application/clearClientSession";
import { router } from "@/app/router";

export async function logoutUseCase(): Promise<void> {
  // 1. Notificar al backend (opcional — si falla igual limpiamos localmente).
  //    Si en el futuro el backend usa cookies httpOnly de sesión, este es
  //    el lugar donde el servidor debería responder con un Set-Cookie
  //    expirado para invalidarlas; desde el cliente no se puede.
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

  // 5. Limpiar todo lo demás: localStorage residual, sessionStorage
  //    y cookies no-httpOnly accesibles desde JS.
  clearClientSession();

  // 6. Redirigir al login
  await router.push({ name: "login" });
}
