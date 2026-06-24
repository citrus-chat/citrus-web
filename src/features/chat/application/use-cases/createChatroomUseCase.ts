import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import type { IConversationKey } from "../../../crypto/domain/IConversationKey";
import { chatStorage } from "../../infrastructure/indexedDb/chatStorage";
import { cryptoService } from "../../../crypto/infraestructure/services/cryptoService";
import { cryptoStorage } from "../../../crypto/infraestructure/indexedDb/cryptoStorage";

import { createChatRoomApi } from "../../infrastructure/api/chatApi";
import { loadUsersDeviceKeysUseCase } from "./loadUsersDeviceKeysUseCase";
import { uploadConversationKeyUseCase } from "./uploadConversationKeyUseCase";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";

export async function createChatRoomUseCase(
  request: ICreateChatRoomRequest,
): Promise<ICreateChatRoomResponse> {
  const currentUser = await getCurrentUserUseCase();

  if (!currentUser || !currentUser.userId) {
    throw new Error("Current user not found");
  }

  const participantIds = [currentUser.userId, ...request.participantIds];

  const identityKey = await cryptoStorage.getIdentityKey();

  if (!identityKey) {
    throw new Error("Identity key not found");
  }

  const devices = await loadUsersDeviceKeysUseCase(participantIds);

  if (!devices || devices.length === 0) {
    throw new Error("No devices found for participants");
  }

  for (const participantId of participantIds) {
    const participantDevices = devices.filter(
      (device) => device.userId === participantId,
    );
    if (!participantDevices || participantDevices.length === 0) {
      throw new Error(`No devices found for participant: ${participantId}`);
    }
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

  for (const device of devices) {
    const encryptedKey = await cryptoService.encryptConversationKeyForUser(
      conversationKey.key,
      device.publicKey,
      identityKey.privateKey,
    );

    await uploadConversationKeyUseCase({
      conversationId: conversationKey.conversationId,
      targetUserId: device.userId,
      targetDeviceId: device.deviceId,
      keyVersion: conversationKey.keyVersion,
      ciphertext: encryptedKey.ciphertext,
      iv: encryptedKey.iv,
    });
  }
  await cryptoStorage.saveConversationKey(conversationKey);

  await chatStorage.save(data);

  return data;
}
