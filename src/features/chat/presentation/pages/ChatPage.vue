<script setup lang="ts">
import { onMounted } from "vue";
import ChatsList from "../components/ChatsList.vue";
import ChatWindow from "../components/ChatWindow.vue";
import { useChatStore } from "../../store/ChatStore";
import { tokenService } from "@/core/auth/tokenService.ts";
import { chatRealtimeService } from "../../infrastructure/services/ChatRealtimeService.ts";
import { useUserStore } from "../../store/UserStore.ts";

const { selectedChat, chatsIsEmpty, loadChats, restoreSelectedChat } =
  useChatStore();

const { loadUsers } = useUserStore();

onMounted(async () => {
  const token = tokenService.getAccessToken();
  if (token) {
    chatRealtimeService.connect(token);
  }
  await loadChats();
  restoreSelectedChat();
  // Cargar usuarios reales del backend para poder obtener sus UUIDs al navegar al perfil
  await loadUsers();
});
</script>

<template>
  <div class="flex flex-1 h-full overflow-hidden">
    <ChatsList />

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <ChatWindow
        v-if="selectedChat"
        :chat="selectedChat"
        class="flex-1 min-h-0"
      />
      <div
        v-else
        class="flex-1 flex-col flex items-center justify-center text-slate-400 space-y-2"
      >
        <template v-if="chatsIsEmpty">
          <img
            src="@/shared/assets/CitrusChatNoLetters.png"
            alt="No chats"
            class="w-36 rounded-[50%]"
          />
          <h2 class="text-2xl font-semibold">Bandeja de Entrada vacía</h2>
          <p class="text-center text-slate-500">
            Buscá una persona en el buscador superior para iniciar una
            conversación. ¡CitrusChat hace que la comunicación sea fácil y
            segura!
          </p>
        </template>
        <template v-else>
          <h2 class="text-3xl font-semibold">CitrusChat Workspace</h2>
          <div class="flex space-x-4 mt-3 text-white">
            <div class="p-2 bg-slate-400 rounded-md dark:bg-slate-600">
              <i class="pi pi-lock" />
              End-to-End Encryption
            </div>
            <div class="p-2 bg-slate-400 rounded-md dark:bg-slate-600">
              <i class="pi pi-sync" />
              Real-time Synchronization
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
