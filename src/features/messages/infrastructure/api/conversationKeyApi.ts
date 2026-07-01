import { apiClient } from "@/core/api/apiClient";
import type { IRequestConversationKeyDto } from "../../domain/IRequestConversationKeyDto";

export async function requestConversationKeyApi(
  data: IRequestConversationKeyDto,
): Promise<void> {
  await apiClient.post("/devices/request-key", data);
}
