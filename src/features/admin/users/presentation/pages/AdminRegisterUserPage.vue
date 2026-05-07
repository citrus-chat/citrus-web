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
  <section class="p-4">
    <div class="d-flex justify-content-between align-items-start mb-4">
      <div>
        <h2 class="fw-bold mb-1">Crear usuario</h2>
        <p class="text-muted mb-0">
          Alta de usuario creada por un administrador.
        </p>
      </div>

      <RouterLink to="/admin/users" class="btn btn-outline-secondary">
        Volver
      </RouterLink>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white border-0 pt-4 px-4">
            <h5 class="fw-semibold mb-1">Datos del usuario</h5>
            <p class="text-muted small mb-0">
              El username será generado automáticamente desde nombre y apellido.
            </p>
          </div>

          <div class="card-body p-4">
            <form @submit.prevent="submit">
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Nombre</label>
                  <input
                    v-model="form.firstName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': getFieldError('firstName') }"
                    placeholder="José"
                    required
                  />

                  <div
                    v-if="getFieldError('firstName')"
                    class="invalid-feedback"
                  >
                    {{ getFieldError("firstName") }}
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label fw-semibold">Apellido</label>
                  <input
                    v-model="form.lastName"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': getFieldError('lastName') }"
                    placeholder="Pérez"
                    required
                  />

                  <div
                    v-if="getFieldError('lastName')"
                    class="invalid-feedback"
                  >
                    {{ getFieldError("lastName") }}
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope" />
                    </span>
                    <input
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': getFieldError('email') }"
                      placeholder="usuario@citrus.com"
                      required
                    />

                    <div v-if="getFieldError('email')" class="invalid-feedback">
                      {{ getFieldError("email") }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Teléfono</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-telephone" />
                    </span>
                    <input
                      v-model="form.phoneNumber"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': getFieldError('phoneNumber') }"
                      placeholder="+59899123456"
                      required
                    />

                    <div
                      v-if="getFieldError('phoneNumber')"
                      class="invalid-feedback"
                    >
                      {{ getFieldError("phoneNumber") }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="alert alert-light border mb-0">
                    <div class="small text-muted mb-1">Username estimado</div>
                    <code>{{ generatedUsernamePreview }}</code>
                  </div>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger mt-4 mb-0">
                {{ error }}
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="reset"
                  class="btn btn-outline-secondary"
                  :disabled="loading"
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  class="btn btn-primary px-4"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                  {{ loading ? "Creando..." : "Crear usuario" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4">
            <h5 class="fw-semibold mb-3">Resultado</h5>

            <p class="text-muted">
              Al crear el usuario, el sistema generará una contraseña temporal y
              guardará su hash de forma segura.
            </p>

            <div v-if="temporaryPassword" class="alert alert-success">
              <div class="fw-semibold mb-2">Usuario creado correctamente</div>

              <div v-if="createdUsername" class="mb-2">
                Username:
                <code>{{ createdUsername }}</code>
              </div>

              <div>
                Contraseña temporal:
                <strong>{{ temporaryPassword }}</strong>
              </div>
            </div>

            <div v-else class="border rounded p-3 bg-light text-muted small">
              Todavía no se creó ningún usuario en esta sesión.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
