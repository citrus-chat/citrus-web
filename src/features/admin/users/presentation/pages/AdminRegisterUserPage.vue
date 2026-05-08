<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import { ApiError } from "@/core/api/apiError";
import { registerUserUseCase } from "@/features/admin/users/application/use-cases/registerUserUseCase";

const form = reactive({
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
});

const loading = ref(false);
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[]> | null>(null);
const temporaryPassword = ref<string | null>(null);
const createdUsername = ref<string | null>(null);

const generatedUsernamePreview = computed(() => {
  const firstName = form.firstName.trim().toLowerCase();
  const lastName = form.lastName.trim().toLowerCase();

  if (!firstName && !lastName) {
    return "nombre_apellido";
  }

  return `${firstName}_${lastName}`.replace(/\s+/g, "_");
});

function getFieldError(field: string): string | null {
  return fieldErrors.value?.[field]?.[0] ?? null;
}

async function submit() {
  try {
    loading.value = true;
    error.value = null;
    fieldErrors.value = null;
    temporaryPassword.value = null;
    createdUsername.value = null;

    const result = await registerUserUseCase({
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber,
    });

    temporaryPassword.value = result.temporaryPassword;
    createdUsername.value = result.username ?? generatedUsernamePreview.value;
  } catch (exception: unknown) {
    if (exception instanceof ApiError) {
      error.value = exception.data?.message ?? exception.message;
      fieldErrors.value = exception.data?.errors ?? null;
      return;
    }

    error.value = "No se pudo crear el usuario";
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <div class="lg:col-span-7">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h2 class="text-2xl font-bold">Crear usuario</h2>
          <p class="text-slate-600 dark:text-slate-400">
            Alta de usuario creada por un administrador.
          </p>
        </div>

        <RouterLink
          to="/admin/users"
          class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900"
        >
          Volver
        </RouterLink>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <div class="p-6">
          <h5 class="font-semibold mb-2">Datos del usuario</h5>
          <p class="text-sm text-slate-500 mb-4">
            El username será generado automáticamente desde nombre y apellido.
          </p>

          <form class="space-y-4" @submit.prevent="submit">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold mb-1">Nombre</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  placeholder="José"
                  required
                  :class="getFieldError('firstName') ? 'border-red-500' : ''"
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                />
                <p
                  v-if="getFieldError('firstName')"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ getFieldError("firstName") }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-semibold mb-1">Apellido</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  placeholder="Pérez"
                  required
                  class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                />
                <p
                  v-if="getFieldError('lastName')"
                  class="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {{ getFieldError("lastName") }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">Email</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="usuario@citrus.com"
                required
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              />
              <p
                v-if="getFieldError('email')"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ getFieldError("email") }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-1">Teléfono</label>
              <input
                v-model="form.phoneNumber"
                type="tel"
                placeholder="+59899123456"
                required
                class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
              />
              <p
                v-if="getFieldError('phoneNumber')"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ getFieldError("phoneNumber") }}
              </p>
            </div>

            <div>
              <div
                class="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/6 dark:bg-slate-900/60"
              >
                Username estimado:
                <code class="ml-2">{{ generatedUsernamePreview }}</code>
              </div>
            </div>

            <div
              v-if="error"
              class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
            >
              {{ error }}
            </div>

            <div class="flex justify-end gap-3 mt-4">
              <button
                type="reset"
                :disabled="loading"
                class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold dark:border-white/10"
              >
                Limpiar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {{ loading ? "Creando..." : "Crear usuario" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="lg:col-span-5">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <h5 class="font-semibold mb-3">Resultado</h5>
        <p class="text-slate-600 dark:text-slate-400 mb-4">
          Al crear el usuario, el sistema generará una contraseña temporal y
          guardará su hash de forma segura.
        </p>

        <div
          v-if="temporaryPassword"
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <div class="font-semibold mb-2">Usuario creado correctamente</div>
          <div v-if="createdUsername" class="mb-2">
            Username: <code class="ml-2">{{ createdUsername }}</code>
          </div>
          <div>
            Contraseña temporal: <strong>{{ temporaryPassword }}</strong>
          </div>
        </div>

        <div
          v-else
          class="rounded-lg border border-slate-100 p-3 bg-slate-50 text-slate-600 text-sm dark:border-white/6 dark:bg-slate-900/60"
        >
          Todavía no se creó ningún usuario en esta sesión.
        </div>
      </div>
    </div>
  </section>
</template>
