import { ref } from "vue";
import { messageStorage } from "../infrastructure/indexedDb/messageStorage";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { SendMessageUseCase } from "../application/use-cases/SendMessageUseCase";
import type { IMessageView } from "../domain/IMessageView";
import { cryptoService } from "@/features/crypto/infraestructure/services/cryptoService";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { syncMessagesUseCase } from "../application/use-cases/SyncMessagesUseCase";
import { getUserApi } from "@/features/chat/infrastructure/api/userApi";
import type { IUserResponse } from "@/features/chat/domain/IUserResponse";
import { normalizeApiError } from "@/core/api/apiErrorMapper";
import {
  CAN_SEND_MESSAGE,
  permissionDeniedMessage,
} from "@/features/chat/utils/groupPermissions";
import { isMissingConversationKeyError } from "@/features/crypto/domain/MissingConversationKeyError";

const messages = ref<IMessageView[]>([]);
const sendMessageError = ref<string | null>(null);
const loadMessagesRequestsByConversationId = new Map<
  string,
  Promise<IMessageView[]>
>();
const syncMessagesRequestsByConversationId = new Map<
  string,
  Promise<number | null>
>();
const senderUsersById = new Map<string, IUserResponse | null>();
const senderUserRequestsById = new Map<string, Promise<IUserResponse | null>>();

const sendMessageUseCase = new SendMessageUseCase(
  messageStorage,
  deviceStorage,
  cryptoService,
  cryptoStorage,
);

export const useMessageStore = () => {
  const findSenderById = async (
    userId: string,
  ): Promise<IUserResponse | null> => {
    if (senderUsersById.has(userId)) {
      return senderUsersById.get(userId) ?? null;
    }

    const pendingRequest = senderUserRequestsById.get(userId);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = getUserApi(userId)
      .then((user) => {
        senderUsersById.set(userId, user);
        return user;
      })
      .catch(() => {
        senderUsersById.set(userId, null);
        return null;
      })
      .finally(() => {
        senderUserRequestsById.delete(userId);
      });

    senderUserRequestsById.set(userId, request);

    return request;
  };

  const loadMessages = async (
    conversationId: string,
    options?: { forceRefresh?: boolean },
  ): Promise<IMessageView[]> => {
    const pendingRequest =
      loadMessagesRequestsByConversationId.get(conversationId);

    if (pendingRequest && !options?.forceRefresh) {
      return pendingRequest;
    }

    if (options?.forceRefresh) {
      loadMessagesRequestsByConversationId.delete(conversationId);
    }

    const request = messageStorage
      .getByConversationId(conversationId)
      .then(async (storedMessages) => {
        const hydratedMessages = await Promise.all(
          storedMessages.map(async (message) => ({
            ...message,
            sender: (await findSenderById(message.senderUserId)) ?? undefined,
          })),
        );
        console.log("[MessageStore] loaded from storage", {
          conversationId,
          count: hydratedMessages.length,
          hydratedMessages,
        });
        messages.value = hydratedMessages;

        return hydratedMessages;
      })
      .finally(() => {
        loadMessagesRequestsByConversationId.delete(conversationId);
      });

    loadMessagesRequestsByConversationId.set(conversationId, request);

    return request;
  };

  const syncMessages = async (conversationId: string) => {
    const pendingRequest =
      syncMessagesRequestsByConversationId.get(conversationId);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = (async () => {
      const previousCount =
        await messageStorage.countByConversationId(conversationId);
      await syncMessagesUseCase(conversationId);
      const loadedMessages = await loadMessages(conversationId, {
        forceRefresh: true,
      });

      return loadedMessages.length > previousCount ? previousCount : null;
    })().finally(() => {
      syncMessagesRequestsByConversationId.delete(conversationId);
    });

    syncMessagesRequestsByConversationId.set(conversationId, request);

    return request;
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!content.trim()) return;
    sendMessageError.value = null;

    try {
      const message = await sendMessageUseCase.execute({
        conversationId,
        content,
      });

      messages.value.push(message);
    } catch (error) {
      if (isMissingConversationKeyError(error)) {
        sendMessageError.value =
          "No se pudo cifrar el mensaje porque este dispositivo no tiene la clave de esta conversación.";
        throw error;
      }

      const apiError = normalizeApiError(error);

      sendMessageError.value =
        apiError.statusCode === 403
          ? permissionDeniedMessage(CAN_SEND_MESSAGE)
          : "No se pudo enviar el mensaje. Intenta nuevamente.";

      throw error;
    }
  };

  return {
    messages,
    sendMessageError,
    loadMessages,
    sendMessage,
    syncMessages,
  };
};
