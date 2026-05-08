<script setup lang="ts">
import { reactive, ref } from "vue";
import { ApiError } from "@/core/api/apiError";
import useTheme from "@/shared/composables/useTheme";

import { validateUserAccountUseCase } from "@/features/auth/validate-account/application/use-cases/validateUserAccountUseCase";

const form = reactive({ username: "", temporaryPassword: "", newPassword: "" });

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const fieldErrors = ref<Record<string, string[]> | null>(null);
const { isDark } = useTheme();

function getFieldError(field: string): string | null {
  return fieldErrors.value?.[field]?.[0] ?? null;
}

function themeClasses(lightClasses: string, darkClasses: string): string {
  return isDark() ? darkClasses : lightClasses;
}

async function submit() {
  try {
    loading.value = true;
    error.value = null;
    fieldErrors.value = null;
    success.value = false;
    await validateUserAccountUseCase({ ...form });
    success.value = true;
  } catch (exception: unknown) {
    if (exception instanceof ApiError) {
      error.value = exception.data?.message ?? exception.message;
      fieldErrors.value = exception.data?.errors ?? null;
      return;
    }
    error.value = "No se pudo validar la cuenta";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section>
    <div
      :class="
        themeClasses(
          'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
          'rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-sm',
        )
      "
    >
      <div class="mb-4">
        <span
          :class="
            themeClasses(
              'inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700',
              'inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200',
            )
          "
        >
          Primer acceso
        </span>

        <h2
          :class="
            themeClasses(
              'mt-3 mb-1 text-xl font-bold text-slate-900',
              'mt-3 mb-1 text-xl font-bold text-slate-50',
            )
          "
        >
          Activar cuenta
        </h2>
        <p :class="themeClasses('text-slate-700', 'text-slate-300')">
          Ingresá tu usuario, contraseña temporal y una nueva contraseña.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label
            :class="
              themeClasses(
                'mb-1 block text-sm font-semibold text-slate-800',
                'mb-1 block text-sm font-semibold text-slate-100',
              )
            "
          >
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            placeholder="jose_perez"
            required
            :class="
              themeClasses(
                'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              )
            "
          />
          <p
            v-if="getFieldError('username')"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ getFieldError("username") }}
          </p>
        </div>

        <div>
          <label
            :class="
              themeClasses(
                'mb-1 block text-sm font-semibold text-slate-800',
                'mb-1 block text-sm font-semibold text-slate-100',
              )
            "
          >
            Contraseña temporal
          </label>
          <input
            v-model="form.temporaryPassword"
            type="password"
            placeholder="Ingresá la contraseña temporal"
            required
            :class="
              themeClasses(
                'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              )
            "
          />
          <p
            v-if="getFieldError('temporaryPassword')"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ getFieldError("temporaryPassword") }}
          </p>
        </div>

        <div>
          <label
            :class="
              themeClasses(
                'mb-1 block text-sm font-semibold text-slate-800',
                'mb-1 block text-sm font-semibold text-slate-100',
              )
            "
          >
            Nueva contraseña
          </label>
          <input
            v-model="form.newPassword"
            type="password"
            placeholder="Definí tu nueva contraseña"
            required
            :class="
              themeClasses(
                'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                'w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
              )
            "
          />
          <p
            v-if="getFieldError('newPassword')"
            class="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {{ getFieldError("newPassword") }}
          </p>
        </div>

        <div
          v-if="error"
          class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          {{ error }}
        </div>
        <div
          v-if="success"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          Cuenta activada correctamente. Ya podés iniciar sesión.
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {{ loading ? "Activando..." : "Activar cuenta" }}
        </button>
      </form>
    </div>
  </section>
</template>
