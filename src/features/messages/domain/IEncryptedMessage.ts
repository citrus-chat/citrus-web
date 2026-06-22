export interface IEncryptedMessage {
  id: string;

  messageId: string;

  conversationId: string;

  keyVersion: number;

  ciphertext: string;
}
