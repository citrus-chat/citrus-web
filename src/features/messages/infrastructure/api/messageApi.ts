import { apiClient } from "@/core/api/apiClient";
import type { ISendMessageApiRequest } from "../../domain/ISendMessageApiRequest";
import type { ISyncMessagesResponse } from "../../domain/ISyncMessagesResponse";
import type { ISyncMessagesRequest } from "../../domain/ISyncMessagesRequest";

export async function sendMessageApi(
  request: ISendMessageApiRequest,
): Promise<void> {
  await apiClient.post("/messages/send", request);
}

export async function syncMessagesApi(
  request: ISyncMessagesRequest,
): Promise<ISyncMessagesResponse> {
  const response = await apiClient.get(
    `/chatroom/${request.chatroomId}/sync/messages`,
    {
      params: {
        lastMessageId: request.lastMessageId,
      },
    },
  );

  return response.data;
}
