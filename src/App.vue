<script setup>
import Chat from "./components/Chat.vue";
import Chats from "./components/Chats.vue";
import LateralBar from "./components/LateralBar.vue";
import AppLayout from "./components/AppLayout.vue";
</script>

<template>
  <LateralBar class="flex-[0.4]" />
  <div class="flex flex-1 min-w-0 overflow-hidden">
    <Chats />
    <Chat />
  </div>
</template>
