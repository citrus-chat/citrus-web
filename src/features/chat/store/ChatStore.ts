import { ref, computed } from "vue";

import type { IChatRoom } from "../domain/IChatRoom";
import type { WorkspaceUser } from "../domain/WorkspaceUser";
import {
  mockWorkspaceUsers,
  currentWorkspaceUser,
} from "../infrastructure/mock/workspaceUsers";

import { ChatRoomType } from "../domain/ChatRoomType";
import { chatStorage } from "../infrastructure/indexedDb/chatStorage";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import { syncChatsUseCase } from "../application/use-cases/syncChatsUseCase";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import type { IDevice } from "@/features/device/domain/IDevice";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import { getUserPermissionsApi } from "../infrastructure/api/chatApi";
import { getUserApi } from "../infrastructure/api/userApi";

const selectedChat = ref<IChatRoom | null>(null);
const selectedProfileUser = ref<WorkspaceUser | null>(null);

const chats = ref<IChatRoom[]>([]);
const currentUserId = ref<string | null>(null);

export const useChatStore = () => {
  const chatsIsEmpty = computed(() => chats.value.length === 0);

  const { profile } = useProfileStore();
  const currentUser = computed<WorkspaceUser>(() => ({
    ...currentWorkspaceUser,
    id: currentUserId.value ?? currentWorkspaceUser.id,
    username: profile.value?.username ?? currentWorkspaceUser.username,
    avatar:
      profile.value?.avatarUrl ?? currentWorkspaceUser.avatar ?? undefined,
  }));

  const initCurrentUser = async () => {
    const user = await getCurrentUserUseCase();
    if (!user) throw new Error("Current user not found");
    currentUserId.value = user.userId;
  };

  const findWorkspaceUserById = async (
    id: string,
  ): Promise<WorkspaceUser | null> => {
    return (
      (await getUserApi(id)) ??
      mockWorkspaceUsers.find((user) => user.id === id) ??
      null
    );
  };

  const isUserProfilePanelOpen = computed(
    () => selectedProfileUser.value !== null,
  );

  const loadChats = async () => {
    initCurrentUser();
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
      (chat) =>
        chat.type === ChatRoomType.DIRECT && chat.name === user.username,
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
        (user) => user.username.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  };

  const canUserWriteInChat = async (chatId: string | undefined) => {
    const chat = chats.value.find((chat) => chat.id === chatId);

    if (!chat || !currentUser.value) return false;

    const userFoundParticipant = chat?.participants?.find(
      (participant) => participant.userId === currentUser.value.id,
    );

    if (!userFoundParticipant) {
      console.error("User not found in chat participants");
      return false;
    }

    const userPermissions = await getUserPermissionsApi(
      userFoundParticipant.id,
      chat.id,
    );

    const hasSendMessagePermission = userPermissions.permissions?.some(
      (permission) => permission.code === "CAN_SEND_MESSAGE",
    );

    if (hasSendMessagePermission) {
      return false;
    }

    return true;
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

    findWorkspaceUserById,
    findWorkspaceUserByName,

    chatsIsEmpty,
    isUserProfilePanelOpen,

    canUserWriteInChat,
  };
};
