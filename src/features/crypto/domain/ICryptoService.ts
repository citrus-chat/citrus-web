import type { IConversationKeyPayload } from "./IConversationKeyPayload";
import type { IDeviceKeyPair } from "./IDeviceKeyPair";
import type { IEncryptedMessage } from "./IEncryptedMessage";

export interface ICryptoService {
  generateIdentityKey(): Promise<IDeviceKeyPair>;

  encrypt(
    plaintext: string,
    key: string,
  ): Promise<{ iv: string; ciphertext: string }>;

  decrypt(payload: IEncryptedMessage, key: string): Promise<string>;

  generateConversationKey(): Promise<string>;

  encryptConversationKeyForUser(
    conversationKey: string,
    userPublicKey: string,
    myPrivateKey: string,
  ): Promise<IConversationKeyPayload>;

  decryptConversationKeyForUser(
    payload: IConversationKeyPayload,
    senderPublicKey: string,
    myPrivateKey: string,
  ): Promise<string>;
}
