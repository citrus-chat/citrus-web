import type { IMessageApiResponse } from "../domain/IMessageApiResponse";
import type { IMessage } from "../domain/IMessage";
import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";

export function messageApiMapper(dto: IMessageApiResponse): IMessage {
  return {
    id: dto.messageId,
    conversationId: dto.chatRoomId,
    senderDeviceId: dto.senderDeviceId,
    replyToMessageId: dto.replyToMessageId ?? null,
    content: dto.ciphertext,
    createdAt: new Date(dto.createdAt).getTime().toString(),
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
    id: dto.messageId,
    messageId: dto.messageId,
    conversationId: dto.chatRoomId,
    keyVersion: dto.keyVersion,
    iv: dto.iv,
    ciphertext: dto.ciphertext,
  };
}
