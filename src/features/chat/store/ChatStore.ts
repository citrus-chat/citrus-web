import { ref } from "vue";
import type { ChatRoom } from "../domain/Chat.ts";

export const useChatStore = () => {
  //const chats = ref<ChatRoom[]>([]);
  const selectedChat = ref<ChatRoom | null>(null);
  const chats = ref<ChatRoom[]>([
    {
      id: 1,
      name: "Javalinas Empresariales",
      lastMessage: "¿Alguien tiene novedades sobre el proyecto?",
      timestamp: "10:30 AM",
      selected: false,
      isGroup: true,
      lastSender: "FrancoGei",
      isActive: false,
    },
    {
      id: 2,
      name: "María",
      lastMessage: "Nos vemos mañana",
      timestamp: "9:15 AM",
      selected: false,
      isGroup: false,
      lastSender: "María",
      isActive: true,
    },
    {
      id: 3,
      name: "Carlos",
      lastMessage: "¿Puedes enviarme el archivo?",
      timestamp: "8:45 AM",
      lastSender: "Carlos",
      selected: false,
      isGroup: false,
      isActive: true,
    },
  ]);

  const getSelectedChat = (): ChatRoom | null => {
    const storedChat = localStorage.getItem("selectedChat");
    if (storedChat) {
      selectedChat.value = JSON.parse(storedChat);
    } else {
      selectedChat.value = null;
    }
    return selectedChat.value;
  };

  // TODO: reemplazar por chats de la API
  const getChats = (): ChatRoom[] | null => chats.value;

  const selectChat = (id: number | null) => {
    const chat = chats.value.find((c) => c.id === id) || null;
    selectedChat.value = chat;
    if (chat) {
      localStorage.setItem("selectedChat", JSON.stringify(chat));
    } else {
      localStorage.removeItem("selectedChat");
    }
  };

  return {
    getSelectedChat,
    getChats,
    selectChat,
  };
};
