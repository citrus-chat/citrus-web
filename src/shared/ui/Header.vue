<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import "primeicons/primeicons.css";

const ThemeToggle = defineAsyncComponent(
  () => import("@/shared/ui/ThemeToggle.vue"),
);

const router = useRouter();
const goProfile = () => router.push("/profile");
</script>

<template>
  <header class="sticky top-0 z-20 px-4 pt-4">
    <div
      class="mx-auto flex max-w-400 items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div class="flex items-center w-full max-w-2xl relative">
          <i
            class="pi pi-search absolute left-3 text-slate-400 pointer-events-none"
          />

          <input
            type="text"
            placeholder="Buscar chats, mensajes o usuarios..."
            class="w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <i class="pi pi-bell text-lg" />
        </button>

        <ThemeToggle />

        <button
          class="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-2 py-1 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/60 dark:hover:bg-white/5"
          @click="goProfile"
        >
          <img
            src="@/shared/assets/avatar-profile.svg"
            alt="Avatar"
            class="h-8 w-8 rounded-full object-cover"
          />
        </button>
      </div>
    </div>
  </header>
</template>
