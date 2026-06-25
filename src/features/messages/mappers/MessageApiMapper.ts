import type { IMessageApiResponse } from "../domain/IMessageApiResponse";
import type { IMessage } from "../domain/IMessage";
import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";

function parseIsoDate(date: string): string {
  const normalized = date.replace(/\.(\d{3})\d*Z$/, ".$1Z");

  return new Date(normalized).getTime().toString();
}

export function decryptedMessageMapper(
  dto: IMessageApiResponse,
  content: string,
): IMessage {
  return {
    id: dto.id,
    conversationId: dto.chatRoomId,
    senderDeviceId: dto.senderDeviceId,
    replyToMessageId: dto.replyToMessageId ?? null,
    content,
    createdAt: parseIsoDate(dto.createdAt),
    editedAt: dto.editedAt
      ? new Date(dto.editedAt).getTime().toString()
      : undefined,
    deletedAt: dto.deletedAt
      ? new Date(dto.deletedAt).getTime().toString()
      : undefined,
    status: "recieved",
  };
}

export function encryptedMessageApiMapper(
  dto: IMessageApiResponse,
): IEncryptedMessage {
  return {
    id: dto.id,
    messageId: dto.id,
    conversationId: dto.chatRoomId,
    keyVersion: dto.keyVersion,
    iv: dto.iv,
    ciphertext: dto.ciphertext,
  };
}
