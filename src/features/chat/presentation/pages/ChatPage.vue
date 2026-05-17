<script setup lang="ts">
import { ref } from "vue";
import ChatsList from "../components/ChatsList.vue";
import ChatWindow from "../components/ChatWindow.vue";
import NewChatModal from "../components/NewChatModal.vue";
import { useChatStore } from "../../store/ChatStore";

const { selectedChat, chatsIsEmpty } = useChatStore();

const isNewChatModalOpen = ref(false);

const openNewChatModal = () => {
  isNewChatModalOpen.value = true;
};

const closeNewChatModal = () => {
  isNewChatModalOpen.value = false;
};
</script>

<template>
  <div class="flex flex-1 h-full overflow-hidden">
    <div
      v-if="chatsIsEmpty"
      class="flex flex-col items-center justify-center flex-1 space-y-4"
    >
      <img
        src="@/shared/assets/citrus-chat.png"
        alt="No chats"
        class="w-36 rounded-[50%]"
      />
      <h2 class="text-2xl font-semibold">Bandeja de Entrada vacía</h2>
      <p class="text-center text-slate-500">
        No tienes conversaciones aún. Inicia una nueva desde el panel lateral
        para comenzar a colaborar con tus contactos. ¡CitrusChat hace que la
        comunicación sea fácil y segura!
      </p>
      <button
        class="px-4 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center space-x-2"
        @click="openNewChatModal"
      >
        <i class="pi pi-plus" />
        <span>Nueva Conversación</span>
      </button>
    </div>
    <ChatsList v-else />
    <ChatWindow v-if="selectedChat" :chat="selectedChat" class="flex-1" />
    <div
      v-else
      class="flex-1 flex-col flex items-center justify-center text-slate-400 space-y-2"
    >
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
    </div>

    <NewChatModal
      v-if="isNewChatModalOpen"
      :show="isNewChatModalOpen"
      @close="closeNewChatModal"
    />
  </div>
</template>
