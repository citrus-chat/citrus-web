export interface IUploadConversationKeyRequest {
  conversationId: string;
  targetUserId: string;
  targetDeviceId: string;
  keyVersion: number;
  ciphertext: string;
  iv: string;
}
