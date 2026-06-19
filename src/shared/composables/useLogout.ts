import { ref, readonly } from "vue";
import { logoutUseCase } from "@/features/auth/logout/application/use-cases/logoutUseCase";

const isLoggingOut = ref(false);

export function useLogout() {
  async function logout() {
    if (isLoggingOut.value) return;

    isLoggingOut.value = true;
    try {
      await logoutUseCase();
      // finally se ejecuta siempre, pase lo que pase:
      // - si logoutUseCase() funciona bien, se ejecuta finally
      // - si logoutUseCase() falla y lanza un error, también se ejecuta finally
    } finally {
      isLoggingOut.value = false;
    }
  }

  return {
    isLoggingOut: readonly(isLoggingOut),
    logout,
  };
}

export default useLogout;