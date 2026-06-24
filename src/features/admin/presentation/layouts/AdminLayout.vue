<script setup lang="ts">
import { onMounted, ref } from "vue";

import { checkAdminAccess } from "@/features/admin/application/use-cases/checkAdminAccess";
import AdminHeader from "@/features/admin/presentation/components/AdminHeader.vue";
import AdminSidebar from "@/features/admin/presentation/components/AdminSidebar.vue";

const validatingAccess = ref(true);
const hasAdminAccess = ref(false);
const sidebarOpen = ref(false);

onMounted(async () => {
  try {
    hasAdminAccess.value = await checkAdminAccess();
  } finally {
    validatingAccess.value = false;
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  >
    <div
      v-if="validatingAccess"
      class="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center"
      role="status"
    >
      <span
        class="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500 dark:border-slate-700 dark:border-t-orange-400"
      />
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Validando acceso administrativo…
      </p>
    </div>

    <div
      v-else-if="!hasAdminAccess"
      class="flex min-h-screen items-center justify-center p-6"
    >
      <section
        class="max-w-md rounded-2xl border border-amber-200 bg-white p-6 text-center shadow-sm dark:border-amber-900/50 dark:bg-slate-900"
      >
        <h1 class="text-lg font-semibold text-slate-900 dark:text-white">
          Acceso no autorizado
        </h1>
        <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          No tienes permisos para acceder al panel de administración.
        </p>
        <RouterLink
          to="/"
          class="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
        >
          Volver al chat
        </RouterLink>
      </section>
    </div>

    <div v-else class="flex min-h-screen">
      <button
        v-if="sidebarOpen"
        type="button"
        class="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
        aria-label="Cerrar navegación"
        @click="sidebarOpen = false"
      />
      <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
      <div class="min-w-0 flex-1">
        <AdminHeader @open-menu="sidebarOpen = true" />
        <main class="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>
