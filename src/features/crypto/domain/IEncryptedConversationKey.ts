export interface IEncryptedConversationKey {
  conversationId: string;
  userId: string;
  deviceId: string;
  keyVersion: number;
  iv: string;
  ciphertext: string;
}
