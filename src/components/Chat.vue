<script setup>
const messages = [
  {
    id: 1,
    text: "Hola a todos!",
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
  <section class="flex-1 p-4 flex flex-col">
    <!-- Header del chat -->
    <div class="flex space-x-2 items-center mb-4">
      <img
        src="../assets/group-image.jpeg"
        alt="Group Avatar"
        class="w-10 h-10 rounded-full object-cover"
      >
      <h2 class="text-lg font-semibold text-secondary">
        Javalinas Empresariales
      </h2>
    </div>

    <!-- Área de mensajes -->
    <div class="flex-1 overflow-y-auto mb-4 text-black">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex mb-2"
        :class="message.owner === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div class="flex flex-col max-w-[50%]">
          <div class="flex space-x-3">
            <p class="text-xs text-gray-500 p-2">
              {{ message.timestamp }}
            </p>
            <img
              src="../assets/avatar-profile.svg"
              alt="User Avatar"
              class="w-8 h-8 rounded-full mb-1"
            >
          </div>

          <div
            class="p-3 w-full rounded-lg wrap-break-word text-white"
            :class="message.owner === 'me' ? 'bg-primary ' : 'bg-secondary'"
          >
            {{ message.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- Input para enviar mensajes -->
    <div class="flex space-x-2">
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        class="flex-1 p-2 border border-gray-300 outline rounded focus:outline-none focus:ring-2 focus:ring-primary"
      >
      <button
        class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors duration-200"
      >
        Enviar
      </button>
    </div>
  </section>
</template>
