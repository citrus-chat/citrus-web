<script setup lang="ts">
const messages = [
  {
    id: 1,
    text: "¡Hola a todos!",
    owner: "me",
    timestamp: "22/04/2026 - 21:07",
  },
  {
    id: 2,
    text: "¿Cómo están?",
    owner: "other",
    timestamp: "22/04/2026 - 21:08",
  },
  {
    id: 3,
    text: "¿Alguien tiene novedades sobre el proyecto?",
    owner: "other",
    timestamp: "22/04/2026 - 21:09",
  },
];
</script>

<template>
  <section class="d-flex flex-column flex-grow-1 p-4 overflow-hidden">
    <!-- Header del chat -->
    <div class="d-flex align-items-center gap-2 mb-4">
      <img
        src="@/shared/assets/group-image.jpeg"
        alt="Group Avatar"
        class="rounded-circle object-fit-cover"
        style="width: 40px; height: 40px"
      />

      <h2 class="fs-5 fw-semibold text-secondary mb-0">
        Javalinas Empresariales
      </h2>
    </div>

    <!-- Área de mensajes -->
    <div class="flex-grow-1 overflow-auto mb-4 text-dark">
      <div
        v-for="message in messages"
        :key="message.id"
        class="d-flex mb-2"
        :class="
          message.owner === 'me'
            ? 'justify-content-end'
            : 'justify-content-start'
        "
      >
        <div style="max-width: 50%">
          <div class="d-flex align-items-center gap-3">
            <p class="small text-muted p-2 mb-0">
              {{ message.timestamp }}
            </p>

            <img
              src="@/shared/assets/avatar-profile.svg"
              alt="User Avatar"
              class="rounded-circle mb-1"
              style="width: 32px; height: 32px"
            />
          </div>

          <div
            class="p-3 rounded text-white text-break"
            :class="message.owner === 'me' ? 'bg-primary' : 'bg-secondary'"
          >
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input para enviar mensajes -->
    <div class="d-flex gap-2">
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        class="form-control"
      />

      <button class="btn btn-primary px-4">Enviar</button>
    </div>
  </section>
</template>
