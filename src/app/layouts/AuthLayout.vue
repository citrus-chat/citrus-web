<script setup lang="ts">
import { computed } from "vue";
import useTheme from "@/shared/composables/useTheme";

const { isDark, toggleTheme } = useTheme();
const dark = computed(() => isDark());
</script>

<template>
  <main
    class="auth-page relative min-h-screen flex items-center justify-center px-4 py-6"
  >
    <button
      type="button"
      :aria-label="dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      class="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-100 active:scale-95 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-white/10"
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
        <path
          d="M17.293 13.293a8 8 0 11-10.586-10.586 8 8 0 0010.586 10.586z"
        />
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

    <section class="w-full max-w-md">
      <div class="text-center mb-6">
        <img
          src="@/shared/assets/citrus-chat.png"
          alt="Citrus Chat"
          class="mx-auto mb-4 auth-logo rounded-full shadow-sm"
        />

        <h1 class="mb-1 text-2xl font-bold">Citrus Chat</h1>
        <p class="text-slate-600 dark:text-slate-300">
          Acceso seguro al sistema interno
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/70"
      >
        <router-view />
      </div>
    </section>
  </main>
</template>
