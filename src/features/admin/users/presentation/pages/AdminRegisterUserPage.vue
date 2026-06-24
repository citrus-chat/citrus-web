<script setup lang="ts">
import { ref } from "vue";

import { ApiError } from "@/core/api/apiError";
import {
  getUserFriendlyErrorMessage,
  normalizeApiError,
} from "@/core/api/apiErrorMapper";
import AdminBadge from "@/features/admin/presentation/components/AdminBadge.vue";
import AdminPageHeader from "@/features/admin/presentation/components/AdminPageHeader.vue";
import { registerUserUseCase } from "@/features/admin/users/application/use-cases/registerUserUseCase";
import type { IRegisterUserRequest } from "@/features/admin/users/domain/IRegisterUserRequest";
import type { IRegisterUserResponse } from "@/features/admin/users/domain/IRegisterUserResponse";
import AdminRegisterUserForm from "@/features/admin/users/presentation/components/AdminRegisterUserForm.vue";

const loading = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[]> | null>(null);
const createdUser = ref<IRegisterUserResponse | null>(null);
const copied = ref(false);

async function submit(request: IRegisterUserRequest) {
  loading.value = true;
  error.value = null;
  fieldErrors.value = null;

  try {
    createdUser.value = await registerUserUseCase(request);
  } catch (exception: unknown) {
    if (import.meta.env.DEV) {
      console.error("Unable to register administrative user", exception);
    }

    if (
      exception instanceof ApiError &&
      normalizeApiError(exception).category !== "technical"
    ) {
      fieldErrors.value = exception.data?.errors ?? null;
    }
    error.value = getUserFriendlyErrorMessage(exception, "admin");
  } finally {
    loading.value = false;
  }
}

async function copyTemporaryPassword() {
  const temporaryPassword = createdUser.value?.temporaryPassword;
  if (!temporaryPassword || !navigator.clipboard) return;

  try {
    await navigator.clipboard.writeText(temporaryPassword);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 1600);
  } catch {
    copied.value = false;
  }
}

function registerAnotherUser() {
  createdUser.value = null;
  error.value = null;
  fieldErrors.value = null;
  copied.value = false;
}
</script>

<template>
  <section class="space-y-6">
    <AdminPageHeader
      title="Registrar usuario"
      subtitle="Crea una cuenta interna con los datos que admite el contrato actual del backend."
      action-label="Ver usuarios"
      action-to="/admin/users"
    />

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <article
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-6 xl:col-span-3"
      >
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Datos de la cuenta
          </h2>
          <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Completa los campos requeridos. El servidor definirá los datos
            finales de acceso.
          </p>
        </div>
        <AdminRegisterUserForm
          v-if="!createdUser"
          :loading="loading"
          :error="error"
          :field-errors="fieldErrors"
          @submit="submit"
        />

        <div
          v-else
          class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20"
        >
          <AdminBadge label="Usuario registrado" tone="success" />
          <h2
            class="mt-4 text-lg font-semibold text-emerald-950 dark:text-emerald-100"
          >
            La cuenta fue creada correctamente.
          </h2>
          <p
            class="mt-1 text-sm leading-6 text-emerald-800 dark:text-emerald-200"
          >
            Comparte la contraseña temporal solo por un canal seguro.
          </p>
          <dl class="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-emerald-700 dark:text-emerald-300">Usuario</dt>
              <dd
                class="mt-1 font-semibold text-emerald-950 dark:text-emerald-100"
              >
                {{ createdUser.username }}
              </dd>
            </div>
            <div>
              <dt class="text-emerald-700 dark:text-emerald-300">Email</dt>
              <dd
                class="mt-1 break-words font-semibold text-emerald-950 dark:text-emerald-100"
              >
                {{ createdUser.email }}
              </dd>
            </div>
            <div v-if="createdUser.phoneNumber">
              <dt class="text-emerald-700 dark:text-emerald-300">Teléfono</dt>
              <dd
                class="mt-1 font-semibold text-emerald-950 dark:text-emerald-100"
              >
                {{ createdUser.phoneNumber }}
              </dd>
            </div>
          </dl>
          <div
            class="mt-5 rounded-xl border border-emerald-200 bg-white/70 p-4 dark:border-emerald-900/50 dark:bg-slate-950/30"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
            >
              Contraseña temporal
            </p>
            <div
              class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <code
                class="break-all rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-100"
                >{{ createdUser.temporaryPassword }}</code
              >
              <button
                type="button"
                class="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
                @click="copyTemporaryPassword"
              >
                {{ copied ? "Copiada" : "Copiar" }}
              </button>
            </div>
          </div>
          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
            <RouterLink
              to="/admin/users"
              class="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Volver a usuarios
            </RouterLink>
            <button
              type="button"
              class="min-h-11 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-200 dark:hover:bg-emerald-500/10"
              @click="registerAnotherUser"
            >
              Registrar otro usuario
            </button>
          </div>
        </div>
      </article>

      <aside
        class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-900/50 xl:col-span-2"
      >
        <h2 class="font-semibold text-slate-900 dark:text-white">
          Antes de continuar
        </h2>
        <ul
          class="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
        >
          <li>
            El nombre, apellido, email y teléfono se envían exactamente como los
            acepta el contrato actual.
          </li>
          <li>
            No se agregan roles, organizaciones ni permisos que el backend no
            haya definido.
          </li>
          <li>
            La contraseña temporal solo se muestra si el servidor la devuelve.
          </li>
        </ul>
      </aside>
    </div>
  </section>
</template>
