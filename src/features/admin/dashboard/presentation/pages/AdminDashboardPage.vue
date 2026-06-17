<script setup lang="ts">
const stats = [
  { label: "Usuarios", value: 1240 },
  { label: "Chats activos", value: 342 },
  { label: "Reportes", value: 18 },
  { label: "Sanciones", value: 7 },
];
</script>

<template>
  <section>
    <div class="mb-6">
      <h2 class="text-2xl font-bold">Dashboard</h2>
      <p class="text-slate-600 dark:text-slate-400">
        Resumen general del sistema
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <div class="flex items-center gap-4">
          <div
            class="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center"
          >
            <svg
              class="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 7h4v4H3zM10 7h4v4h-4zM17 7h4v4h-4zM3 14h4v4H3zM10 14h4v4h-4zM17 14h4v4h-4z"
              />
            </svg>
          </div>

          <div>
            <div class="text-lg font-semibold">
              {{ stat.value }}
            </div>
            <div class="text-sm text-slate-500 dark:text-slate-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
    >
      <h5 class="font-semibold mb-3">Actividad reciente</h5>
      <ul class="space-y-3">
        <li
          class="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300"
        >
          <span>Nuevo usuario registrado</span>
          <small class="text-slate-500 dark:text-slate-400">hace 5 min</small>
        </li>

        <li
          class="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300"
        >
          <span>Reporte enviado</span>
          <small class="text-slate-500 dark:text-slate-400">hace 20 min</small>
        </li>

        <li
          class="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300"
        >
          <span>Usuario bloqueado</span>
          <small class="text-slate-500 dark:text-slate-400">hace 1 hora</small>
        </li>
      </ul>
    </div>
  </section>
</template>
