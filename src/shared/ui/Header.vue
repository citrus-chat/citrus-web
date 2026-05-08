<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";

const ThemeToggle = defineAsyncComponent(
  () => import("@/shared/ui/ThemeToggle.vue"),
);

const router = useRouter();
const goProfile = () => router.push("/profile");
</script>

<template>
  <header class="sticky top-0 z-20 px-4 pt-4">
    <div
      class="mx-auto flex max-w-[1600px] items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:shadow-none"
    >
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <h1
          class="hidden text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:block"
        >
          Citrus Chat
        </h1>

        <div class="relative w-full max-w-2xl">
          <svg
            class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m0 0A7 7 0 1111 4a7 7 0 015.65 11.65z"
            />
          </svg>

          <input
            type="text"
            placeholder="Buscar chats, mensajes o usuarios..."
            class="w-full rounded-full border border-slate-200 bg-white px-10 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-slate-100"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
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
