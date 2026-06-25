import type { IDevice } from "@/features/device/domain/IDevice";
import { chatStorage } from "../../infrastructure/indexedDb/chatStorage";
import { syncChatRoomApi } from "../../infrastructure/api/chatApi";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { cryptoService } from "@/features/crypto/infraestructure/services/cryptoService";
import { getDeviceKeysApi } from "../../infrastructure/api/deviceApi";

export async function syncChatsUseCase(request: IDevice) {
  const myPrivateKey = await cryptoStorage.getIdentityKey();

  if (!myPrivateKey) {
    throw new Error("Current device not found");
  }

  const data = await syncChatRoomApi(request);

  await chatStorage.saveMany(data.chatRooms);

  for (const encryptedKey of data.conversationKeys) {
    const senderDevice = await getDeviceKeysApi(encryptedKey.senderDeviceId);

    if (!senderDevice) {
      continue;
    }

    const conversationKey = await cryptoService.decryptConversationKeyForUser(
      {
        iv: encryptedKey.iv,
        ciphertext: encryptedKey.ciphertext,
      },
      senderDevice.publicKey,
      myPrivateKey.privateKey,
    );

    await cryptoStorage.saveConversationKey({
      conversationId: encryptedKey.conversationId,
      keyVersion: encryptedKey.keyVersion,
      key: conversationKey,
      createdAt: encryptedKey.createdAt,
    });
  }
}
