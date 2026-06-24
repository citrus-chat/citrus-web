<script setup lang="ts">
import AdminBadge from "@/features/admin/presentation/components/AdminBadge.vue";
import AdminPageHeader from "@/features/admin/presentation/components/AdminPageHeader.vue";

const reportAreas = [
  {
    title: "Usuarios",
    description: "Indicadores de altas, validaciones y estados de cuenta.",
  },
  {
    title: "Actividad",
    description: "Resumen de actividad administrativa y de sesiones.",
  },
  {
    title: "Seguridad",
    description:
      "Eventos y alertas de seguridad cuando el backend los exponga.",
  },
  {
    title: "Mensajería",
    description: "Métricas operativas cuando exista una API de reportes.",
  },
];
</script>

<template>
  <section class="space-y-6">
    <AdminPageHeader
      title="Reportes"
      subtitle="Este espacio está preparado para los reportes que exponga el backend."
    />

    <div
      class="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 dark:border-sky-900/50 dark:bg-sky-950/20"
    >
      <div class="flex flex-wrap items-center gap-3">
        <AdminBadge label="Módulo en preparación" tone="info" />
        <p class="text-sm text-sky-900 dark:text-sky-200">
          No se muestran métricas simuladas: todavía no hay un endpoint de
          reportes integrado.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <article
        v-for="area in reportAreas"
        :key="area.title"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <h2 class="font-semibold text-slate-900 dark:text-white">
          {{ area.title }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {{ area.description }}
        </p>
        <p
          class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Próximamente
        </p>
      </article>
    </div>
  </section>
</template>
