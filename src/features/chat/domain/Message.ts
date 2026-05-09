export interface Message {
  id: number;
  sender: string; // User ID or username of the sender
  chatId: number;
  senderDeviceId: number;
  replyToMessageId: number | null;
  text: string;
  deliveredAt?: Date; // Optional, can be added when the message is delivered
  readAt?: Date; // Optional, can be added when the message is read
}
