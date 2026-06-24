export interface IUploadConversationKeyRequest {
  conversationId: string;
  targetUserId: string;
  targetDeviceId: string;
  senderDeviceId: string;
  keyVersion: number;
  ciphertext: string;
  iv: string;
}
