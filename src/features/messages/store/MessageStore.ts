import { ref } from "vue";
import { messageStorage } from "../infrastructure/indexedDb/messageStorage";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { SendMessageUseCase } from "../application/use-cases/SendMessageUseCase";
import type { IMessage } from "../domain/IMessage";

const messages = ref<IMessage[]>([]);

const sendMessageUseCase = new SendMessageUseCase(
  messageStorage,
  deviceStorage,
);

export const useMessageStore = () => {
  const loadMessages = async (conversationId: string) => {
    messages.value = await messageStorage.getByConversationId(conversationId);
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
  };
};
