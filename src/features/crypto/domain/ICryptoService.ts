import type { IDeviceKeyPair } from "./IDeviceKeyPair";
import type { IEncryptedMessage } from "./IEncryptedMessage";

export interface ICryptoService {
  generateIdentityKey(): Promise<IDeviceKeyPair>;

  deriveSharedSecret(
    privateKey: string,
    publicKey: string,
  ): Promise<Uint8Array>;

  generateConversationKey(): Promise<string>;

  encrypt(
    plaintext: string,
    key: string,
  ): Promise<{ iv: string; ciphertext: string }>;

  decrypt(payload: IEncryptedMessage, key: string): Promise<string>;

  // rotateKey(oldKey: string,rotationSeed: string, info?: string):Promise<Uint8Array>;
}
