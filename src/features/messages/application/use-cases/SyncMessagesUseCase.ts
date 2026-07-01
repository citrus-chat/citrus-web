import { syncMessagesApi } from "../../infrastructure/api/messageApi";
import { encryptedMessageStorage } from "@/features/crypto/infraestructure/indexedDb/encryptedMessageStorage";
import { messageStorage } from "../../infrastructure/indexedDb/messageStorage";
import {
  encryptedMessageApiMapper,
  decryptedMessageMapper,
} from "../../mappers/MessageApiMapper";
import { decryptMessageUseCase } from "./decryptMessageUseCase";
import {
  getLastSync,
  setLastSync,
} from "../../infrastructure/indexedDb/syncStorage";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { requestConversationKeyUseCase } from "./requestConversationKeyUseCase";

export const MESSAGE_DECRYPTION_ERROR_CONTENT =
  "No se pudo desencriptar este mensaje en este dispositivo.";

export async function syncMessagesUseCase(chatroomId: string): Promise<void> {
  const lastSync = await getLastSync(chatroomId);

  const conversationKey =
    await cryptoStorage.getActiveConversationKey(chatroomId);

  if (!conversationKey) {
    await requestConversationKeyUseCase(chatroomId);
  }

  const data = await syncMessagesApi({
    chatroomId,
    lastCreatedAt: lastSync,
  });

  if (!data?.messages?.length) {
    return;
  }

  const encryptedMessages = data.messages.map(encryptedMessageApiMapper);

  await encryptedMessageStorage.saveMany(encryptedMessages);
  console.log("[SyncMessagesUseCase] saved messages", {
    chatroomId,
    count: encryptedMessages.length,
    encryptedMessages,
  });

  const messages = await Promise.all(
    data.messages.map(async (dto) => {
      const encrypted = encryptedMessageApiMapper(dto);

      const decryptedContent = await decryptMessageUseCase(encrypted).catch(
        (error) => {
          console.warn("[SyncMessagesUseCase] decrypt failed", {
            chatroomId,
            messageId: dto.id,
            conversationId: encrypted.conversationId,
            keyVersion: encrypted.keyVersion,
            errorName: error instanceof Error ? error.name : undefined,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            error,
          });

          return MESSAGE_DECRYPTION_ERROR_CONTENT;
        },
      );

      return decryptedMessageMapper(dto, decryptedContent);
    }),
  );

  await messageStorage.saveMany(messages);

  const lastMessage = data.messages[data.messages.length - 1];

  if (lastMessage?.createdAt) {
    await setLastSync(chatroomId, lastMessage.createdAt);
  }
}
