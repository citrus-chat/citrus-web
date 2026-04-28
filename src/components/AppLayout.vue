<script setup lang="ts">
import Chat from "./Chat.vue";
import Chats from "./Chats.vue";
import Header from "./Header.vue";
import Profile from "./Profile.vue";

import { ref } from "vue";

const showProfile = ref(false);
</script>

<template>
  <section class="flex flex-col flex-1 min-w-0 overflow-hidden">
    <Header @toggle-profile="showProfile = !showProfile" />
    <div class="flex flex-1 min-h-0">
      <Chats :class="showProfile ? 'flex-[0.3]' : 'flex-[0.4]'" />
      <Chat :class="showProfile ? 'flex-[0.4]' : 'flex-[0.6]'" />
      <Transition name="fade">
        <Profile v-if="showProfile" />
      </Transition>
    </div>
  </section>
</template>
