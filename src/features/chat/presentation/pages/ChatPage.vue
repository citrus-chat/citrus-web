<script setup lang="ts">
import Chat from "@/features/chat/presentation/components/Chat.vue";
import ChatsPage from "@/features/chat/presentation/pages/ChatsPage.vue";
</script>

<template>
  <div class="flex flex-1 h-full overflow-hidden">
    <ChatsPage />
    <Chat />
  </div>
</template>
