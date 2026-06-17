<script setup lang="ts">
const users = [
  {
    id: "1",
    username: "nacho",
    email: "nacho@citrus.com",
    phoneNumber: "+59899123456",
    status: "Activo",
  },
];
</script>

<template>
  <section>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold">Usuarios</h2>
        <p class="text-slate-600 dark:text-slate-400">
          Gestión de usuarios del sistema
        </p>
      </div>

      <RouterLink
        to="/admin/users/register"
        class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
      >
        Crear usuario
      </RouterLink>
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white overflow-auto shadow-sm dark:border-white/10 dark:bg-slate-900/70"
    >
      <table class="min-w-full divide-y divide-slate-100 dark:divide-white/6">
        <thead class="bg-slate-50 dark:bg-slate-900/60">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Username
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Teléfono
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Estado
            </th>
            <th
              class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
            >
              Acciones
            </th>
          </tr>
        </thead>
        <tbody
          class="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-white/6"
        >
          <tr v-for="user in users" :key="user.id">
            <td
              class="px-6 py-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ user.username }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300"
            >
              {{ user.email }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-slate-700 dark:text-slate-300"
            >
              {{ user.phoneNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                >{{ user.status }}</span
              >
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                class="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
              >
                Ver
              </button>
              <button
                class="ml-2 inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
              >
                Desactivar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
