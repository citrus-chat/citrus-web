<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), {
  label: "Cargando información…",
});
</script>

<template>
  <div
    class="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center dark:border-white/15 dark:bg-slate-900/40"
    role="status"
    aria-live="polite"
  >
    <span
      class="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500 dark:border-slate-700 dark:border-t-orange-400"
    />
    <p class="text-sm text-slate-600 dark:text-slate-400">
      {{ label }}
    </p>
  </div>
</template>
