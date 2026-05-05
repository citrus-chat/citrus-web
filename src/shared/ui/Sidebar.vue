<script setup lang="ts">
const buttons = [
  { icon: "bi-chat", label: "Chats" },
  { icon: "bi-people", label: "Contactos" },
  { icon: "bi-flag", label: "Reportes" },
  { icon: "bi-slash-circle", label: "Sanciones" },
  { icon: "bi-bar-chart", label: "Métricas" },
  { icon: "bi-clock-history", label: "Logs" },
];
</script>

<template>
  <section
    class="bg-dark text-white d-flex flex-column justify-content-between vh-100 border-end"
    style="width: 16rem"
  >
    <div>
      <!-- Header -->
      <div class="d-flex align-items-center gap-3 px-3 py-3">
        <img
          src="@/shared/assets/citrus-chat.png"
          alt="Citrus Chat logo"
          class="rounded-circle"
          style="width: 56px; height: 56px"
        />
        <div>
          <h5 class="mb-1 fw-bold">Citrus Chat</h5>
          <button
            class="btn btn-link text-decoration-none text-secondary p-0 small"
          >
            Mi perfil
          </button>
        </div>
      </div>

      <hr class="border-secondary my-2" />

      <!-- Navigation -->
      <div class="px-2">
        <button
          v-for="{ icon, label } in buttons"
          :key="label"
          class="btn w-100 sidebar-btn text-start text-white d-flex align-items-center gap-2 mb-1"
        >
          <i :class="icon" />
          {{ label }}
        </button>
      </div>
    </div>

    <!-- Bottom -->
    <div class="px-2 pb-3">
      <hr class="border-secondary mb-2" />

      <button
        class="btn w-100 sidebar-btn text-start text-white d-flex align-items-center gap-2 mb-1"
      >
        <i class="bi bi-gear" />
        Ajustes
      </button>

      <button
        class="btn w-100 sidebar-btn text-start text-white d-flex align-items-center gap-2"
      >
        <i class="bi bi-question-circle" />
        Soporte
      </button>
    </div>
  </section>
</template>
