import type { ChatRoom } from "../../domain/Chat";
import type { Message } from "../../domain/Message";

export const getChats = (): ChatRoom[] => {
  return [
    // {
    //   id: 1,
    //   type: "group",
    //   name: "Javalinas Empresariales",
    //   createdBy: 1,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // },
    // {
    //   id: 2,
    //   type: "direct",
    //   name: "María",
    //   createdBy: 1,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // },
    // {
    //   id: 3,
    //   type: "direct",
    //   name: "Carlos",
    //   createdBy: 1,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // },
  ];
};

export const getAllMessages = (): Message[] => {
  return [
    {
      id: 1,
      chatId: 1,
      senderDeviceId: 1,
      replyToMessageId: null,
      text: "¡Hola a todos!",
      sender: "franquillo",
      deliveredAt: new Date("2026-05-08T10:00:00"),
    },
    {
      id: 2,
      chatId: 1,
      senderDeviceId: 2,
      replyToMessageId: null,
      text: "¿Cómo están?",
      sender: "nachardo",
      deliveredAt: new Date("2026-05-08T10:05:00"),
    },
    {
      id: 3,
      chatId: 1,
      senderDeviceId: 3,
      replyToMessageId: null,
      text: "¿Alguien tiene novedades sobre el proyecto?",
      sender: "me",
      deliveredAt: new Date("2026-05-08T10:10:00"),
    },
    {
      id: 4,
      chatId: 1,
      senderDeviceId: 4,
      replyToMessageId: null,
      text: "No, todavía no.",
      sender: "joselui",
      deliveredAt: new Date("2026-05-08T10:15:00"),
    },
    {
      id: 5,
      chatId: 3,
      senderDeviceId: 5,
      replyToMessageId: null,
      text: "¿Puedes enviarme el archivo?",
      sender: "giabi",
      deliveredAt: new Date("2026-05-08T09:45:00"),
    },
  ];
};

export const getCountChats = (): number => {
  return getChats().length;
};

export const createChat = (
  name: string,
  type: "group" | "direct",
): ChatRoom => {
  const newChat: ChatRoom = {
    id: getCountChats() + 1,
    name,
    type,
    createdBy: 1, // Suponemos que el usuario actual tiene ID 1
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return newChat;
};
