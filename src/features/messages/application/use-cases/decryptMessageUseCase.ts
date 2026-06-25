import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";
import { cryptoService } from "@/features/crypto/infraestructure/services/cryptoService";

export async function decryptMessageUseCase(
  encryptedMessage: IEncryptedMessage,
): Promise<string> {
  const conversationKey = await cryptoStorage.getConversationKey(
    encryptedMessage.conversationId,
    encryptedMessage.keyVersion,
  );

  if (!conversationKey) {
    throw new Error(
      `Conversation key not found for conversation ${encryptedMessage.conversationId} version ${encryptedMessage.keyVersion}`,
    );
  }

  const plaintext = await cryptoService.decrypt(
    encryptedMessage,
    conversationKey.key,
  );

  return plaintext;
}
