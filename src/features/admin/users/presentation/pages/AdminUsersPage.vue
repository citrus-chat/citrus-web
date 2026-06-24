<script setup lang="ts">
import { onMounted, ref } from "vue";

import { getUserFriendlyErrorMessage } from "@/core/api/apiErrorMapper";
import AdminErrorState from "@/features/admin/presentation/components/AdminErrorState.vue";
import AdminPageHeader from "@/features/admin/presentation/components/AdminPageHeader.vue";
import AdminPagination from "@/features/admin/presentation/components/AdminPagination.vue";
import { getAdminUsers } from "@/features/admin/users/application/use-cases/getAdminUsers";
import type { IAdminUser } from "@/features/admin/users/domain/IAdminUser";
import type { IPaginationMeta } from "@/features/admin/users/domain/IPaginationMeta";
import AdminUserTable from "@/features/admin/users/presentation/components/AdminUserTable.vue";

const users = ref<IAdminUser[]>([]);
const pagination = ref<IPaginationMeta | null>(null);
const currentPage = ref(0);
const pageSize = ref(20);
const search = ref("");
const status = ref("");
const loading = ref(true);
const error = ref<string | null>(null);

async function loadUsers() {
  loading.value = true;
  error.value = null;

  try {
    const response = await getAdminUsers({
      page: currentPage.value,
      size: pageSize.value,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    });

    users.value = response.items;
    pagination.value = response.meta;
    currentPage.value = response.meta.currentPage;
    pageSize.value = response.meta.perPage || pageSize.value;
  } catch (exception: unknown) {
    if (import.meta.env.DEV) {
      console.error("Unable to load administrative users", exception);
    }
    error.value = getUserFriendlyErrorMessage(exception, "admin");
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  currentPage.value = 0;
  loadUsers();
}

function clearFilters() {
  search.value = "";
  status.value = "";
  currentPage.value = 0;
  loadUsers();
}

function handleChangePage(page: number) {
  currentPage.value = Math.max(page, 0);
  loadUsers();
}

function handleChangePageSize(size: number) {
  pageSize.value = size;
  currentPage.value = 0;
  loadUsers();
}

onMounted(loadUsers);
</script>

<template>
  <section class="space-y-6">
    <AdminPageHeader
      title="Usuarios"
      subtitle="Consulta el directorio interno y revisa el estado de las cuentas registradas."
      action-label="Registrar usuario"
      action-to="/admin/users/new"
    />

    <form
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-5"
      @submit.prevent="applyFilters"
    >
      <div
        class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
      >
        <div>
          <label for="admin-user-search" class="sr-only">Buscar usuarios</label>
          <input
            id="admin-user-search"
            v-model="search"
            type="search"
            placeholder="Buscar por nombre, email o usuario"
            class="min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        <div>
          <label for="admin-user-status" class="sr-only"
            >Filtrar por estado</label
          >
          <select
            id="admin-user-status"
            v-model="status"
            class="min-h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="min-h-10 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Buscar
        </button>
      </div>
      <div
        class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm"
      >
        <p class="text-slate-500 dark:text-slate-400">
          {{
            pagination
              ? `${pagination.total} usuarios en total`
              : "Cargando usuarios…"
          }}
        </p>
        <button
          v-if="search || status"
          type="button"
          class="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-300 dark:hover:text-orange-200"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </div>
    </form>

    <AdminErrorState v-if="error" :message="error" @retry="loadUsers" />
    <template v-else>
      <AdminUserTable
        :users="users"
        :loading="loading"
        :empty-title="
          search || status
            ? 'No encontramos usuarios con esos filtros'
            : 'No hay usuarios registrados'
        "
        :empty-description="
          search || status
            ? 'Prueba con otros términos o restablece los filtros.'
            : 'Cuando el backend devuelva usuarios, aparecerán en este directorio.'
        "
      />
      <AdminPagination
        v-if="pagination && !loading"
        :current-page="pagination.currentPage"
        :last-page="pagination.lastPage"
        :per-page="pagination.perPage"
        :total="pagination.total"
        :from="pagination.from"
        :to="pagination.to"
        :has-next-page="pagination.hasNextPage"
        :has-previous-page="pagination.hasPreviousPage"
        :loading="loading"
        @change-page="handleChangePage"
        @change-page-size="handleChangePageSize"
      />
    </template>
  </section>
</template>
