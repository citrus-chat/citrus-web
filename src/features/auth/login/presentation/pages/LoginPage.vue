<template>
  <div class="min-h-screen flex items-center justify-center">
    <div
      class="relative w-full max-w-[420px] px-6 py-8 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-900/80 dark:border-white/10 shadow-lg backdrop-blur-md"
    >
      <!-- subtle decorative glow -->
      <div
        class="absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-br from-blue-50/40 to-transparent dark:from-indigo-900/30"
      />

      <div class="flex flex-col items-center gap-2 mb-6">
        <img
          src="@/shared/assets/citrus-chat.png"
          alt="Citrus Chat"
          class="w-18 h-18 rounded-full shadow-lg"
        />
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-gray-50 dark:text-gray-50">
            Citrus Chat
          </h1>
          <p class="text-xs text-slate-300">Acceso seguro al sistema interno</p>
        </div>

        <h2 class="mt-4 text-lg font-medium text-gray-100">
          Bienvenido de vuelta
        </h2>
        <p class="text-sm text-slate-400">Inicia sesión para continuar</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1"
            >Email</label
          >
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12H8m8 0l-4 4m4-4l-4-4"
                />
              </svg>
            </span>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded-lg border border-slate-700/40 bg-slate-800/60 text-sm pl-10 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1"
            >Contraseña</label
          >
          <div class="relative">
            <span
              class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11m6 0v1m0 4v-1m6-4c0-4-4-6-6-6s-6 2-6 6v4h12v-4z"
                />
              </svg>
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full rounded-lg border border-slate-700/40 bg-slate-800/60 text-sm pl-10 pr-10 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="••••••••"
              autocomplete="current-password"
            />

            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              @click="toggleShowPassword"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.05 10.05 0 012.659-4.063M6.1 6.1A9.953 9.953 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.953 9.953 0 01-1.85 3.028M3 3l18 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="text-sm text-red-600">
          {{ error }}
        </div>

        <div>
          <button
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white btn-accent disabled:opacity-60"
            type="submit"
            aria-live="polite"
          >
            <svg
              v-if="loading"
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span v-if="!loading">Iniciar sesión</span>
            <span v-else>Ingresando...</span>
          </button>
        </div>

        <div class="flex items-center justify-between text-sm">
          <router-link
            to="/auth/validate-account"
            class="text-orange-300 hover:underline"
          >
            Validar cuenta
          </router-link>
          <router-link
            to="/auth/forgot-password"
            class="text-slate-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>
        <div class="mt-2 text-center text-xs text-slate-400">
          ¿No tienes cuenta?
          <router-link to="#" class="text-orange-300">
            Contacta al administrador
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { ILoginRequest } from "@/features/auth/login/domain/ILoginRequest";
import { loginUserUseCase } from "@/features/auth/login/application/use-cases/loginUserUseCase";
import { tokenService } from "@/core/auth/tokenService";

const router = useRouter();

const form = reactive<ILoginRequest>({
  email: "",
  password: "",
});

const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

onMounted(() => {
  if (tokenService.hasAccessToken()) {
    router.push({ name: "chat" }).catch(() => {});
  }
});

async function onSubmit() {
  error.value = null;

  if (!form.email || !form.password) {
    error.value = "Por favor completa email y contraseña.";
    return;
  }

  loading.value = true;

  try {
    await loginUserUseCase({ ...form });
    // redirect to chat (main route)
    await router.push({ name: "chat" });
  } catch (err) {
    // Prefer ApiError message if available
    error.value = err?.message || "Error al iniciar sesión";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.btn-accent {
  background: linear-gradient(90deg, #ff8a00 0%, #ffa94d 100%);
  box-shadow:
    0 6px 20px rgba(255, 138, 0, 0.16),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

.btn-accent:hover {
  box-shadow:
    0 10px 30px rgba(255, 138, 0, 0.18),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

/* slightly larger logo in card */
.w-18 {
  width: 72px;
  height: 72px;
}

/* decorative background behind the auth card */
.auth-decor {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      600px 200px at 10% 10%,
      rgba(255, 138, 0, 0.06),
      transparent 10%
    ),
    radial-gradient(
      600px 200px at 90% 90%,
      rgba(255, 138, 0, 0.02),
      transparent 10%
    );
  pointer-events: none;
  z-index: -20;
}
</style>
