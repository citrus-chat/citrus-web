<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

const items = [
  { icon: "bi-speedometer2", label: "Dashboard", to: "/admin" },
  { icon: "bi-people", label: "Usuarios", to: "/admin/users" },
  { icon: "bi-flag", label: "Reportes", to: "/admin/reports" },
  { icon: "bi-slash-circle", label: "Sanciones", to: "/admin/sanctions" },
  { icon: "bi-bar-chart", label: "Métricas", to: "/admin/metrics" },
  { icon: "bi-clock-history", label: "Logs", to: "/admin/logs" },
];
</script>

<template>
  <aside
    class="bg-dark text-white vh-100 d-flex flex-column border-end"
    style="width: 16rem"
  >
    <!-- Top -->
    <div class="px-3 py-3 border-bottom border-secondary">
      <h5 class="fw-bold mb-0">
        Citrus Admin
      </h5>
      <small class="text-secondary"> Panel de control </small>
    </div>

    <!-- Nav -->
    <nav class="p-2 flex-grow-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="btn w-100 text-start d-flex align-items-center gap-2 mb-1 text-white admin-link"
        :class="{ active: route.path === item.to }"
      >
        <i :class="`bi ${item.icon}`" />
        <span>
          {{ item.label }}
        </span>
      </RouterLink>
    </nav>

    <!-- Bottom -->
    <div class="p-2 border-top border-secondary">
      <button
        class="btn w-100 text-start text-white d-flex align-items-center gap-2 admin-link"
      >
        <i class="bi bi-box-arrow-right" />
        <span> Logout </span>
      </button>
    </div>
  </aside>
</template>
