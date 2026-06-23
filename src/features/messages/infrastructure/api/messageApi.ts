import { apiClient } from "@/core/api/apiClient";
import type { ISendMessageApiRequest } from "../../domain/ISendMessageApiRequest";

export async function sendMessageApi(
  request: ISendMessageApiRequest,
): Promise<void> {
  await apiClient.post("/message/send", request);
}
