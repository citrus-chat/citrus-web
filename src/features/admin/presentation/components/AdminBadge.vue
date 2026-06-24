<script setup lang="ts">
import { computed } from "vue";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const props = withDefaults(
  defineProps<{
    label: string;
    tone?: BadgeTone;
  }>(),
  { tone: "neutral" },
);

const classes = computed(() => {
  const tones: Record<BadgeTone, string> = {
    success:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    warning:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
    danger:
      "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
    info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
    neutral:
      "bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300",
  };

  return tones[props.tone];
});
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
    :class="classes"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </span>
</template>
