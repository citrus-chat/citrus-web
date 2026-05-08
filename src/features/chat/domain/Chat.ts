export interface ChatRoom {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  selected: boolean;
  isGroup: boolean;
  lastSender: string;
  isActive: boolean;
}
