<script setup lang="ts">
import { useChatStore } from "../../store/ChatStore.ts";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import "primeicons/primeicons.css";
import { ref, watch } from "vue";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import { messageStorage } from "@/features/messages/infrastructure/indexedDb/messageStorage";
import { getUserApi } from "@/features/chat/infrastructure/api/userApi";
import { toAbsoluteAvatarUrl } from "@/features/profile/infrastructure/api/publicProfileApi";
import type { IChatRoom } from "../../domain/IChatRoom";
import NewChatModal from "./NewChatModal.vue";
import { ChatRoomType } from "../../domain/ChatRoomType";

const show = ref(false);

const {
  chats,
  selectedChat,
  selectChat,
  findWorkspaceUserByName,
  findWorkspaceUserById,
  openUserProfile,
  currentUser,
} = useChatStore();

const getDirectChatUser = (chat: IChatRoom) => {
  if (chat.type !== ChatRoomType.DIRECT) return null;

  const byName = findWorkspaceUserByName(chat.name);
  if (byName) return byName;

  const otherParticipant = chat.participants?.find(
    (participant) => participant.userId !== currentUser.value.id,
  );

  return otherParticipant
    ? findWorkspaceUserById(otherParticipant.userId)
    : null;
};

// Cache for avatars extracted from stored messages to avoid repeated lookups
const messageAvatarCache = ref<Record<string, string | null>>({});

// Clear avatar cache when current user's profile changes (e.g., avatar updated)
const { profile: profileRef } = useProfileStore();
watch(
  () => profileRef.value?.avatarUrl,
  () => {
    messageAvatarCache.value = {};
  },
);

const ensureMessageAvatar = async (chat: IChatRoom) => {
  if (messageAvatarCache.value[chat.id] !== undefined) return;

  try {
    const stored = await messageStorage.getByConversationId(chat.id);
    // Iterate from the end to find the last message sent by the OTHER participant
    for (let i = stored.length - 1; i >= 0; i--) {
      const msg = stored[i];
      if (!msg) continue;
      if (msg.senderUserId && msg.senderUserId !== currentUser.value.id) {
        try {
          const user = await getUserApi(msg.senderUserId);
          messageAvatarCache.value[chat.id] =
            toAbsoluteAvatarUrl(user.avatar_url) ?? avatarProfile;
        } catch {
          messageAvatarCache.value[chat.id] = avatarProfile;
        }
        return;
      }
    }

    // No suitable sender found
    messageAvatarCache.value[chat.id] = null;
  } catch {
    messageAvatarCache.value[chat.id] = null;
  }
};

const getChatAvatar = (chat: IChatRoom) => {
  if (chat.type !== ChatRoomType.DIRECT) return avatarProfile;

  const user = getDirectChatUser(chat);
  if (user && user.avatar) return user.avatar;

  // If we already resolved an avatar from messages, return it (or fallback)
  const cached = messageAvatarCache.value[chat.id];
  if (cached !== undefined && cached !== null) return cached;

  // Kick off an async resolution but return the generic avatar for now
  // (the cache will update and Vue will re-render when ready)
  void ensureMessageAvatar(chat);

  return avatarProfile;
};

const formatChatTime = (createdAt?: string) => {
  if (!createdAt) return "";

  const numeric = Number(createdAt);
  const parsedDate = Number.isFinite(numeric)
    ? new Date(numeric)
    : new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openChatUserProfile = (chat: IChatRoom) => {
  const user = getDirectChatUser(chat);

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
      <button
        type="button"
        aria-label="Nuevo chat"
        class="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 text-slate-500 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-white/10 dark:text-slate-400 dark:hover:border-orange-300/30 dark:hover:bg-orange-400/10 dark:hover:text-orange-400"
        @click="show = true"
      >
        <i class="pi pi-plus text-sm" />
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
        @click="selectChat(chat.id)"
      >
        <div class="relative mr-3">
          <img
            :src="getChatAvatar(chat)"
            alt="Avatar"
            class="h-10 w-10 rounded-full object-cover"
            :class="
              chat.type === ChatRoomType.DIRECT
                ? 'cursor-pointer ring-1 ring-transparent transition hover:ring-orange-400/40'
                : ''
            "
            @click.stop="
              chat.type === ChatRoomType.DIRECT && openChatUserProfile(chat)
            "
          />

          <span
            v-if="chat.type === ChatRoomType.DIRECT"
            class="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          />
        </div>

        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between w-full">
            <h3
              class="mb-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
              :class="
                chat.type === ChatRoomType.DIRECT
                  ? 'cursor-pointer hover:text-orange-500 dark:hover:text-orange-300'
                  : ''
              "
              @click.stop="
                chat.type === ChatRoomType.DIRECT && openChatUserProfile(chat)
              "
            >
              {{ chat.name }}
            </h3>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-slate-400 dark:text-slate-500">
                {{ formatChatTime(chat.lastMessage?.createdAt) }}
              </span>
              <span
                v-if="(chat.unreadCount ?? 0) > 0"
                class="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-2 rounded-full bg-rose-500 text-white text-xs font-semibold"
              >
                {{ chat.unreadCount }}
              </span>
            </div>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400 truncate">
            {{ chat.lastMessage?.content ?? "" }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            <!-- {{ lastMessageChatTime(chat.id) }} -->
          </p>
        </div>
      </div>
    </div>

    <NewChatModal :show="show" @close="show = false" />
  </section>
</template>
