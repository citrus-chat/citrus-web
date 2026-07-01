import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { cryptoService } from "@/features/crypto/infraestructure/services/cryptoService";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { uploadConversationKeyUseCase } from "@/features/chat/application/use-cases/uploadConversationKeyUseCase";

export const syncPendingConversationKeyRequestsUseCase = async () => {
  const senderDevice = await deviceStorage.get();

  if (!senderDevice || !senderDevice.deviceId) {
    throw new Error(
      "Sender device not found. Cannot sync pending conversation key requests.",
    );
  }

  const identityKey = await cryptoStorage.getIdentityKey();

  if (!identityKey) {
    throw new Error(
      "Identity key not found. Cannot sync pending conversation key requests.",
    );
  }

  const pendingRequests = await getPendingConversationKeyRequestsApi();

  if (!pendingRequests.length) return;

  for (const request of pendingRequests) {
    const conversationKey = await cryptoStorage.getActiveConversationKey(
      request.conversationId,
    );

    if (!conversationKey) {
      console.log(
        "This device does not have the conversation key for conversation",
        request.conversationId,
      );
      continue;
    }

    const encryptedKey = await cryptoService.encryptConversationKeyForUser(
      conversationKey.key,
      request.publicKey,
      identityKey.privateKey,
    );

    await uploadConversationKeyUseCase({
      conversationId: request.conversationId,
      targetUserId: request.targetUserId,
      targetDeviceId: request.targetDeviceId,
      senderDeviceId: senderDevice.deviceId,
      keyVersion: conversationKey.keyVersion,
      ciphertext: encryptedKey.ciphertext,
      iv: encryptedKey.iv,
    });
  }
};
