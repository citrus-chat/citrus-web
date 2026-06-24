<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { getUserFriendlyErrorMessage } from "@/core/api/apiErrorMapper";
import { checkAdminAccess } from "@/features/admin/application/use-cases/checkAdminAccess";
import AdminBadge from "@/features/admin/presentation/components/AdminBadge.vue";
import AdminEmptyState from "@/features/admin/presentation/components/AdminEmptyState.vue";
import AdminErrorState from "@/features/admin/presentation/components/AdminErrorState.vue";
import AdminLoadingState from "@/features/admin/presentation/components/AdminLoadingState.vue";
import AdminPageHeader from "@/features/admin/presentation/components/AdminPageHeader.vue";
import AdminStatCard from "@/features/admin/presentation/components/AdminStatCard.vue";
import { getAdminUsers } from "@/features/admin/users/application/use-cases/getAdminUsers";
import type { IAdminUser } from "@/features/admin/users/domain/IAdminUser";

const users = ref<IAdminUser[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const hasAdminAccess = ref(false);
const usersLoaded = ref(false);
const totalUsers = ref<number | null>(null);

const hasKnownUserStatus = computed(() =>
  users.value.some((user) => user.status !== "unknown"),
);
const hasKnownValidationStatus = computed(() =>
  users.value.some((user) => user.validationStatus !== "unknown"),
);
const activeUsers = computed(
  () => users.value.filter((user) => user.status === "active").length,
);
const pendingUsers = computed(
  () =>
    users.value.filter((user) => user.validationStatus === "pending").length,
);

async function loadDashboard() {
  loading.value = true;
  error.value = null;

  try {
    const [adminAccess, adminUsersResponse] = await Promise.all([
      checkAdminAccess(),
      getAdminUsers({ page: 0, size: 20 }),
    ]);
    hasAdminAccess.value = adminAccess;
    users.value = adminUsersResponse.items;
    totalUsers.value = adminUsersResponse.meta.total;
    usersLoaded.value = true;
  } catch (exception: unknown) {
    if (import.meta.env.DEV) {
      console.error("Unable to load administrative dashboard", exception);
    }
    error.value = getUserFriendlyErrorMessage(exception, "admin");
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>

<template>
  <section class="space-y-6">
    <AdminPageHeader
      title="Dashboard"
      subtitle="Estado del área administrativa y resumen del directorio de Citrus Chat."
      action-label="Ver usuarios"
      action-to="/admin/users"
    />

    <AdminLoadingState
      v-if="loading"
      label="Cargando el resumen administrativo…"
    />
    <AdminErrorState
      v-else-if="error"
      :message="error"
      @retry="loadDashboard"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Usuarios"
          :value="totalUsers ?? 'No disponible'"
          hint="Total informado por el paginador del directorio administrativo."
          tone="orange"
        />
        <AdminStatCard
          label="Usuarios activos"
          :value="hasKnownUserStatus ? activeUsers : 'No disponible'"
          :hint="
            hasKnownUserStatus
              ? 'Calculado solo sobre la primera página cargada.'
              : 'La API no informa el estado de las cuentas.'
          "
          tone="emerald"
        />
        <AdminStatCard
          label="Pendientes de validación"
          :value="hasKnownValidationStatus ? pendingUsers : 'No disponible'"
          :hint="
            hasKnownValidationStatus
              ? 'Calculado solo sobre la primera página cargada.'
              : 'La API no informa la validación de las cuentas.'
          "
          tone="sky"
        />
        <AdminStatCard
          label="Acceso administrativo"
          :value="hasAdminAccess ? 'Validado' : 'Sin validar'"
          hint="Verificado con el endpoint de acceso administrativo."
          tone="slate"
        />
      </div>

      <div class="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <section
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 xl:col-span-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="font-semibold text-slate-900 dark:text-white">
                Accesos rápidos
              </h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Acciones disponibles para este panel.
              </p>
            </div>
          </div>
          <div class="mt-5 grid gap-3 sm:grid-cols-3">
            <RouterLink
              to="/admin/users"
              class="rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-white/10 dark:hover:border-orange-400/40 dark:hover:bg-orange-500/5"
            >
              <h3 class="font-semibold text-slate-900 dark:text-white">
                Gestionar usuarios
              </h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Consultar y filtrar el directorio.
              </p>
            </RouterLink>
            <RouterLink
              to="/admin/users/new"
              class="rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-white/10 dark:hover:border-orange-400/40 dark:hover:bg-orange-500/5"
            >
              <h3 class="font-semibold text-slate-900 dark:text-white">
                Registrar usuario
              </h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Crear una nueva cuenta interna.
              </p>
            </RouterLink>
            <RouterLink
              to="/admin/reports"
              class="rounded-xl border border-slate-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/50 dark:border-white/10 dark:hover:border-orange-400/40 dark:hover:bg-orange-500/5"
            >
              <h3 class="font-semibold text-slate-900 dark:text-white">
                Ver reportes
              </h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Revisar el estado del módulo.
              </p>
            </RouterLink>
          </div>
        </section>

        <section
          class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70 xl:col-span-2"
        >
          <h2 class="font-semibold text-slate-900 dark:text-white">
            Estado del sistema
          </h2>
          <ul class="mt-4 space-y-4">
            <li class="flex items-center justify-between gap-3">
              <span class="text-sm text-slate-600 dark:text-slate-400"
                >API administrativa</span
              ><AdminBadge
                :label="usersLoaded ? 'Conectada' : 'Sin datos'"
                :tone="usersLoaded ? 'success' : 'neutral'"
              />
            </li>
            <li class="flex items-center justify-between gap-3">
              <span class="text-sm text-slate-600 dark:text-slate-400"
                >Acceso admin</span
              ><AdminBadge
                :label="hasAdminAccess ? 'Validado' : 'No validado'"
                :tone="hasAdminAccess ? 'success' : 'warning'"
              />
            </li>
            <li class="flex items-center justify-between gap-3">
              <span class="text-sm text-slate-600 dark:text-slate-400"
                >Sesión</span
              ><AdminBadge label="Activa" tone="info" />
            </li>
          </ul>
        </section>
      </div>

      <AdminEmptyState
        v-if="totalUsers === 0"
        title="El directorio todavía no tiene usuarios"
        description="No se recibieron usuarios desde el endpoint administrativo. Puedes registrar la primera cuenta cuando corresponda."
      />
    </template>
  </section>
</template>
