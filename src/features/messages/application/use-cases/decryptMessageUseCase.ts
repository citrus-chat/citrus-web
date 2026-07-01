import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";
import { MissingConversationKeyError } from "@/features/crypto/domain/MissingConversationKeyError";
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
    throw new MissingConversationKeyError(
      encryptedMessage.conversationId,
      encryptedMessage.keyVersion,
    );
  }

  const plaintext = await cryptoService.decrypt(
    encryptedMessage,
    conversationKey.key,
  );

  return plaintext;
}
