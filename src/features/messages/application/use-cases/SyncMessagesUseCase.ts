import { syncMessagesApi } from "../../infrastructure/api/messageApi";
import { encryptedMessageStorage } from "@/features/crypto/infraestructure/indexedDb/encryptedMessageStorage";
import { messageStorage } from "../../infrastructure/indexedDb/messageStorage";
import {
  encryptedMessageApiMapper,
  messageApiMapper,
} from "../../mappers/MessageApiMapper";

export async function syncMessagesUseCase(chatroomId: string): Promise<void> {
  const lastMessage = await encryptedMessageStorage.getLastMessage(chatroomId);

  console.log("Syncing messages for chatroom:", chatroomId);

  const data = await syncMessagesApi({
    chatroomId,
    lastMessageId: lastMessage?.id,
  });

  if (!data || !data.messages) {
    return;
  }

  const encryptedMessages = data.messages.map(encryptedMessageApiMapper);

  console.log("Encrypted Messages:", encryptedMessages);

  const messages = data.messages.map(messageApiMapper);

  console.log("Messages:", messages);

  await encryptedMessageStorage.saveMany(encryptedMessages);
  await messageStorage.saveMany(messages);
}
