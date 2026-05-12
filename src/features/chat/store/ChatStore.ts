import { ref, computed } from "vue";
import type { ChatRoom } from "../domain/Chat.ts";
import type { Message } from "../domain/Message.ts";
import {
  getAllMessages,
  getChats,
  createChat,
} from "../infrastructure/api/chatApi.ts";

const selectedChat = ref<ChatRoom | null>(null);

const chats = ref<ChatRoom[]>(getChats());

const allMessages = ref<Message[]>(getAllMessages());

export const useChatStore = () => {
  const messages = computed(() =>
    allMessages.value.filter((m) => m.chatId === selectedChat.value?.id),
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
    if (chat) {
      localStorage.setItem("selectedChat", JSON.stringify(chat));
    } else {
      localStorage.removeItem("selectedChat");
    }
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
    selectChat,
    createChat,
    lastMessageChatText,
    lastMessageChatTime,
    chatExists,
    addChat,
  };
};
