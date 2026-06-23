export interface IMessageApiResponse {
  messageId: string;
  chatRoomId: string; //conversationId == chatRoomId
  senderUserId: string;
  senderDeviceId: string;
  replyToMessageId?: string;
  keyVersion: number;
  iv: string;
  ciphertext: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
}
