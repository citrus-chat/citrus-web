<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import "primeicons/primeicons.css";
import { useChatStore } from "../../store/ChatStore";
import { useMessageStore } from "../../../messages/store/MessageStore";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import { ChatRoomType } from "../../domain/ChatRoomType";
import type { StompSubscription } from "@stomp/stompjs";
import { chatRealtimeService } from "../../infrastructure/services/ChatRealtimeService";
import EditGroupModal from "./EditGroupModal.vue";
import { toAbsoluteAvatarUrl } from "@/features/profile/infrastructure/api/publicProfileApi";

const {
  selectedChat,
  findWorkspaceUserByName,
  findWorkspaceUserById,
  openUserProfile,
  currentUser,
  canUserWriteInChat,
  canEditChat,
} = useChatStore();

const { messages, loadMessages, sendMessage, syncMessages } = useMessageStore();
const router = useRouter();

const messageChat = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const firstNewMessageIndex = ref<number | null>(null);
const showChatMenu = ref(false);
const showEditGroupModal = ref(false);
const canWrite = ref(false);
const canEdit = ref(false);

const selectedChatUser = computed(() => {
  if (!selectedChat.value || selectedChat.value.type !== ChatRoomType.DIRECT) {
    return null;
  }

  const byName = findWorkspaceUserByName(selectedChat.value.name);
  if (byName) {
    return byName;
  }

  const otherParticipant = selectedChat.value.participants?.find(
    (participant) => participant.userId !== currentUser.value.id,
  );

  return otherParticipant
    ? findWorkspaceUserById(otherParticipant.userId)
    : null;
});

const selectedChatAvatar = computed(() => {
  const userAvatar = selectedChatUser.value?.avatar;
  if (userAvatar) return userAvatar;

  const messageAvatar = messages.value.find(
    (message) => message.senderUserId === selectedChatUser.value?.id,
  )?.sender?.avatar_url;

  return toAbsoluteAvatarUrl(messageAvatar ?? null) ?? avatarProfile;
});

const canViewDirectProfile = computed(
  () =>
    selectedChat.value?.type === ChatRoomType.DIRECT &&
    !!selectedChatUser.value?.id,
);

const goToSelectedUserProfile = () => {
  if (!selectedChatUser.value?.id) return;
  showChatMenu.value = false;
  router.push({
    name: "user-profile",
    params: { userId: selectedChatUser.value.id },
  });
};

const isGroupChat = computed(
  () => selectedChat.value?.type === ChatRoomType.GROUP,
);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

let subscription: StompSubscription | undefined;

watch(
  () => selectedChat.value?.id,
  async (chatId) => {
    canWrite.value = await canUserWriteInChat(chatId);
    canEdit.value = await canEditChat(chatId);
  },
  { immediate: true },
);

watch(
  () => selectedChat.value?.id,
  async (id) => {
    subscription?.unsubscribe();
    if (id) {
      subscription = chatRealtimeService.subscribeToChatRoom(id, async () => {
        await syncMessages(id);
        await scrollToBottom();
      });
      firstNewMessageIndex.value = null;
      await loadMessages(id);
      firstNewMessageIndex.value = await syncMessages(id);
      await scrollToBottom();
      console.log("Messages after sync:", messages.value);
    }
  },
  { immediate: true },
);

const isOwnMessage = (senderUserId: string) =>
  senderUserId === currentUser.value.id;

const handleMessage = async () => {
  if (!selectedChat.value) return;
  await sendMessage(selectedChat.value.id, messageChat.value);
  messageChat.value = "";
  await scrollToBottom();
};

const toggleChatMenu = () => {
  showChatMenu.value = !showChatMenu.value;
};

const openEditGroup = () => {
  showChatMenu.value = false;
  showEditGroupModal.value = true;
};
</script>

<template>
  <section
    class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-[0_20px_80px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10"
    >
      <div class="flex items-center w-full space-x-3">
        <!-- Chat directo -->
        <div
          v-if="selectedChat?.type === 'DIRECT'"
          class="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5"
        >
          <button
            type="button"
            class="shrink-0 rounded-full transition hover:ring-2 hover:ring-sky-400/40"
            :disabled="!selectedChatUser?.id"
            @click="openUserProfile(selectedChatUser)"
          >
            <img
              :src="selectedChatAvatar"
              :alt="selectedChatUser?.username"
              class="h-9 w-9 rounded-full object-cover"
            />
          </button>

          <div class="min-w-0">
            <h2
              class="truncate text-lg font-semibold text-slate-900 dark:text-slate-50"
            >
              {{ selectedChat.name }}
            </h2>
            <button
              v-if="canViewDirectProfile"
              type="button"
              class="inline-flex whitespace-nowrap text-xs font-medium text-sky-600 transition hover:text-sky-500 hover:underline dark:text-sky-300 dark:hover:text-sky-200"
              @click="goToSelectedUserProfile"
            >
              Ver perfil
            </button>
            <p v-else class="text-xs text-slate-500 dark:text-slate-400">
              Chat directo
            </p>
          </div>
        </div>

        <!-- Grupo u otro tipo: no clickeable -->
        <div v-else class="flex items-center gap-3 px-2 py-1.5">
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

      <div class="flex items-center gap-2 sm:gap-3">
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
        <div class="relative">
          <button type="button" @click="toggleChatMenu">
            <i
              class="pi pi-ellipsis-v cursor-pointer text-xl text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            />
          </button>

          <div
            v-if="showChatMenu"
            class="absolute right-0 top-full z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900"
          >
            <button
              v-if="isGroupChat && canEdit"
              type="button"
              class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
              @click="openEditGroup"
            >
              <i class="pi pi-pencil text-sm" />
              Editar grupo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-auto px-4 py-4 space-y-4"
    >
      <template v-for="(message, index) in messages" :key="message.id">
        <!-- Separador de mensajes nuevos -->
        <div
          v-if="firstNewMessageIndex !== null && index === firstNewMessageIndex"
          class="flex items-center gap-3 my-2"
        >
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span
            class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap"
          >
            Mensajes nuevos
          </span>
          <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <!-- Burbuja -->
        <div
          class="flex"
          :class="
            isOwnMessage(message.senderUserId) ? 'justify-end' : 'justify-start'
          "
        >
          <!-- Mensaje ajeno -->
          <template v-if="!isOwnMessage(message.senderUserId)">
            <div class="flex items-end gap-2 max-w-[70%]">
              <img
                :src="message.sender?.avatar_url ?? avatarProfile"
                :alt="message.sender?.username ?? 'Usuario'"
                class="h-7 w-7 rounded-full object-cover flex-shrink-0"
              />
              <div class="flex flex-col">
                <span
                  class="text-xs text-slate-500 dark:text-slate-400 mb-1 ml-1"
                >
                  {{ message.sender?.username ?? "Usuario" }}
                </span>
                <div
                  class="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 rounded-xl"
                >
                  <span class="text-sm text-slate-900 dark:text-slate-100">
                    {{ message.content }}
                  </span>
                  <p
                    class="mt-1 text-right text-[10px] text-slate-400 dark:text-slate-500"
                  >
                    {{
                      new Date(Number(message.createdAt)).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    }}
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Mensaje propio -->
          <template v-else>
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
          </template>
        </div>
      </template>
    </div>

    <!-- Input -->
    <div
      class="border-t border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/90"
    >
      <div class="mx-auto flex max-w-4xl items-center gap-3">
        <input
          v-model="messageChat"
          type="text"
          placeholder="Escribe un mensaje..."
          class="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500"
          :disabled="!canWrite"
          @keypress.enter="handleMessage"
        />
        <label for="file-upload">
          <i class="pi pi-paperclip cursor-pointer text-2xl" />
          <input id="file-upload" type="file" class="hidden" />
        </label>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          :disabled="!canWrite"
          @click="handleMessage"
        >
          Enviar
        </button>
      </div>
    </div>

    <EditGroupModal
      :show="showEditGroupModal"
      :chat-id="selectedChat?.id ?? null"
      @close="showEditGroupModal = false"
    />
  </section>
</template>
