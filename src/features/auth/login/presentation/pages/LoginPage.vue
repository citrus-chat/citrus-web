<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div
      class="relative w-full max-w-105 px-6 py-8 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-900/80 dark:border-white/10 shadow-lg backdrop-blur-md"
    >
      <div
        class="absolute -inset-1 -z-10 rounded-2xl bg-linear-to-br from-blue-50/40 to-transparent dark:from-indigo-900/30"
      />

      <div class="flex flex-col items-center gap-2 mb-6">
        <img
          src="@/shared/assets/CitrusChatNoLetters.png"
          alt="Citrus Chat"
          class="w-18 h-18 rounded-full shadow-lg"
        />
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-slate-950 dark:text-gray-50">
            Citrus Chat
          </h1>
          <p class="text-xs text-slate-600 dark:text-slate-300">
            Acceso seguro al sistema interno
          </p>
        </div>

        <h2 class="mt-4 text-lg font-medium text-slate-900 dark:text-gray-100">
          {{ isCredentialsLogin ? "Bienvenido de vuelta" : "Ingresar con QR" }}
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{
            isCredentialsLogin
              ? "Inicia sesion para continuar"
              : "Escanea el codigo desde la app mobile"
          }}
        </p>
      </div>

      <section v-if="!isCredentialsLogin" class="space-y-4">
        <div
          class="relative min-h-72 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center dark:border-slate-700/50 dark:bg-slate-950/50"
        >
          <Transition name="qr-success">
            <div
              v-if="isCompletingQrLogin"
              class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/95 text-slate-900 backdrop-blur-md dark:bg-slate-950/95 dark:text-slate-50"
              aria-live="polite"
            >
              <div class="qr-success-loader">
                <img
                  src="@/shared/assets/CitrusChatNoLetters.png"
                  alt="Citrus Chat"
                  class="qr-success-logo h-24 w-24 rounded-full shadow-xl"
                />
              </div>
              <div class="text-center">
                <p class="text-base font-semibold">Login confirmado</p>
                <p class="text-sm text-slate-600 dark:text-slate-300">
                  Abriendo Citrus Chat...
                </p>
              </div>
            </div>
          </Transition>

          <div v-if="isQrLoading" class="flex flex-col items-center gap-3">
            <svg
              class="animate-spin h-8 w-8 text-orange-300"
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
            <p class="text-sm text-slate-700 dark:text-slate-300">
              {{ qrStatusLabel }}
            </p>
          </div>

          <div
            v-else-if="qrCodeDataUrl"
            class="flex flex-col items-center gap-3"
          >
            <div class="rounded-xl bg-white p-3 shadow-lg">
              <img
                :src="qrCodeDataUrl"
                alt="Codigo QR para iniciar sesion"
                class="h-54 w-54"
              />
            </div>
            <p class="text-sm text-slate-700 text-center dark:text-slate-300">
              {{ qrStatusLabel }}
            </p>
            <p
              v-if="remainingSeconds > 0"
              class="text-xs text-slate-500 dark:text-slate-400"
            >
              Expira en {{ remainingTimeLabel }}
            </p>
          </div>

          <div v-else class="text-center space-y-3">
            <p class="text-sm text-red-300">
              {{ qrError ?? "No se pudo generar el codigo QR." }}
            </p>
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-white btn-accent"
              @click="restartQrLogin"
            >
              Generar nuevo QR
            </button>
          </div>
        </div>

        <div v-if="qrError && qrCodeDataUrl" class="text-sm text-red-300">
          {{ qrError }}
        </div>

        <div class="flex items-center justify-between text-sm">
          <button
            type="button"
            class="text-orange-300 hover:underline disabled:opacity-60"
            :disabled="qrState === 'confirmed'"
            @click="restartQrLogin"
          >
            Regenerar QR
          </button>
          <button
            type="button"
            class="text-slate-400 hover:text-orange-300 hover:underline"
            @click="showCredentialsLogin"
          >
            Ingresar con usuario y contrasena
          </button>
        </div>
      </section>

      <form v-else class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
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
              class="w-full rounded-lg border dark:text-white border-slate-700/40 bg-slate-800/60 text-sm pl-10 pr-3 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1">
            Contrasena
          </label>
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
              class="w-full rounded-lg border dark:text-white border-slate-700/40 bg-slate-800/60 text-sm pl-10 pr-10 py-2 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="********"
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
          <span v-if="!loading">Iniciar sesion</span>
          <span v-else>Ingresando...</span>
        </button>

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
            Olvide mi contrasena
          </router-link>
        </div>
        <div class="mt-2 text-center text-xs text-slate-400">
          No tienes cuenta?
          <router-link to="#" class="text-orange-300">
            Contacta al administrador
          </router-link>
        </div>
        <div class="text-center">
          <button
            type="button"
            class="text-sm text-slate-400 hover:text-orange-300 hover:underline"
            @click="showQrLogin"
          >
            Volver al login por QR
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCode from "qrcode";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import type { ILoginForm } from "@/features/auth/login/domain/ILoginForm";
import type {
  ICreateWebLoginTokenResponse,
  IWebLoginSessionResult,
} from "@/features/auth/login/domain/IWebLoginToken";
import { loginUserUseCase } from "@/features/auth/login/application/use-cases/loginUserUseCase";
import { createWebLoginTokenUseCase } from "@/features/auth/login/application/use-cases/createWebLoginTokenUseCase";
import { webLoginRealtimeService } from "@/features/auth/login/infrastructure/services/WebLoginRealtimeService";
import { tokenService } from "@/core/auth/tokenService";
import { getUserFriendlyErrorMessage } from "@/core/api/apiErrorMapper";
import { chatRealtimeService } from "@/features/chat/infrastructure/services/ChatRealtimeService";
import { useChatStore } from "@/features/chat/store/ChatStore";

type QrLoginState =
  | "idle"
  | "creatingToken"
  | "qrReady"
  | "connectingSocket"
  | "waitingConfirmation"
  | "confirmed"
  | "expired"
  | "error"
  | "credentialsLogin";

const QR_LOGIN_TTL_MS = 10 * 60 * 1000;

const router = useRouter();
const { initCurrentUser } = useChatStore();

const form = reactive<ILoginForm>({
  email: "admin@citruschat.com",
  password: "Admin123!",
});

const loading = ref(false);
const error = ref<string | null>(null);
const showPassword = ref(false);
const qrState = ref<QrLoginState>("idle");
const qrError = ref<string | null>(null);
const qrCodeDataUrl = ref<string | null>(null);
const webLoginToken = ref<ICreateWebLoginTokenResponse | null>(null);
const expiresAtMs = ref<number | null>(null);
const nowMs = ref(Date.now());
const expirationTimer = ref<number | null>(null);
const isCompletingQrLogin = ref(false);

const isCredentialsLogin = computed(() => qrState.value === "credentialsLogin");
const isQrLoading = computed(() =>
  ["idle", "creatingToken", "qrReady", "connectingSocket"].includes(
    qrState.value,
  ),
);
const remainingSeconds = computed(() => {
  if (!expiresAtMs.value) return 0;
  return Math.max(0, Math.ceil((expiresAtMs.value - nowMs.value) / 1000));
});
const remainingTimeLabel = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60);
  const seconds = remainingSeconds.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});
const qrStatusLabel = computed(() => {
  if (qrState.value === "creatingToken") return "Generando token temporal...";
  if (qrState.value === "qrReady") return "Preparando codigo QR...";
  if (qrState.value === "connectingSocket") return "Conectando...";
  if (qrState.value === "confirmed") return "Login confirmado.";
  if (qrState.value === "expired") return "El codigo expiro.";
  return "Esperando confirmacion desde la app mobile.";
});

function toggleShowPassword() {
  showPassword.value = !showPassword.value;
}

onMounted(async () => {
  if (tokenService.hasAccessToken()) {
    await enterAuthenticatedApp();
    return;
  }

  await startQrLogin();
});

onBeforeUnmount(() => {
  cleanupQrLogin();
});

async function startQrLogin() {
  cleanupQrLogin();
  qrState.value = "creatingToken";
  qrError.value = null;
  qrCodeDataUrl.value = null;
  webLoginToken.value = null;

  try {
    const tokenResponse = await createWebLoginTokenUseCase();
    webLoginToken.value = tokenResponse;
    expiresAtMs.value = resolveExpirationMs(tokenResponse.expires_at);
    qrState.value = "qrReady";
    qrCodeDataUrl.value = await QRCode.toDataURL(
      tokenResponse.qr_payload || tokenResponse.token,
      {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 216,
      },
    );
    startExpirationTimer();
    connectQrSocket(tokenResponse);
  } catch (err: unknown) {
    qrState.value = "error";
    qrError.value = getUserFriendlyErrorMessage(err, "login");
  }
}

function connectQrSocket(tokenResponse: ICreateWebLoginTokenResponse) {
  qrState.value = "connectingSocket";

  webLoginRealtimeService.connect({
    token: tokenResponse.token,
    tokenHeader: tokenResponse.web_socket_token_header,
    queue: tokenResponse.web_socket_queue,
    handlers: {
      onConnected: () => {
        if (qrState.value !== "expired") {
          qrState.value = "waitingConfirmation";
        }
      },
      onConfirmed: (result) => {
        void handleQrConfirmed(result);
      },
      onError: (message) => {
        if (qrState.value === "confirmed" || qrState.value === "expired") {
          return;
        }
        qrState.value = "error";
        qrError.value = message;
      },
    },
  });
}

async function handleQrConfirmed(result: IWebLoginSessionResult) {
  const accessToken = findAccessToken(result);

  if (!accessToken) {
    qrState.value = "error";
    qrError.value = "La confirmacion no incluyo un token de sesion.";
    return;
  }

  qrState.value = "confirmed";
  isCompletingQrLogin.value = true;
  tokenService.saveAccessToken(accessToken);
  cleanupQrLogin({ keepState: true });
  await wait(3000);
  await enterAuthenticatedApp();
}

async function enterAuthenticatedApp() {
  const token = tokenService.getAccessToken();
  if (token) {
    await chatRealtimeService.connect(token);
  }
  await initCurrentUser();
  await router.push({ name: "chat" }).catch(() => {});
}

function showCredentialsLogin() {
  cleanupQrLogin();
  qrState.value = "credentialsLogin";
  qrError.value = null;
}

async function showQrLogin() {
  await startQrLogin();
}

async function restartQrLogin() {
  await startQrLogin();
}

async function onSubmit() {
  error.value = null;

  if (!form.email || !form.password) {
    error.value = "Por favor completa email y contrasena.";
    return;
  }

  loading.value = true;

  try {
    await loginUserUseCase({ ...form });
    await enterAuthenticatedApp();
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.error("Login failed", err);
    }

    error.value = getUserFriendlyErrorMessage(err, "login");
  } finally {
    loading.value = false;
  }
}

function startExpirationTimer() {
  stopExpirationTimer();
  nowMs.value = Date.now();
  expirationTimer.value = window.setInterval(() => {
    nowMs.value = Date.now();

    if (expiresAtMs.value && nowMs.value >= expiresAtMs.value) {
      qrState.value = "expired";
      qrError.value = "El codigo expiro. Genera uno nuevo para continuar.";
      webLoginRealtimeService.disconnect();
      stopExpirationTimer();
    }
  }, 1000);
}

function stopExpirationTimer() {
  if (expirationTimer.value !== null) {
    window.clearInterval(expirationTimer.value);
    expirationTimer.value = null;
  }
}

function cleanupQrLogin(options: { keepState?: boolean } = {}) {
  webLoginRealtimeService.disconnect();
  stopExpirationTimer();
  webLoginToken.value = null;
  expiresAtMs.value = null;

  if (!options.keepState) {
    qrCodeDataUrl.value = null;
    isCompletingQrLogin.value = false;
  }
}

function resolveExpirationMs(expiresAt?: string): number {
  if (expiresAt) {
    const parsed = Date.parse(expiresAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Date.now() + QR_LOGIN_TTL_MS;
}

function findAccessToken(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const direct = record.accessToken ?? record.access_token ?? record.jwt;

  if (typeof direct === "string" && direct.length > 0) {
    return direct;
  }

  for (const nested of Object.values(record)) {
    const found = findAccessToken(nested);
    if (found) return found;
  }

  return null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
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

.w-18 {
  width: 72px;
  height: 72px;
}

.h-54 {
  height: 216px;
}

.w-54 {
  width: 216px;
}

.qr-success-enter-active,
.qr-success-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.qr-success-enter-from,
.qr-success-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.qr-success-loader {
  position: relative;
  display: grid;
  height: 128px;
  width: 128px;
  place-items: center;
}

.qr-success-loader::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 4px solid rgba(249, 115, 22, 0.18);
  border-top-color: #f97316;
  border-right-color: #fb923c;
  animation: qrSuccessSpin 1s linear infinite;
}

.qr-success-logo {
  animation: qrSuccessPulse 1.1s ease both;
}

@keyframes qrSuccessSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes qrSuccessPulse {
  0% {
    opacity: 0;
    transform: scale(0.76) rotate(-8deg);
  }

  60% {
    opacity: 1;
    transform: scale(1.08) rotate(3deg);
  }

  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}
</style>
