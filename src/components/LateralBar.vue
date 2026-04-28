<script setup>
const buttons = [
  { icon: "pi-envelope", label: "Chats" },
  { icon: "pi-users", label: "Contactos" },
  { icon: "pi-flag", label: "Reportes" },
  { icon: "pi-ban", label: "Sanciones" },
  { icon: "pi-chart-bar", label: "Métricas" },
  { icon: "pi-history", label: "Logs" },
];
</script>

<template>
  <section
    class="bg-secondary max-w-64 h-full flex flex-col justify-between py-4 border-r border-gray-500 text-white space-y-3"
  >
    <div>
      <div class="flex items-center space-x-3 px-4 mb-4">
        <img
          src="../assets/citrus-chat.png"
          alt="Citrus Chat logo"
          class="w-14 h-14 rounded-full"
        />
        <div>
          <h1 class="text-2xl font-bold mb-1">Citrus Chat</h1>
          <button type="button" class="text-sm text-gray-300 hover:underline">
            Mi perfil
          </button>
        </div>
      </div>

      <hr class="border-gray-500 mb-2" />

      <div class="flex flex-col justify-center items-center">
        <button
          v-for="{ icon, label } in buttons"
          :key="label"
          class="w-[90%] flex items-center p-2 outline-none hover:bg-primary transition-colors duration-200 rounded"
        >
          <i :class="`pi ${icon} mr-2`" />
          {{ label }}
        </button>
      </div>
    </div>

    <div class="flex flex-col justify-center items-center">
      <hr class="border-gray-500 w-full mb-2" />

      <button
        class="w-[90%] flex items-center p-2 outline-none hover:bg-primary transition-colors duration-200 rounded"
      >
        <i class="pi pi-cog mr-2" />
        Ajustes
      </button>

      <button
        class="w-[90%] flex items-center p-2 outline-none hover:bg-primary transition-colors duration-200 rounded"
      >
        <i class="pi pi-question-circle mr-2" />
        Soporte
      </button>
    </div>
  </section>
</template>
