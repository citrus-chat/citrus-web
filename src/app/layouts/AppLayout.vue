<script setup lang="ts">
import Sidebar from "@/shared/ui/Sidebar.vue";
import Header from "@/shared/ui/Header.vue";
</script>

<template>
  <div class="d-flex vh-100 vw-100 overflow-hidden">
    <Sidebar class="shrink-0" style="width: 16rem" />

    <section class="d-flex flex-column flex-grow-1 min-w-0 overflow-hidden">
      <Header />

      <main class="flex-grow-1 overflow-hidden">
        <router-view />
      </main>
    </section>
  </div>
</template>
