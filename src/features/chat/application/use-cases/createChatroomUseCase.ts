import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import { chatStorage } from "../../infrastructure/indexedDb/chatStorage";

import { createChatRoomApi } from "../../infrastructure/api/chatApi";

export async function createChatRoomUseCase(
  request: ICreateChatRoomRequest,
): Promise<ICreateChatRoomResponse> {
  const data = await createChatRoomApi(request);

  if (!data || !data.id) {
    throw new Error("Invalid create chat room response");
  }

  await chatStorage.save(data);

  return data;
}
