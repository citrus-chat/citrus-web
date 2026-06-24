import type { IDeviceKeyPair } from "./IDeviceKeyPair";
import type { IConversationKey } from "./IConversationKey";

export interface ICryptoStorage {
  saveIdentityKey(key: IDeviceKeyPair): Promise<void>;

  getIdentityKey(): Promise<IDeviceKeyPair | null>;

  saveConversationKey(key: IConversationKey): Promise<void>;

  getConversationKey(
    conversationId: string,
    keyVersion: number,
  ): Promise<IConversationKey | null>;

  getLatestConversationKey(
    conversationId: string,
  ): Promise<IConversationKey | null>;

  getActiveConversationKey(
    conversationId: string,
  ): Promise<IConversationKey | null>;

  removeConversationKeys(conversationId: string): Promise<void>;

  clear(): Promise<void>;
}
