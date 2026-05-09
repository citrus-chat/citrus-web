import { ref, computed } from "vue";
import type { ChatRoom } from "../domain/Chat.ts";
import type { Message } from "../domain/Message.ts";
import { getAllMessages, getChats } from "../infrastructure/api/chatApi.ts";

const selectedChat = ref<ChatRoom | null>(null);

const chats = ref<ChatRoom[]>(getChats());

const allMessages = ref<Message[]>(getAllMessages());

export const useChatStore = () => {
  const messages = computed(() =>
    allMessages.value.filter((m) => m.chatId === selectedChat.value?.id),
  );

  const selectChat = (id: number | null) => {
    const chat = chats.value.find((c) => c.id === id) ?? null;
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
    lastMessageChatText,
    lastMessageChatTime,
  };
};
