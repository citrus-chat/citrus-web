import { ref, computed } from "vue";

import type { IChatRoom } from "../domain/IChatRoom";
import type { WorkspaceUser } from "../domain/WorkspaceUser";
import {
  mockWorkspaceUsers,
  currentWorkspaceUser,
} from "../infrastructure/mock/workspaceUsers";

import { ChatRoomType } from "../domain/ChatRoomType";
import { chatStorage } from "../infrastructure/indexedDb/chatStorage";
import { syncChatsUseCase } from "../application/use-cases/syncChatsUseCase";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import type { IDevice } from "@/features/device/domain/IDevice";

const selectedChat = ref<IChatRoom | null>(null);
const selectedProfileUser = ref<WorkspaceUser | null>(null);

const chats = ref<IChatRoom[]>([]);

export const useChatStore = () => {
  const chatsIsEmpty = computed(() => chats.value.length === 0);

  const currentUser = computed(() => currentWorkspaceUser);

  const isUserProfilePanelOpen = computed(
    () => selectedProfileUser.value !== null,
  );

  const loadChats = async () => {
    const device: IDevice | null = await deviceStorage.get();
    if (device) {
      try {
        await syncChatsUseCase(device);
      } catch (error) {
        console.error("Failed to sync chats", error);
      }
    }
    chats.value = await chatStorage.getAll();
  };

  const restoreSelectedChat = () => {
    const selectedChatId = localStorage.getItem("selectedChatId");

    if (!selectedChatId) {
      return;
    }

    selectedChat.value =
      chats.value.find((chat) => chat.id === selectedChatId) ?? null;
  };

  const chatExists = (name: string) => {
    return chats.value.some(
      (chat) => chat.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const selectChat = (chatId: string | null) => {
    if (!chatId) {
      selectedChat.value = null;
      localStorage.removeItem("selectedChatId");
      return;
    }

    const chat = chats.value.find((chat) => chat.id === chatId) ?? null;

    selectedChat.value = chat;

    localStorage.setItem("selectedChatId", chatId);
  };

  const openDirectMessage = (user: WorkspaceUser) => {
    const existingChat = chats.value.find(
      (chat) => chat.type === ChatRoomType.DIRECT && chat.name === user.name,
    );

    if (!existingChat) {
      return;
    }

    selectChat(existingChat.id);
  };

  const openUserProfile = (user: WorkspaceUser) => {
    selectedProfileUser.value = user;
  };

  const closeUserProfile = () => {
    selectedProfileUser.value = null;
  };

  const findWorkspaceUserByName = (name: string) => {
    return (
      mockWorkspaceUsers.find(
        (user) => user.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  };

  return {
    chats,
    selectedChat,
    selectedProfileUser,

    loadChats,
    restoreSelectedChat,

    selectChat,
    chatExists,

    openDirectMessage,

    openUserProfile,
    closeUserProfile,

    currentUser,
    workspaceUsers: computed(() => mockWorkspaceUsers),

    findWorkspaceUserByName,

    chatsIsEmpty,
    isUserProfilePanelOpen,
  };
};
