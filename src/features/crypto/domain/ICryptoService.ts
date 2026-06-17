import type { IDeviceKeyPair } from "./IDeviceKeyPair";
// import type { IEncryptedPayload } from "./IEncryptedPayload";

export interface ICryptoService {

  generateIdentityKey(): Promise<IDeviceKeyPair>;

  deriveSharedSecret(privateKey: string,publicKey: string): Promise<Uint8Array>;

  // deriveConversationKey(sharedSecret: string, conversationSalt: string, info?: string): Promise<Uint8Array>;

  // encrypt(plaintext: string, conversationKey: string): Promise<IEncryptedPayload>;

  // decrypt(payload: IEncryptedPayload, conversationKey: string): Promise<string>;

  // rotateKey(oldKey: string,rotationSeed: string, info?: string):Promise<Uint8Array>;
  
}