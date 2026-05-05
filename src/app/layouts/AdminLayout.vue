<script setup lang="ts">
import AdminSidebar from '@/features/admin/presentation/components/AdminSidebar.vue'
import AdminHeader from '@/features/admin/presentation/components/AdminHeader.vue'
</script>

<template>
  <div class="d-flex vh-100 vw-100 overflow-hidden">
    <AdminSidebar />

    <section class="d-flex flex-column flex-grow-1 min-w-0 overflow-hidden bg-light">
      <AdminHeader />

      <main class="flex-grow-1 overflow-auto">
        <router-view />
      </main>
    </section>
  </div>
</template>