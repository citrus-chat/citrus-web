<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import type { ChatRoom } from "../../domain/Chat.ts";
import { useChatStore } from "../../store/ChatStore.ts";

const NewChatModal = defineAsyncComponent(
  () => import("../components/NewChatModal.vue"),
);

const showModal = ref(false);

const { getChats, getSelectedChat, selectChat } = useChatStore();
const chats = ref<ChatRoom[] | null>(getChats());

const emit = defineEmits<{ "chat-selected": [chat: ChatRoom | null] }>();

const selectChatEvent = (id: number) => {
  selectChat(id);
  emit("chat-selected", getSelectedChat());
};
</script>

<template>
  <section
    class="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
    style="flex: 0 0 38%"
  >
    <div class="mb-3 flex items-center justify-between">
      <h2 class="mb-0 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Chats
      </h2>

      <button
        type="button"
        aria-label="Add chat"
        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
        @click="showModal = true"
      >
        <span class="text-lg leading-none"> + </span>
        Nuevo
      </button>
    </div>

    <div class="flex flex-1 min-h-0 flex-col gap-2 overflow-auto pr-1">
      <div
        v-for="chat in chats"
        :key="chat.id"
        class="chat-item flex cursor-pointer items-center rounded-2xl p-3 transition"
        :class="
          chat.selected
            ? 'border border-sky-300/70 bg-sky-50 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.15)] dark:border-sky-400/20 dark:bg-sky-500/10 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.08)]'
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5'
        "
        @click="selectChatEvent(chat.id)"
      >
        <div class="relative mr-3">
          <img
            src="@/shared/assets/avatar-profile.svg"
            alt="Avatar"
            class="h-10 w-10 rounded-full object-cover"
          />

          <span
            v-if="chat.isActive && !chat.isGroup"
            class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          />
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between w-full">
            <h3
              class="mb-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ chat.name }}
            </h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">{{
              chat.timestamp
            }}</span>
          </div>

          <p class="truncate text-sm text-slate-600 dark:text-slate-400">
            {{
              chat.isGroup
                ? `${chat.lastSender}: ${chat.lastMessage}`
                : chat.lastMessage
            }}
          </p>
        </div>
      </div>
    </div>

    <NewChatModal :show="showModal" @close="showModal = false" />
  </section>
</template>
