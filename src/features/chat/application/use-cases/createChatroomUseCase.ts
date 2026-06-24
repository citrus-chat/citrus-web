import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import type { IConversationKey } from "../../../crypto/domain/IConversationKey";
import { chatStorage } from "../../infrastructure/indexedDb/chatStorage";
import { cryptoService } from "../../../crypto/infraestructure/services/cryptoService";
import { cryptoStorage } from "../../../crypto/infraestructure/indexedDb/cryptoStorage";

import { createChatRoomApi } from "../../infrastructure/api/chatApi";
import { loadUsersDeviceKeysUseCase } from "./loadUsersDeviceKeysUseCase";

export async function createChatRoomUseCase(
  request: ICreateChatRoomRequest,
): Promise<ICreateChatRoomResponse> {
  const devices = await loadUsersDeviceKeysUseCase(request.participantIds);

  if (!devices || devices.length === 0) {
    throw new Error("No device keys found for participants");
  }

  const data = await createChatRoomApi(request);

  if (!data || !data.id) {
    throw new Error("Invalid create chat room response");
  }

  const key = await cryptoService.generateConversationKey();

  const conversationKey: IConversationKey = {
    conversationId: data.id,
    keyVersion: 1,
    key,
    createdAt: new Date().toISOString(),
  };

  await cryptoStorage.saveConversationKey(conversationKey);

  await chatStorage.save(data);

  return data;
}
