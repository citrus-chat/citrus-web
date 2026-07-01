import { ref, computed, toRaw } from "vue";

import type { IChatRoom } from "../domain/IChatRoom";
import type { WorkspaceUser } from "../domain/WorkspaceUser";
import {
  mockWorkspaceUsers,
  currentWorkspaceUser,
} from "../infrastructure/mock/workspaceUsers";
import { ChatRoomType } from "../domain/ChatRoomType";
import { chatStorage } from "../infrastructure/indexedDb/chatStorage";
import { messageStorage } from "@/features/messages/infrastructure/indexedDb/messageStorage";
import { useProfileStore } from "@/features/profile/Store/ProfileStore";
import { syncChatsUseCase } from "../application/use-cases/syncChatsUseCase";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import type { IDevice } from "@/features/device/domain/IDevice";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import {
  getUserPermissionsApi,
  updateChatRoomNameApi,
} from "../infrastructure/api/chatApi";
import { useUserStore } from "./UserStore";
import type { IUserResponse } from "../domain/IUserResponse";
import { toAbsoluteAvatarUrl } from "@/features/profile/infrastructure/api/publicProfileApi";

const selectedChat = ref<IChatRoom | null>(null);
const selectedProfileUser = ref<WorkspaceUser | null>(null);

const chats = ref<IChatRoom[]>([]);
const currentUserId = ref<string | null>(null);

export const useChatStore = () => {
  const chatsIsEmpty = computed(() => chats.value.length === 0);

  const { loadProfile, profile } = useProfileStore();
  const { users } = useUserStore();
  const currentUser = computed<WorkspaceUser>(() => ({
    ...currentWorkspaceUser,
    id: currentUserId.value ?? currentWorkspaceUser.id,
    username: profile.value?.username ?? currentWorkspaceUser.username,
    avatar:
      profile.value?.avatarUrl ?? currentWorkspaceUser.avatar ?? undefined,
  }));

  const initCurrentUser = async () => {
    try {
      const user = await getCurrentUserUseCase();
      if (!user) throw new Error("Current user not found");
      // Setear currentUserId antes de loadProfile para que currentUser ya tenga el ID real
      currentUserId.value = user.userId;
      // loadProfile ya no recibe parámetro — el backend confirma el userId internamente
      await loadProfile();
    } catch (err) {
      console.error("[ChatStore] initCurrentUser falló:", err);
      // No re-lanzar: si falla, currentUserId queda null y se usa el fallback del mock
    }
  };

  const toWorkspaceUser = (user: IUserResponse): WorkspaceUser => ({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: toAbsoluteAvatarUrl(user.avatar_url) ?? undefined,
    status: user.active ? "online" : "offline",
    isCurrentUser: user.id === currentUserId.value,
  });

  // Definimos una interfaz con las propiedades posibles de ambos tipos de datos
  interface RuntimeUser {
    id: string;
    avatar_url?: string;
    username?: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
    active?: boolean;
  }

  const findWorkspaceUserById = (id: string): WorkspaceUser | null => {
    const anyUsers = users.value as unknown as RuntimeUser[];
    const backendEntry = anyUsers.find((u) => u?.id === id);

    if (backendEntry) {
      // Si la entrada tiene la forma del backend (avatar_url), usamos toWorkspaceUser
      if (backendEntry.avatar_url !== undefined) {
        return toWorkspaceUser(backendEntry as IUserResponse);
      }

      // De lo contrario, es la forma local de IUser
      const username = backendEntry.username ?? backendEntry.name ?? "";
      const avatar = backendEntry.avatarUrl ?? undefined;

      return {
        id: backendEntry.id,
        username,
        email: backendEntry.email ?? "",
        avatar,
        status: backendEntry.active ? "online" : "offline",
        isCurrentUser: backendEntry.id === currentUserId.value,
      } as WorkspaceUser;
    }

    return mockWorkspaceUsers.find((user) => user.id === id) ?? null;
  };

  const isUserProfilePanelOpen = computed(
    () => selectedProfileUser.value !== null,
  );

  const loadChats = async () => {
    await initCurrentUser();
    const device: IDevice | null = await deviceStorage.get();
    if (device) {
      try {
        await syncChatsUseCase(device);
      } catch (error) {
        console.error("Falla al sincronizar los chats", error);
      }
    }
    const loadedChats = await chatStorage.getAll();

    const normalizedChats = new Map<string, IChatRoom>();

    for (const chat of loadedChats) {
      const key =
        chat.type === ChatRoomType.DIRECT && chat.participants?.length
          ? chat.participants
              .map((participant) => participant.userId)
              .sort()
              .join("|")
          : chat.id;

      const existing = normalizedChats.get(key);
      if (!existing) {
        normalizedChats.set(key, chat);
        continue;
      }

      const existingUpdated = existing.updatedAt ?? "";
      const currentUpdated = chat.updatedAt ?? "";
      if (currentUpdated > existingUpdated) {
        normalizedChats.set(key, chat);
      }
    }

    chats.value = Array.from(normalizedChats.values());
  };

  const restoreSelectedChat = () => {
    const selectedChatId = localStorage.getItem("selectedChatId");

    if (!selectedChatId) {
      return;
    }

    selectChat(selectedChatId);
  };

  const chatExists = (name: string) => {
    return chats.value.some(
      (chat) => chat.name.toLowerCase() === name.toLowerCase(),
    );
  };

  const selectChat = async (chatId: string | null) => {
    if (!chatId) {
      selectedChat.value = null;
      localStorage.removeItem("selectedChatId");
      return;
    }

    const chat = chats.value.find((chat) => chat.id === chatId) ?? null;

    selectedChat.value = chat;

    // reseteamos unread count cuando el chat es seleccionado
    if (chat) {
      chat.unreadCount = 0;

      const storedMessages = await messageStorage.getByConversationId(chat.id);
      const lastMessage = storedMessages[storedMessages.length - 1];
      if (lastMessage) {
        chat.lastMessage = {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderUserId: lastMessage.senderUserId,
        };
      }

      await chatStorage.save(toRaw(chat));
    }

    localStorage.setItem("selectedChatId", chatId);
  };

  const notifyIncomingMessage = async (
    chatId: string,
    payload?: { content?: string; createdAt?: string; senderUserId?: string },
  ) => {
    const chat = chats.value.find((c) => c.id === chatId) ?? null;
    const now = new Date().toISOString();

    if (!chat) return;

    // actualizar lastMessage al ver el mensaje
    chat.lastMessage = {
      content: payload?.content ?? "Nuevo mensaje",
      createdAt: payload?.createdAt ?? now,
      senderUserId: payload?.senderUserId,
    };

    // If the user currently has the chat open, mark read; otherwise increment unread
    if (selectedChat.value?.id === chatId) {
      chat.unreadCount = 0;
    } else {
      chat.unreadCount = (chat.unreadCount ?? 0) + 1;
    }

    // Persist change
    await chatStorage.save(toRaw(chat));
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

  const openUserProfile = (user: WorkspaceUser | null) => {
    if (!user) {
      selectedProfileUser.value = null;
      return;
    }
    selectedProfileUser.value = user;
  };

  const closeUserProfile = () => {
    selectedProfileUser.value = null;
  };

  const findWorkspaceUserByName = (name: string) => {
    // Primero buscar en los usuarios reales cargados desde el backend
    // users.value es IUser[] pero en runtime contiene IUserResponse — casteamos para acceder a los campos reales
    const fromBackend = (users.value as unknown as IUserResponse[]).find(
      (user) => user.username?.toLowerCase() === name.toLowerCase(),
    );
    if (fromBackend) {
      return toWorkspaceUser(fromBackend);
    }
    // Fallback al mock si no se encontró en backend
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

    return hasSendMessagePermission ?? false;
  };

  const canEditChat = async (chatId: string | undefined) => {
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

    return (
      userPermissions.permissions?.some(
        (permission) => permission.code === "CAN_MODIFY_CHAT",
      ) ?? false
    );
  };

  const updateChatRoomName = async (chatId: string, name: string) => {
    const result = await updateChatRoomNameApi(chatId, name);

    const chat = chats.value.find((chat) => chat.id === chatId);

    if (chat) {
      chat.name = result.name;
      chat.updatedAt = result.updatedAt;
      await chatStorage.save(toRaw(chat));
    }

    if (selectedChat.value?.id === chatId) {
      selectedChat.value = { ...selectedChat.value, name: result.name };
    }

    return result;
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

    initCurrentUser,
    currentUser,
    workspaceUsers: computed(() => mockWorkspaceUsers),

    findWorkspaceUserById,
    findWorkspaceUserByName,

    chatsIsEmpty,
    isUserProfilePanelOpen,

    canUserWriteInChat,
    canEditChat,
    updateChatRoomName,
    notifyIncomingMessage,
  };
};
