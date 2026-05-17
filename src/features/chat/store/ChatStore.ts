import { ref, computed } from "vue";
import type { ChatRoom } from "../domain/Chat.ts";
import type { Message } from "../domain/Message.ts";
import {
  getAllMessages,
  getChats,
  createChat,
} from "../infrastructure/api/chatApi.ts";

// Workspace user interface
export interface WorkspaceUser {
  id: string;
  name: string;
  username: string;
  email: string;
  status: "online" | "offline" | "away";
  avatar?: string;
}

// Mock workspace users
const mockWorkspaceUsers: WorkspaceUser[] = [
  {
    id: "user-1",
    name: "John Doe",
    username: "john.doe",
    email: "john@example.com",
    status: "online",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    username: "jane.smith",
    email: "jane@example.com",
    status: "online",
  },
  {
    id: "user-3",
    name: "Bob Johnson",
    username: "bob.johnson",
    email: "bob@example.com",
    status: "away",
  },
  {
    id: "user-4",
    name: "Alice Williams",
    username: "alice.williams",
    email: "alice@example.com",
    status: "offline",
  },
  {
    id: "user-5",
    name: "Carlos Martinez",
    username: "carlos.martinez",
    email: "carlos@example.com",
    status: "online",
  },
];

const selectedChat = ref<ChatRoom | null>(null);

const chats = ref<ChatRoom[]>(getChats());

const allMessages = ref<Message[]>(getAllMessages());

export const useChatStore = () => {
  const messages = computed(() =>
    allMessages.value.filter((m) => m.chatId === selectedChat.value?.id),
  );

  const chatsIsEmpty = computed(() => chats.value.length === 0);

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
    if (chat) {
      localStorage.setItem("selectedChat", JSON.stringify(chat));
    } else {
      localStorage.removeItem("selectedChat");
    }
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
    workspaceUsers: computed(() => mockWorkspaceUsers),
  };
};
