export interface ISyncMessagesRequest {
  chatroomId: string; // conversationId == chatRoomId
  lastMessageId?: string; // Optional: The ID of the last message received, for incremental sync
}
