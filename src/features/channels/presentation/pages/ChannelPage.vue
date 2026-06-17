<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Channel {
  id: number;
  name: string;
  description: string;
  avatarUrl?: string;
}

const channels = ref<Channel[]>([]);
const channelImage =
  "https://cdn2.chicmagazine.com.mx/uploads/media/2023/08/17/whatsapp-canales-sirve-simbolo-foto-1.jpg";

onMounted(() => {
  // Simulate fetching channels
  channels.value = [
    {
      id: 1,
      name: "General",
      description: "Canal general para todos los usuarios",
      avatarUrl: channelImage,
    },
    {
      id: 2,
      name: "Soporte",
      description: "Canal de soporte técnico",
      avatarUrl: channelImage,
    },
  ];
});
</script>

<template>
  <section class="mt-3">
    <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
      Mis Canales
    </h2>

    <ul class="space-y-3">
      <li
        v-for="channel in channels"
        :key="channel.id"
        class="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-2 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-800/50 cursor-pointer"
      >
        <img
          :src="channel.avatarUrl || 'https://via.placeholder.com/40'"
          alt="Channel Avatar"
          class="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h3 class="text-lg font-medium text-slate-900 dark:text-slate-50">
            {{ channel.name }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ channel.description }}
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
