<script setup lang="ts">
import { computed, nextTick, watch } from "vue";
import "primeicons/primeicons.css";
import { useChatStore } from "../../store/ChatStore";
import avatarProfile from "@/shared/assets/avatar-profile.svg";
import { ref } from "vue";

const {
  messages,
  selectedChat,
  findWorkspaceUserByName,
  openUserProfile,
  sendMessage,
} = useChatStore();

const menuButtons = [
  { icon: "pi pi-thumbtack", label: "Fijar" },
  { icon: "pi pi-reply", label: "Reenviar" },
  { icon: "pi pi-pencil", label: "Editar" },
  { icon: "pi pi-trash", label: "Eliminar", danger: true },
];

const messageChat = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const openMenuId = ref<number | null>(null);
const menuPosition = ref({ x: 0, y: 0 });

const toggleMenu = (messageId: number, event: MouseEvent) => {
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const menuWidth = 140;

  const left =
    rect.right + menuWidth > window.innerWidth
      ? rect.left - menuWidth
      : rect.left;

  menuPosition.value = { x: left, y: rect.bottom + 8 };
  openMenuId.value = openMenuId.value === messageId ? null : messageId;
};

const closeMenu = () => {
  openMenuId.value = null;
};

const selectedChatUser = computed(() => {
  if (!selectedChat.value || selectedChat.value.type !== "direct") return null;

  return findWorkspaceUserByName(selectedChat.value.name);
});

const handleMessage = () => {
  if (!selectedChat.value) {
    alert("No chat selected.");
    return;
  }

  sendMessage(selectedChat.value.id, messageChat.value);
};

watch(messages, async () => {
  await nextTick();
  messagesContainer.value?.scrollTo({
    top: messagesContainer.value.scrollHeight,
    behavior: "smooth",
  });
});
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
          >
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {{ selectedChat?.name }}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Ver perfil
            </p>
          </div>
        </button>

        <div v-else>
          <img
            :src="avatarProfile"
            alt="Group Avatar"
            class="h-9 w-9 rounded-full object-cover"
          >
        </div>

        <div v-if="!selectedChatUser">
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

    <div
      ref="messagesContainer"
      class="flex-1 overflow-auto px-4 py-4 space-y-4"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
      >
        <div class="max-w-[70%]">
          <div
            class="mb-2 flex items-center gap-3"
            :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
          >
            <p class="text-xs text-slate-500 dark:text-slate-500">
              {{
                message.deliveredAt
                  ? new Date(message.deliveredAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : ""
              }}
            </p>
            <img
              src="@/shared/assets/avatar-profile.svg"
              alt="User Avatar"
              class="h-8 w-8 rounded-full object-cover"
            >
          </div>

          <div
            class="flex flex-col bg-slate-100 px-4 py-2.5 rounded-xl dark:bg-slate-800"
          >
            <div class="flex items-center justify-between relative">
              <p
                class="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                :class="message.sender === 'me' ? 'text-right' : 'text-left'"
              >
                {{ message.sender }}
              </p>

              <div class="relative">
                <button @click="toggleMenu(message.id, $event)">
                  <i
                    class="pi pi-angle-down cursor-pointer text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  />
                </button>

                <div
                  v-if="openMenuId === message.id"
                  :style="{
                    position: 'fixed',
                    top: menuPosition.y + 'px',
                    left: menuPosition.x + 'px',
                  }"
                  class="z-50 min-w-35 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-slate-900"
                >
                  <div class="flex flex-col items-start">
                    <button
                      v-for="button in menuButtons"
                      :key="button.label"
                      class="w-full text-left space-x-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5"
                      :class="
                        button.danger
                          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                          : 'text-slate-700 dark:text-slate-200'
                      "
                      @click="closeMenu"
                    >
                      <i
                        class="text-xs"
                        :class="[
                          button.icon,
                          button.danger
                            ? 'text-red-500'
                            : 'text-slate-700 dark:text-slate-200',
                        ]"
                      />
                      <span class="text-sm">{{ button.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <span class="text-sm">
              {{ message.text }}
            </span>
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
        >
        <div>
          <i class="pi pi-paperclip cursor-pointer text-2xl" />
          <input
            id="file-upload"
            type="file"
            class="hidden"
          >
        </div>

        <button
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
          @keypress.enter="handleMessage"
          @click="handleMessage"
        >
          Enviar
        </button>
      </div>
    </div>
  </section>
</template>
