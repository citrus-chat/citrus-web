<script setup lang="ts">
import { computed } from "vue";
import { useTheme } from "@/shared/composables/useTheme";
import "primeicons/primeicons.css";

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
    <i :class="dark ? 'pi pi-sun' : 'pi pi-moon'" class="text-lg" />
  </button>
</template>
