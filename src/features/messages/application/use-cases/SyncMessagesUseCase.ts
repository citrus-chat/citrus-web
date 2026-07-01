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

export async function syncMessagesUseCase(chatroomId: string): Promise<void> {
  const lastSync = await getLastSync();

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

  const messages = await Promise.all(
    data.messages.map(async (dto) => {
      const encrypted = encryptedMessageApiMapper(dto);

      const decryptedContent = await decryptMessageUseCase(encrypted);

      return decryptedMessageMapper(dto, decryptedContent);
    }),
  );

  await messageStorage.saveMany(messages);

  const maxCreatedAt = messages.reduce((max, msg) => {
    const createdAt = Number(msg.createdAt);
    return createdAt > max ? createdAt : max;
  }, 0);

  if (maxCreatedAt > 0) {
    await setLastSync(new Date(maxCreatedAt).toISOString());
  }
}
