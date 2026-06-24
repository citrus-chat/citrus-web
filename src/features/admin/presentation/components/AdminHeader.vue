<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import ThemeToggle from "@/shared/ui/ThemeToggle.vue";
import { logoutUseCase } from "@/features/auth/logout/application/use-cases/logoutUseCase";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import type { ICurrentUserResponse } from "@/features/profile/domain/ICurrentUserResponse";

const emit = defineEmits<{ openMenu: [] }>();
const route = useRoute();
const currentUser = ref<ICurrentUserResponse | null>(null);

const section = computed(() => {
  const sections: Record<
    string,
    { title: string; subtitle: string; actionLabel?: string; actionTo?: string }
  > = {
    "admin-dashboard": {
      title: "Dashboard",
      subtitle: "Resumen administrativo",
      actionLabel: "Ver usuarios",
      actionTo: "/admin/users",
    },
    "admin-users": {
      title: "Usuarios",
      subtitle: "Directorio interno",
      actionLabel: "Registrar usuario",
      actionTo: "/admin/users/new",
    },
    "admin-users-register": {
      title: "Registrar usuario",
      subtitle: "Nueva cuenta interna",
      actionLabel: "Ver usuarios",
      actionTo: "/admin/users",
    },
    "admin-reports": { title: "Reportes", subtitle: "Módulo en preparación" },
  };

  return sections[String(route.name)] ?? sections["admin-dashboard"]!;
});

async function loadCurrentUser() {
  try {
    currentUser.value = await getCurrentUserUseCase();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Unable to load current administrative user", error);
    }
  }
}

async function logout() {
  await logoutUseCase();
}

onMounted(loadCurrentUser);
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/85 sm:px-6"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="rounded-xl p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
          aria-label="Abrir navegación"
          @click="emit('openMenu')"
        >
          ☰
        </button>
        <div class="min-w-0">
          <p
            class="truncate text-base font-semibold text-slate-950 dark:text-white"
          >
            {{ section.title }}
          </p>
          <p
            class="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block"
          >
            {{ section.subtitle }}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3">
        <RouterLink
          v-if="section.actionLabel && section.actionTo"
          :to="section.actionTo"
          class="hidden rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 sm:inline-flex"
        >
          {{ section.actionLabel }}
        </RouterLink>
        <ThemeToggle />
        <div class="hidden min-w-0 text-right md:block">
          <p
            class="max-w-36 truncate text-sm font-semibold text-slate-900 dark:text-white"
          >
            {{ currentUser?.username ?? "Sesión activa" }}
          </p>
          <p
            class="max-w-44 truncate text-xs text-slate-500 dark:text-slate-400"
          >
            {{ currentUser?.email ?? "Administración" }}
          </p>
        </div>
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          @click="logout"
        >
          Salir
        </button>
      </div>
    </div>
  </header>
</template>
