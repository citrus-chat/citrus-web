<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description: string;
    actionLabel?: string;
  }>(),
  { actionLabel: undefined },
);

const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div
    class="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center dark:border-white/15 dark:bg-slate-900/40"
  >
    <div
      class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg text-slate-500 dark:bg-slate-800 dark:text-slate-300"
    >
      <span aria-hidden="true">○</span>
    </div>
    <h2 class="mt-4 text-base font-semibold text-slate-900 dark:text-white">
      {{ title }}
    </h2>
    <p
      class="mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400"
    >
      {{ description }}
    </p>
    <button
      v-if="actionLabel"
      type="button"
      class="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/10"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
