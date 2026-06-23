import { apiClient } from "@/core/api/apiClient";
import type { ISendMessageApiRequest } from "../../domain/ISendMessageApiRequest";

export async function sendMessageApi(
  request: ISendMessageApiRequest,
): Promise<void> {
  console.log("Sending message via API:", request);
  await apiClient.post("/messages/send", request);
}
