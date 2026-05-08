<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();

const items = [
  { icon: "grid", label: "Dashboard", to: "/admin" },
  { icon: "users", label: "Usuarios", to: "/admin/users" },
  { icon: "flag", label: "Reportes", to: "/admin/reports" },
];
</script>

<template>
  <aside
    class="w-72 bg-white/80 border-r border-slate-200 dark:bg-slate-950/80 dark:border-white/10 flex flex-col"
  >
    <div class="px-4 py-4 border-b border-slate-100 dark:border-white/6">
      <h5 class="text-lg font-semibold">Citrus Admin</h5>
      <small class="text-slate-500 dark:text-slate-400">Panel de control</small>
    </div>

    <nav class="p-3 flex-1 space-y-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10"
        :class="{
          'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300':
            route.path === item.to,
        }"
      >
        <svg
          v-if="item.icon === 'grid'"
          class="h-5 w-5 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
          />
        </svg>
        <svg
          v-else-if="item.icon === 'users'"
          class="h-5 w-5 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 11a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <svg
          v-else
          class="h-5 w-5 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4"
          />
        </svg>

        <span class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="p-3 border-t border-slate-100 dark:border-white/6">
      <button
        class="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
      >
        <svg
          class="h-5 w-5 text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7"
          />
        </svg>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>
