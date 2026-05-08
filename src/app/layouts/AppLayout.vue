<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Sidebar = defineAsyncComponent(() => import("@/shared/ui/Sidebar.vue"));
const Header = defineAsyncComponent(() => import("@/shared/ui/Header.vue"));
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  >
    <div
      class="flex min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1020_100%)]"
    >
      <Sidebar />

      <section class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main class="flex-1 overflow-hidden px-4 pb-4">
          <router-view />
        </main>
      </section>
    </div>
  </div>
</template>
