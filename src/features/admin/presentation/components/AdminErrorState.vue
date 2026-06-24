<script setup lang="ts">
withDefaults(defineProps<{ message?: string }>(), {
  message: "No pudimos cargar esta información.",
});

const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    class="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20"
    role="alert"
  >
    <h2 class="text-base font-semibold text-red-900 dark:text-red-200">
      No se pudo completar la carga
    </h2>
    <p class="mt-1 max-w-md text-sm leading-6 text-red-700 dark:text-red-300">
      {{ message }}
    </p>
    <button
      type="button"
      class="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:bg-red-600 dark:hover:bg-red-500"
      @click="emit('retry')"
    >
      Reintentar
    </button>
  </div>
</template>
