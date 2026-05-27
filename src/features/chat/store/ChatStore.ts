import { ref, computed } from "vue";
import type { ChatRoom } from "../domain/Chat.ts";
import type { Message } from "../domain/Message.ts";
import type { WorkspaceUser } from "../domain/WorkspaceUser.ts";
import {
  getAllMessages,
  getChats,
  createChat,
} from "../infrastructure/api/chatApi.ts";

// Mock workspace users
const mockWorkspaceUsers: WorkspaceUser[] = [
  {
    id: "user-1",
    name: "John Doe",
    username: "john.doe",
    email: "john@example.com",
    status: "online",
    role: "Product Engineer",
    timezone: "America/New_York",
    phoneNumber: "+1 (555) 010-1201",
    bio: "Construyendo la capa de producto y experiencia en CitrusChat.",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    username: "jane.smith",
    email: "jane@example.com",
    status: "online",
    role: "Customer Success",
    timezone: "Europe/London",
    phoneNumber: "+44 20 5555 0102",
    bio: "Acompaño cuentas y procesos de adopción en workspace.",
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    username: "bob.johnson",
    email: "bob@example.com",
    status: "away",
    role: "Backend Developer",
    timezone: "America/Chicago",
    phoneNumber: "+1 (555) 010-1203",
    bio: "Integraciones, APIs y sistemas internos.",
  },
  {
    id: "user-4",
    name: "Alice Williams",
    username: "alice.williams",
    email: "alice@example.com",
    status: "offline",
    role: "Product Designer",
    timezone: "America/Mexico_City",
    phoneNumber: "+52 55 5555 0104",
    bio: "Diseño flujos claros y consistentes para colaboración.",
  },
  {
    id: "user-5",
    name: "Carlos Martinez",
    username: "carlos.martinez",
    email: "carlos@example.com",
    status: "online",
    role: "Engineering Manager",
    timezone: "America/Argentina/Buenos_Aires",
    phoneNumber: "+54 11 5555 0105",
    bio: "Coordino ejecución técnica y visión de plataforma.",
  },
];

const currentWorkspaceUser: WorkspaceUser = {
  id: "user-me",
  name: "Usuario",
  username: "usuario.citrus",
  email: "usuario@citruschat.dev",
  role: "Workspace Lead",
  status: "online",
  timezone: "America/Argentina/Buenos_Aires",
  phoneNumber: "+54 11 5555 0000",
  bio: "Perfil personal de CitrusChat para pruebas de UX tipo Slack.",
  isCurrentUser: true,
};

const selectedChat = ref<ChatRoom | null>(null);
const selectedProfileUser = ref<WorkspaceUser | null>(null);

const chats = ref<ChatRoom[]>(getChats());

const allMessages = ref<Message[]>(getAllMessages());

export const useChatStore = () => {
  const messages = computed(() =>
    allMessages.value.filter((m) => m.chatId === selectedChat.value?.id),
  );

  const chatsIsEmpty = computed(() => chats.value.length === 0);
  const currentUser = computed(() => currentWorkspaceUser);
  const isUserProfilePanelOpen = computed(
    () => selectedProfileUser.value !== null,
  );

  const chatExists = (name: string) => {
    return chats.value.some((c) => c.name.toLowerCase() === name.toLowerCase());
  };

  const addChat = (name: string, type: "group" | "direct") => {
    if (chatExists(name)) {
      alert("A chat with this name already exists.");
      return;
    }
    chats.value.unshift(createChat(name, type));
  };

  const selectChat = (name: string | null) => {
    const chat = chats.value.find((c) => c.name === name) ?? null;
    selectedChat.value = chat;
    localStorage.removeItem("selectedChat");
    localStorage.setItem("selectedChat", JSON.stringify(chat));
  };

  const openDirectMessage = (user: WorkspaceUser) => {
    // Check if DM already exists with this user
    let existingChat = chats.value.find(
      (c) => c.type === "direct" && c.name === user.name,
    );

    // If not, create it locally
    if (!existingChat) {
      existingChat = createChat(user.name, "direct");
      chats.value.unshift(existingChat);
    }

    // Select the chat
    selectChat(user.name);
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
        (user: WorkspaceUser) => user.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  };

  const lastMessageChatText = computed(() => (chatId: number) => {
    const chatMessages = allMessages.value.filter((m) => m.chatId === chatId);
    return chatMessages.at(-1)?.text ?? "";
  });

  const lastMessageChatTime = computed(() => (chatId: number) => {
    const chatMessages = allMessages.value.filter((m) => m.chatId === chatId);
    const last = chatMessages.at(-1);
    return last?.deliveredAt
      ? new Date(last.deliveredAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  });

  const sendMessage = (chatId: number, text: string) => {
    if (!chatId || !text.trim() || chatId === 0) {
      alert("Chat ID and message text are required.");
      return;
    }
    const newMessage: Message = {
      id: allMessages.value.length + 1,
      chatId,
      senderDeviceId: 1,
      replyToMessageId: null,
      text,
      sender: "me",
      deliveredAt: new Date(),
    };
    allMessages.value.push(newMessage);
  };

  return {
    chats,
    selectedChat,
    messages,
    lastMessageChatText,
    lastMessageChatTime,
    chatsIsEmpty,
    selectChat,
    createChat,
    chatExists,
    addChat,
    openDirectMessage,
    openUserProfile,
    closeUserProfile,
    selectedProfileUser,
    isUserProfilePanelOpen,
    currentUser,
    findWorkspaceUserByName,
    workspaceUsers: computed(() => mockWorkspaceUsers),
    sendMessage,
  };
};
