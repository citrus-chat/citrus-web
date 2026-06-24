export interface IMessage {
  id: string;

  conversationId: string;

  senderDeviceId: string;

  replyToMessageId: string | null;

  content: string;

  createdAt: string;

  editedAt: string | undefined;

  deletedAt: string | undefined;

  status: "pending" | "sent" | "failed" | "recieved" | "read";
}
