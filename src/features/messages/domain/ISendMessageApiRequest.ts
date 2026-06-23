export interface ISendMessageApiRequest {
  messageId: string;
  chatRoomId: string; //conversationId == chatRoomId
  senderDeviceId: string;
  replyMessageId?: string;
  keyVersion: number;
  iv: string;
  ciphertext: string;
}
