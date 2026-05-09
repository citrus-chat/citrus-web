<script setup lang="ts">
import ChatsList from "../components/ChatsList.vue";
import ChatWindow from "../components/ChatWindow.vue";
import { useChatStore } from "../../store/ChatStore.ts";

const { selectedChat } = useChatStore();
</script>

<template>
  <div class="flex flex-1 h-full overflow-hidden">
    <ChatsList />
    <ChatWindow v-if="selectedChat" :chat="selectedChat" class="flex-1" />
    <div v-else class="flex-1 flex items-center justify-center text-slate-400">
      Seleccioná un chat para comenzar
    </div>
  </div>
</template>
