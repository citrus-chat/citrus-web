<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    actionLabel?: string;
    actionTo?: string;
  }>(),
  {
    actionLabel: undefined,
    actionTo: undefined,
  },
);
</script>

<template>
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
  >
    <div class="min-w-0">
      <h1
        class="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white"
      >
        {{ title }}
      </h1>
      <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {{ subtitle }}
      </p>
    </div>

    <RouterLink
      v-if="actionLabel && actionTo"
      :to="actionTo"
      class="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 sm:w-auto"
    >
      {{ actionLabel }}
    </RouterLink>
  </div>
</template>
