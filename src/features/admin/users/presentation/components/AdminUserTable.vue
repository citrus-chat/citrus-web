<script setup lang="ts">
import type { IAdminUser } from "@/features/admin/users/domain/IAdminUser";
import AdminBadge from "@/features/admin/presentation/components/AdminBadge.vue";
import AdminEmptyState from "@/features/admin/presentation/components/AdminEmptyState.vue";

withDefaults(
  defineProps<{
    users: IAdminUser[];
    loading?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
  }>(),
  {
    loading: false,
    emptyTitle: "No hay usuarios para mostrar",
    emptyDescription:
      "Cuando haya usuarios que coincidan con los filtros, aparecerán aquí.",
  },
);

function initials(user: IAdminUser): string {
  return user.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(value?: string): string {
  if (!value) return "No disponible";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No disponible"
    : new Intl.DateTimeFormat("es-UY", { dateStyle: "medium" }).format(date);
}
</script>

<template>
  <div v-if="loading" class="space-y-3" aria-label="Cargando usuarios">
    <div
      v-for="index in 5"
      :key="index"
      class="h-20 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70"
    />
  </div>

  <AdminEmptyState
    v-else-if="users.length === 0"
    :title="emptyTitle"
    :description="emptyDescription"
  />

  <div v-else>
    <div
      class="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/70 lg:block"
    >
      <table
        class="min-w-[960px] w-full divide-y divide-slate-200 text-left dark:divide-white/10"
      >
        <thead class="bg-slate-50/90 dark:bg-slate-900">
          <tr
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <th class="px-5 py-3 font-semibold">Usuario</th>
            <th class="px-5 py-3 font-semibold">Contacto</th>
            <th class="px-5 py-3 font-semibold">Estado</th>
            <th class="px-5 py-3 font-semibold">Validación</th>
            <th class="px-5 py-3 font-semibold">Rol y organización</th>
            <th class="px-5 py-3 font-semibold">Creación</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-white/6">
          <tr v-for="user in users" :key="user.id" class="align-top">
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                >
                  {{ initials(user) }}
                </div>
                <div class="min-w-0">
                  <p
                    class="truncate font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {{ user.displayName }}
                  </p>
                  <p
                    class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400"
                  >
                    {{ user.username ? `@${user.username}` : "Sin username" }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
              <p>{{ user.email ?? "No disponible" }}</p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{ user.phoneNumber ?? "Sin teléfono" }}
              </p>
            </td>
            <td class="px-5 py-4">
              <AdminBadge
                :label="
                  user.status === 'active'
                    ? 'Activo'
                    : user.status === 'inactive'
                      ? 'Inactivo'
                      : 'No disponible'
                "
                :tone="
                  user.status === 'active'
                    ? 'success'
                    : user.status === 'inactive'
                      ? 'danger'
                      : 'neutral'
                "
              />
            </td>
            <td class="px-5 py-4">
              <AdminBadge
                :label="
                  user.validationStatus === 'validated'
                    ? 'Validado'
                    : user.validationStatus === 'pending'
                      ? 'Pendiente'
                      : 'No disponible'
                "
                :tone="
                  user.validationStatus === 'validated'
                    ? 'success'
                    : user.validationStatus === 'pending'
                      ? 'warning'
                      : 'neutral'
                "
              />
            </td>
            <td class="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
              <p>{{ user.role ?? "Sin rol informado" }}</p>
              <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {{ user.position ?? user.organization ?? "No disponible" }}
              </p>
            </td>
            <td class="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
              {{ formatDate(user.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="space-y-3 lg:hidden">
      <article
        v-for="user in users"
        :key="user.id"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
          >
            {{ initials(user) }}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="truncate font-semibold text-slate-900 dark:text-white">
              {{ user.displayName }}
            </h2>
            <p class="truncate text-sm text-slate-500 dark:text-slate-400">
              {{ user.email ?? "Email no disponible" }}
            </p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <AdminBadge
            :label="
              user.status === 'active'
                ? 'Activo'
                : user.status === 'inactive'
                  ? 'Inactivo'
                  : 'Estado no disponible'
            "
            :tone="
              user.status === 'active'
                ? 'success'
                : user.status === 'inactive'
                  ? 'danger'
                  : 'neutral'
            "
          />
          <AdminBadge
            :label="
              user.validationStatus === 'validated'
                ? 'Validado'
                : user.validationStatus === 'pending'
                  ? 'Pendiente'
                  : 'Validación no disponible'
            "
            :tone="
              user.validationStatus === 'validated'
                ? 'success'
                : user.validationStatus === 'pending'
                  ? 'warning'
                  : 'neutral'
            "
          />
        </div>
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">Teléfono</dt>
            <dd class="mt-1 break-words text-slate-800 dark:text-slate-200">
              {{ user.phoneNumber ?? "No disponible" }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400">Rol</dt>
            <dd class="mt-1 break-words text-slate-800 dark:text-slate-200">
              {{ user.role ?? "No disponible" }}
            </dd>
          </div>
          <div class="col-span-2">
            <dt class="text-xs text-slate-500 dark:text-slate-400">
              Organización o posición
            </dt>
            <dd class="mt-1 break-words text-slate-800 dark:text-slate-200">
              {{ user.position ?? user.organization ?? "No disponible" }}
            </dd>
          </div>
        </dl>
      </article>
    </div>
  </div>
</template>
