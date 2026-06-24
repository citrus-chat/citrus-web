export interface IEncryptedMessage {
  id: string;

  messageId: string;

  conversationId: string;

  keyVersion: number;

  iv: string;

  ciphertext: string;
}
