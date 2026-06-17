<script setup lang="ts">
import { useChatStore } from "../../store/ChatStore.ts";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import "primeicons/primeicons.css";
import { ref } from "vue";
import NewChatModal from "./NewChatModal.vue";

const show = ref(false);

const {
  chats,
  selectedChat,
  selectChat,
  lastMessageChatText,
  lastMessageChatTime,
  findWorkspaceUserByName,
  openUserProfile,
} = useChatStore();

const openChatUserProfile = (chatName: string) => {
  const user = findWorkspaceUserByName(chatName);

  if (!user) return;

  openUserProfile(user);
};
</script>

<template>
  <section
    class="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
    style="flex: 0 0 38%"
  >
    <div class="flex justify-between mb-3">
      <h2 class="mb-0 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Chats
      </h2>
      <button @click="show = true">
        <i
          class="pi pi-plus cursor-pointer text-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        />
      </button>
    </div>

    <div class="flex flex-1 min-h-0 flex-col gap-2 overflow-auto pr-1">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item flex cursor-pointer items-center rounded-2xl p-3 transition"
        :class="
          selectedChat?.id === chat.id
            ? 'border border-sky-300/70 bg-sky-50 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.15)] dark:border-sky-400/20 dark:bg-sky-500/10 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.08)]'
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5'
        "
        @click="selectChat(chat.name)"
      >
        <div class="relative mr-3">
          <img
            :src="avatarProfile"
            alt="Avatar"
            class="h-10 w-10 rounded-full object-cover"
            :class="
              chat.type === 'direct'
                ? 'cursor-pointer ring-1 ring-transparent transition hover:ring-orange-400/40'
                : ''
            "
            @click.stop="
              chat.type === 'direct' && openChatUserProfile(chat.name)
            "
          >

          <span
            v-if="chat.type === 'direct'"
            class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          />
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between w-full">
            <h3
              class="mb-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
              :class="
                chat.type === 'direct'
                  ? 'cursor-pointer hover:text-orange-500 dark:hover:text-orange-300'
                  : ''
              "
              @click.stop="
                chat.type === 'direct' && openChatUserProfile(chat.name)
              "
            >
              {{ chat.name }}
            </h3>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ lastMessageChatText(chat.id) }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ lastMessageChatTime(chat.id) }}
          </p>
        </div>
      </div>
    </div>
    <NewChatModal
      :show="show"
      @close="show = false"
    />
  </section>
</template>
