<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    hint?: string;
    tone?: "orange" | "sky" | "emerald" | "slate";
  }>(),
  { hint: undefined, tone: "slate" },
);
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-slate-900/70"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ label }}
        </p>
        <p
          class="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white"
        >
          {{ value }}
        </p>
      </div>
      <span
        class="mt-1 h-3 w-3 rounded-full"
        :class="{
          'bg-orange-500': tone === 'orange',
          'bg-sky-500': tone === 'sky',
          'bg-emerald-500': tone === 'emerald',
          'bg-slate-400': tone === 'slate',
        }"
        aria-hidden="true"
      />
    </div>
    <p
      v-if="hint"
      class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400"
    >
      {{ hint }}
    </p>
  </article>
</template>
