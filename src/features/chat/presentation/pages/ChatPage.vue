<script setup lang="ts">
import Chat from '@/features/chat/presentation/components/Chat.vue'
import ChatsPage from '@/features/chat/presentation/pages/ChatsPage.vue'
import ProfilePage from '@/features/profile/presentation/pages/ProfilePage.vue'

import { ref } from 'vue'

const showProfile = ref(false)
</script>

<template>
  <div class="d-flex flex-grow-1 h-100 overflow-hidden">
    <ChatsPage :style="{ flex: showProfile ? '0 0 30%' : '0 0 40%' }" />

    <Chat :style="{ flex: showProfile ? '0 0 40%' : '1 1 auto' }" />

    <Transition name="fade">
      <ProfilePage v-if="showProfile" />
    </Transition>
  </div>
</template>