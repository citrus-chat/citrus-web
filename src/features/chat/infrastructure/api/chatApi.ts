import type { ChatRoom } from "../../domain/Chat";
import type { Message } from "../../domain/Message";

import { apiClient } from "@/core/api/apiClient";
import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import { ChatRoomType } from "../../domain/ChatRoomType";
import type { IDevice } from "@/features/device/domain/IDevice";
import type { ISyncChatRoomsResponse } from "../../domain/ISyncChatRoomsResponse";

export async function createChatRoomApi(
  request: ICreateChatRoomRequest,
): Promise<ICreateChatRoomResponse> {
  const data = await apiClient.post<ICreateChatRoomResponse>(
    "/chatroom/create",
    request,
  );

  return data;
}

export async function syncChatRoomApi(
  request: IDevice,
): Promise<ISyncChatRoomsResponse> {
  const data = await apiClient.get<ISyncChatRoomsResponse>("/chatroom/sync", {
    params: {
      deviceId: request.deviceId,
    },
  });

  return data;
}

export const getChats = (): ChatRoom[] => {
  return [
    {
      id: 1,
      type: ChatRoomType.GROUP,
      name: "Javalinas Empresariales",
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },

    {
      id: 2,
      type: ChatRoomType.DIRECT,
      name: "Carlos",
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
      chatId: 2,
      senderDeviceId: 5,
      replyToMessageId: null,
      text: "¿Puedes enviarme el archivo?",
      sender: "Carlos",
      deliveredAt: new Date("2026-05-08T09:45:00"),
    },
  ];
};

export const getCountChats = (): number => {
  return getChats().length;
};

export const createChat = (
  name: string,
  type: ChatRoomType.DIRECT | ChatRoomType.GROUP,
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

export const sendMessage = (Message: Message): Message => {
  const { id, chatId, senderDeviceId, replyToMessageId, text } = Message;
  const newMessage: Message = {
    id,
    chatId,
    senderDeviceId,
    replyToMessageId,
    text,
    sender: "me",
    deliveredAt: Message.deliveredAt ?? new Date(),
  };
  return newMessage;
};
