<script lang="ts" setup>
import { ref, onMounted } from "vue";

interface Report {
  id: number;
  title: string;
  description: string;
  date: string;
}

const reports = ref<Report[]>([]);

onMounted(() => {
  reports.value = [
    {
      id: 1,
      title: "Reporte de Finanzas",
      description: "Problemas con el balance mensual.",
      date: "2024-06-01",
    },
    {
      id: 2,
      title: "Reporte de Soporte",
      description: "Incidente con el sistema de tickets.",
      date: "2024-06-05",
    },
    {
      id: 3,
      title: "Reporte de Seguridad",
      description: "Vulnerabilidad detectada en la aplicación.",
      date: "2024-06-10",
    },
  ];
});
</script>

<template>
  <section class="mt-3">
    <ul class="space-y-3">
      <li
        v-for="report in reports"
        :key="report.id"
        class="rounded-lg border border-slate-200 px-4 py-2 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-800/50 cursor-pointer"
      >
        <div class="flex items-center space-x-5">
          <i
            class="pi pi-chart-bar text-2xl text-slate-500 dark:text-slate-400"
          />
          <div class="flex-1 flex-col">
            <h3 class="text-lg font-medium text-slate-900 dark:text-slate-50">
              {{ report.title }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ report.description }}
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Reportado el {{ report.date }}
            </p>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
