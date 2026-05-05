<script setup lang="ts">
const chats = [
  {
    id: 1,
    name: "Javalinas Empresariales",
    lastMessage: "¿Alguien tiene novedades sobre el proyecto?",
    timestamp: "10:30 AM",
    selected: true,
    isGroup: true,
    lastSender: "FrancoGei",
    isActive: false,
  },
  {
    id: 2,
    name: "María",
    lastMessage: "Nos vemos mañana",
    timestamp: "9:15 AM",
    selected: false,
    isGroup: false,
    lastSender: "María",
    isActive: true,
  },
  {
    id: 3,
    name: "Carlos",
    lastMessage: "¿Puedes enviarme el archivo?",
    timestamp: "8:45 AM",
    lastSender: "Carlos",
    selected: false,
    isGroup: false,
    isActive: true,
  },
];
</script>

<template>
  <section class="p-4 overflow-auto" style="flex: 0 0 40%">
    <!-- Search -->
    <div class="input-group mb-4">
      <button
        class="btn btn-outline-secondary"
        type="button"
        aria-label="Buscar chats"
      >
        <i class="bi bi-search"></i>
      </button>

      <input
        type="text"
        placeholder="Buscar en Citrus Chat..."
        class="form-control"
      />
    </div>

    <!-- Title -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="fs-3 fw-bold mb-0">Chats</h2>

      <button
        type="button"
        aria-label="Add chat"
        class="btn btn-link text-primary p-0"
      >
        <i class="bi bi-plus-lg fs-5"></i>
      </button>
    </div>

    <!-- Chat list -->
    <div class="d-flex flex-column gap-1">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="d-flex align-items-center p-3 rounded cursor-pointer chat-item"
        :class="{ 'border-start border-5 border-primary': chat.selected }"
      >
        <div class="position-relative me-3">
          <img
            src="@/shared/assets/avatar-profile.svg"
            alt="Avatar"
            class="rounded-circle"
            style="width: 40px; height: 40px"
          />

          <span
            v-if="chat.isActive && !chat.isGroup"
            class="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
            style="width: 12px; height: 12px"
          />
        </div>

        <div class="d-flex flex-column flex-grow-1 min-w-0">
          <div class="d-flex align-items-center justify-content-between w-100">
            <h3 class="fs-5 fw-semibold mb-0 text-truncate">
              {{ chat.name }}
            </h3>

            <span class="small text-muted ms-2 flex-shrink-0">
              {{ chat.timestamp }}
            </span>
          </div>

          <p class="small text-muted text-truncate mb-0">
            {{
              chat.isGroup
                ? `${chat.lastSender}: ${chat.lastMessage}`
                : chat.lastMessage
            }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
