<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "@/shared/composables/useTheme";

const { theme, toggleTheme } = useTheme();

const dark = computed(() => {
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme.value === "dark" || (theme.value === "system" && prefersDark);
});
</script>

<template>
  <button
    type="button"
    :aria-label="dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-100 active:scale-95 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-white/10"
    @click="toggleTheme"
  >
    <svg
      v-if="dark"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.293 13.293a8 8 0 11-10.586-10.586 8 8 0 0010.586 10.586z" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.03a1 1 0 011.415 1.414l-.707.707a1 1 0 11-1.414-1.414l.706-.707zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM6.464 4.464a1 1 0 010 1.414L5.757 6.585A1 1 0 114.343 5.172l.707-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.22 13.97a1 1 0 011.414-1.414l.707.707a1 1 0 11-1.414 1.414l-.707-.707zM2 9a1 1 0 100 2H1a1 1 0 100-2h1zM15.536 15.536a1 1 0 01-1.414 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414z"
      />
    </svg>
  </button>
</template>
