export interface ISyncMessagesRequest {
  chatroomId: string; // conversationId == chatRoomId
  lastCreatedAt: string | null;
}
