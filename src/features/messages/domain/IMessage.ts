export interface IMessage {
  id: string;

  conversationId: string;

  senderDeviceId: string;

  content: string;

  createdAt: string;

  status: "pending" | "sent" | "failed";
}
