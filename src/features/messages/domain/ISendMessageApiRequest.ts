export interface ISendMessageApiRequest {
  messageId: string;
  chatRoomId: string; //conversationId == chatRoomId
  senderDeviceId: string;
  keyVersion: number;
  iv: string;
  ciphertext: string;
}
