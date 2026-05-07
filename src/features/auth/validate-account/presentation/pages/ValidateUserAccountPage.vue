<script setup lang="ts">
import { reactive, ref } from "vue";
import { ApiError } from "@/core/api/apiError";

import { validateUserAccountUseCase } from "@/features/auth/validate-account/application/use-cases/validateUserAccountUseCase";

const form = reactive({
  username: "",
  temporaryPassword: "",
  newPassword: "",
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const fieldErrors = ref<Record<string, string[]> | null>(null);

function getFieldError(field: string): string | null {
  return fieldErrors.value?.[field]?.[0] ?? null;
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
  <section class="card border-0 shadow-lg rounded-4 overflow-hidden">
    <div class="card-body p-4 p-md-5">
      <div class="mb-4">
        <span class="badge text-bg-primary mb-3"> Primer acceso </span>

        <h2 class="h4 fw-bold mb-2">Activar cuenta</h2>

        <p class="text-muted mb-0">
          Ingresá tu usuario, contraseña temporal y una nueva contraseña.
        </p>
      </div>

      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label fw-semibold"> Username </label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-person" />
            </span>
            <input
              v-model="form.username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': getFieldError('username') }"
              placeholder="jose_perez"
              required
            />

            <div v-if="getFieldError('username')" class="invalid-feedback">
              {{ getFieldError("username") }}
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold"> Contraseña temporal </label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-key" />
            </span>
            <input
              v-model="form.temporaryPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': getFieldError('temporaryPassword') }"
              placeholder="Ingresá la contraseña temporal"
              required
            />

            <div
              v-if="getFieldError('temporaryPassword')"
              class="invalid-feedback"
            >
              {{ getFieldError("temporaryPassword") }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold"> Nueva contraseña </label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-shield-lock" />
            </span>
            <input
              v-model="form.newPassword"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': getFieldError('newPassword') }"
              placeholder="Definí tu nueva contraseña"
              required
            />

            <div v-if="getFieldError('newPassword')" class="invalid-feedback">
              {{ getFieldError("newPassword") }}
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="success" class="alert alert-success">
          Cuenta activada correctamente. Ya podés iniciar sesión.
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100 py-2 fw-semibold"
          :disabled="loading"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          />
          {{ loading ? "Activando..." : "Activar cuenta" }}
        </button>
      </form>
    </div>
  </section>
</template>
