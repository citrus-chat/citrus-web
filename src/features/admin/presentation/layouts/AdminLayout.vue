<script setup lang="ts">
import AdminHeader from "@/features/admin/presentation/components/AdminHeader.vue";
import AdminSidebar from "@/features/admin/presentation/components/AdminSidebar.vue";
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100 flex"
  >
    <AdminSidebar />

    <section class="flex flex-col flex-1 min-w-0">
      <AdminHeader />

      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </section>
  </div>
</template>
