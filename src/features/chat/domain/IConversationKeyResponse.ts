export interface IConversationKeyResponse {
  conversationId: string;
  senderDeviceId: string;
  keyVersion: number;
  iv: string;
  ciphertext: string;
  createdAt: string;
}
