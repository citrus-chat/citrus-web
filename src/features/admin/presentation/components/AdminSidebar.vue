<script setup lang="ts">
import { useRoute } from "vue-router";

import { logoutUseCase } from "@/features/auth/logout/application/use-cases/logoutUseCase";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const route = useRoute();

const items = [
  { label: "Dashboard", to: "/admin", exact: true },
  { label: "Usuarios", to: "/admin/users" },
  { label: "Registrar usuario", to: "/admin/users/new" },
  { label: "Reportes", to: "/admin/reports" },
];

function isActive(item: (typeof items)[number]): boolean {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to);
}

async function logout() {
  emit("close");
  await logoutUseCase();
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 dark:border-white/10 dark:bg-slate-950 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none"
    :class="props.open ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Navegación administrativa"
  >
    <div
      class="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-white/10"
    >
      <RouterLink to="/admin" class="min-w-0" @click="emit('close')">
        <p
          class="text-lg font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          Citrus Admin
        </p>
        <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Panel de administración
        </p>
      </RouterLink>
      <button
        type="button"
        class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
        aria-label="Cerrar navegación"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <nav class="flex-1 space-y-1 p-3" aria-label="Secciones principales">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        :class="
          isActive(item)
            ? 'bg-orange-50 text-orange-800 dark:bg-orange-500/10 dark:text-orange-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
        "
        @click="emit('close')"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="border-t border-slate-100 p-3 dark:border-white/10">
      <p
        class="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
      >
        Sesión
      </p>
      <button
        type="button"
        class="flex min-h-11 w-full items-center rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        @click="logout"
      >
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
