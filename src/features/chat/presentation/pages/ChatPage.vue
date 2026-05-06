<script setup lang="ts">
import Chat from "@/features/chat/presentation/components/Chat.vue";
import ChatsPage from "@/features/chat/presentation/pages/ChatsPage.vue";
</script>

<template>
  <div class="d-flex flex-grow-1 h-100 overflow-hidden">
    <ChatsPage />
    <Chat />
  </div>
</template>
