<script setup lang="ts">
defineProps<{ title?: string }>();
import ThemeToggle from "@/shared/ui/ThemeToggle.vue";
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/75"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div>
        <h6 class="text-lg font-semibold mb-0">
          {{ title || "Dashboard" }}
        </h6>
        <small class="text-slate-500 dark:text-slate-400"
          >Administración del sistema</small
        >
      </div>

      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
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

        <div class="flex items-center gap-3">
          <img
            src="@/shared/assets/avatar-profile.svg"
            alt="Admin"
            class="h-9 w-9 rounded-full object-cover"
          />
          <div class="hidden md:block">
            <div class="font-semibold text-sm">Admin</div>
            <div class="text-slate-500 text-xs dark:text-slate-400">
              Superuser
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
