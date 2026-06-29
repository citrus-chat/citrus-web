import { ref } from "vue";
import { messageStorage } from "../infrastructure/indexedDb/messageStorage";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { SendMessageUseCase } from "../application/use-cases/SendMessageUseCase";
import type { IMessageView } from "../domain/IMessageView";
import { cryptoService } from "@/features/crypto/infraestructure/services/cryptoService";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { syncMessagesUseCase } from "../application/use-cases/SyncMessagesUseCase";
import { getUserApi } from "@/features/chat/infrastructure/api/userApi";

const messages = ref<IMessageView[]>([]);

const sendMessageUseCase = new SendMessageUseCase(
  messageStorage,
  deviceStorage,
  cryptoService,
  cryptoStorage,
);

export const useMessageStore = () => {
  const loadMessages = async (conversationId: string) => {
    const storedMessages =
      await messageStorage.getByConversationId(conversationId);

    messages.value = await Promise.all(
      storedMessages.map(async (message) => ({
        ...message,
        sender: await getUserApi(message.senderUserId),
      })),
    );

    console.log("Loaded messages:", messages.value);
  };

  const syncMessages = async (conversationId: string) => {
    const previousCount =
      await messageStorage.countByConversationId(conversationId);
    await syncMessagesUseCase(conversationId);
    loadMessages(conversationId);

    const newCount = messages.value.length;
    return newCount > previousCount ? previousCount : null;
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!content.trim()) return;
    const message = await sendMessageUseCase.execute({
      conversationId,
      content,
    });
    messages.value.push(message);
  };

  return {
    messages,
    loadMessages,
    sendMessage,
    syncMessages,
  };
};
