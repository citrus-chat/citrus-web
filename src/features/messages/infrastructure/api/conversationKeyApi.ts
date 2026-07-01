import { apiClient } from "@/core/api/apiClient";
import type { IRequestConversationKeyDto } from "../../domain/IRequestConversationKeyDto";
import type { IPendingConversationKeyResponse } from "../../domain/IPendingConversationKeyResponse";

export async function requestConversationKeyApi(
  data: IRequestConversationKeyDto,
): Promise<void> {
  await apiClient.post("/devices/request-key", data);
}

export const getPendingConversationKeyRequestsApi = async (
  conversationId: string,
): Promise<IPendingConversationKeyResponse[]> => {
  const data = await apiClient.get<IPendingConversationKeyResponse[]>(
    "/chatroom/conversation-keys/pending",
    {
      params: { conversationId },
    },
  );

  return data;
};
