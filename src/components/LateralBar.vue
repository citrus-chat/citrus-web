<script setup>
const buttons = [
  { icon: 'pi-envelope', label: 'Chats' },
  { icon: 'pi-flag', label: 'Reportes' },
  { icon: 'pi-ban', label: 'Sanciones' },
  { icon: 'pi-chart-bar', label: 'Métricas' },
  { icon: 'pi-history', label: 'Logs' },
  { icon: 'pi-cog', label: 'Ajustes' },
];
</script>

<template>
  <section
    class="bg-secondary max-w-64 h-full flex flex-col py-4 border-r border-gray-500 text-white space-y-3"
  >
    <div class="flex items-center space-x-3 px-4 mb-4">
      <img
        src="../assets/avatar-profile.svg"
        alt="User Avatar"
        class="w-10 h-10 rounded-full"
      />
      <div>
        <h1 class="text-2xl font-bold mb-1">Citrus Chat</h1>
        <p class="text-sm text-gray-300">Admin Dashboard</p>
      </div>
    </div>

    <hr class="border-gray-500" />

    <div class="flex flex-col justify-center items-center">
      <button
        v-for="{ icon, label } in buttons"
        :key="label"
        class="w-[90%] flex items-center p-2 outline-none cursor-pointer hover:bg-primary transition-colors duration-200 rounded"
      >
        <i :class="`pi ${icon} mr-2`"></i>
        {{ label }}
      </button>
    </div>
  </section>
</template>
