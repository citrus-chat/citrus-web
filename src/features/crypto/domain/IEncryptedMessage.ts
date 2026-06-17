export interface IEncryptedMessage {
  messageId: string;

  conversationId: string;

  senderDeviceId: string;

  keyVersion: number;

  iv: string;

  ciphertext: string;
}