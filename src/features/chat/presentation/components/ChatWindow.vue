<script setup lang="ts">
import { computed, ref, watch } from "vue";
import "primeicons/primeicons.css";
import { useChatStore } from "../../store/ChatStore";
import { useMessageStore } from "../../../messages/store/MessageStore";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import { ChatRoomType } from "../../domain/ChatRoomType";

const { selectedChat, findWorkspaceUserByName, openUserProfile } =
  useChatStore();

const { messages, loadMessages, sendMessage, syncMessages } = useMessageStore();

const messageChat = ref("");

const selectedChatUser = computed(() => {
  if (!selectedChat.value || selectedChat.value.type !== ChatRoomType.DIRECT)
    return null;

  return findWorkspaceUserByName(selectedChat.value.name);
});

watch(
  () => selectedChat.value?.id,
  async (id) => {
    if (id) {
      await loadMessages(id);
      await syncMessages(id);
    }
  },
  { immediate: true },
);

const handleMessage = async () => {
  if (!selectedChat.value) return;
  await sendMessage(selectedChat.value.id, messageChat.value);
  messageChat.value = "";
};
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
  >
    <div
      class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10"
    >
      <div class="flex items-center w-full space-x-3">
        <button
          v-if="selectedChatUser"
          type="button"
          class="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-white/5"
          @click="openUserProfile(selectedChatUser)"
        >
          <img
            :src="selectedChatUser.avatar ?? avatarProfile"
            :alt="selectedChatUser.name"
            class="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {{ selectedChat?.name }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Ver perfil</p>
          </div>
        </button>

        <div v-else class="flex items-center gap-3">
          <img
            :src="avatarProfile"
            alt="Group Avatar"
            class="h-9 w-9 rounded-full object-cover"
          />
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {{ selectedChat?.name }}
          </h2>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button>
          <i
            class="pi pi-video cursor-pointer text-2xl text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          />
        </button>
        <button>
          <i
            class="pi pi-phone cursor-pointer text-xl text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          />
        </button>
        <button>
          <i
            class="pi pi-ellipsis-v cursor-pointer text-xl text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-auto px-4 py-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex justify-end"
      >
        <div class="max-w-[70%]">
          <div class="flex flex-col bg-blue-600 px-4 py-2.5 rounded-xl">
            <span class="text-sm text-white">{{ message.content }}</span>
            <p class="mt-1 text-right text-[10px] text-blue-200">
              {{
                new Date(Number(message.createdAt)).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="border-t border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90"
    >
      <div class="mx-auto flex max-w-4xl items-center gap-3">
        <input
          v-model="messageChat"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
          @keypress.enter="handleMessage"
        />
        <label for="file-upload">
          <i class="pi pi-paperclip cursor-pointer text-2xl" />
          <input id="file-upload" type="file" class="hidden" />
        </label>

        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
          @click="handleMessage"
        >
          Enviar
        </button>
      </div>
    </div>
  </section>
</template>
