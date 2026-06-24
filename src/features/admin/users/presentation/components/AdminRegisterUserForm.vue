<script setup lang="ts">
import { computed, reactive } from "vue";

import type { IRegisterUserRequest } from "@/features/admin/users/domain/IRegisterUserRequest";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    error?: string | null;
    fieldErrors?: Record<string, string[]> | null;
  }>(),
  {
    loading: false,
    error: null,
    fieldErrors: null,
  },
);

const emit = defineEmits<{ submit: [request: IRegisterUserRequest] }>();

const form = reactive<IRegisterUserRequest>({
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
});

const localErrors = reactive<Record<string, string[]>>({});

const hasErrors = computed(
  () => Boolean(props.error) || Object.keys(localErrors).length > 0,
);

function getFieldError(field: keyof IRegisterUserRequest): string | null {
  return localErrors[field]?.[0] ?? props.fieldErrors?.[field]?.[0] ?? null;
}

function setError(field: keyof IRegisterUserRequest, message: string) {
  localErrors[field] = [message];
}

function clearLocalErrors() {
  Object.keys(localErrors).forEach((key) => delete localErrors[key]);
}

function resetForm() {
  form.email = "";
  form.firstName = "";
  form.lastName = "";
  form.phoneNumber = "";
  clearLocalErrors();
}

function submit() {
  clearLocalErrors();

  const email = form.email.trim();
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const phoneNumber = form.phoneNumber.trim();

  if (!email) setError("email", "El email es obligatorio.");
  else if (!/^\S+@\S+\.\S+$/.test(email))
    setError("email", "Ingresa un email válido.");
  if (!firstName) setError("firstName", "El nombre es obligatorio.");
  if (!lastName) setError("lastName", "El apellido es obligatorio.");
  if (!phoneNumber) setError("phoneNumber", "El teléfono es obligatorio.");

  if (Object.keys(localErrors).length > 0) return;

  emit("submit", { email, firstName, lastName, phoneNumber });
}
</script>

<template>
  <form class="space-y-5" novalidate @submit.prevent="submit">
    <div
      v-if="hasErrors && error"
      class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-300"
      role="alert"
    >
      {{ error }}
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label
          for="admin-first-name"
          class="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >Nombre</label
        >
        <input
          id="admin-first-name"
          v-model="form.firstName"
          type="text"
          autocomplete="given-name"
          :aria-invalid="Boolean(getFieldError('firstName'))"
          :aria-describedby="
            getFieldError('firstName') ? 'admin-first-name-error' : undefined
          "
          class="min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100"
          :class="
            getFieldError('firstName')
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-white/10'
          "
          placeholder="Nombre"
        />
        <p
          v-if="getFieldError('firstName')"
          id="admin-first-name-error"
          class="mt-1.5 text-xs text-red-600 dark:text-red-300"
        >
          {{ getFieldError("firstName") }}
        </p>
      </div>

      <div>
        <label
          for="admin-last-name"
          class="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >Apellido</label
        >
        <input
          id="admin-last-name"
          v-model="form.lastName"
          type="text"
          autocomplete="family-name"
          :aria-invalid="Boolean(getFieldError('lastName'))"
          :aria-describedby="
            getFieldError('lastName') ? 'admin-last-name-error' : undefined
          "
          class="min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100"
          :class="
            getFieldError('lastName')
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-white/10'
          "
          placeholder="Apellido"
        />
        <p
          v-if="getFieldError('lastName')"
          id="admin-last-name-error"
          class="mt-1.5 text-xs text-red-600 dark:text-red-300"
        >
          {{ getFieldError("lastName") }}
        </p>
      </div>
    </div>

    <div>
      <label
        for="admin-email"
        class="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >Email corporativo</label
      >
      <input
        id="admin-email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        :aria-invalid="Boolean(getFieldError('email'))"
        :aria-describedby="
          getFieldError('email') ? 'admin-email-error' : undefined
        "
        class="min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100"
        :class="
          getFieldError('email')
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-white/10'
        "
        placeholder="usuario@citruschat.com"
      />
      <p
        v-if="getFieldError('email')"
        id="admin-email-error"
        class="mt-1.5 text-xs text-red-600 dark:text-red-300"
      >
        {{ getFieldError("email") }}
      </p>
    </div>

    <div>
      <label
        for="admin-phone"
        class="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200"
        >Teléfono</label
      >
      <input
        id="admin-phone"
        v-model="form.phoneNumber"
        type="tel"
        autocomplete="tel"
        :aria-invalid="Boolean(getFieldError('phoneNumber'))"
        :aria-describedby="
          getFieldError('phoneNumber') ? 'admin-phone-error' : undefined
        "
        class="min-h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100"
        :class="
          getFieldError('phoneNumber')
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-500/20 dark:border-white/10'
        "
        placeholder="+598 99 123 456"
      />
      <p
        v-if="getFieldError('phoneNumber')"
        id="admin-phone-error"
        class="mt-1.5 text-xs text-red-600 dark:text-red-300"
      >
        {{ getFieldError("phoneNumber") }}
      </p>
    </div>

    <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        :disabled="loading"
        class="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/10"
        @click="resetForm"
      >
        Limpiar
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="min-h-11 rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? "Registrando…" : "Registrar usuario" }}
      </button>
    </div>
  </form>
</template>
