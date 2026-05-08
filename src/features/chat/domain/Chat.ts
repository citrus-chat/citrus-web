import type { Message } from "./Message";

export interface ChatRoles {
  id: number;
  userId: number;
  chat: number;
  name: string;
  createdAt: Date; // CHANGE TO TIMESTAMP
  chatPermissions: ChatPermissions[];
}

export interface ChatPermissions {
  userId: number;
  code: string; // e.g., 'read', 'write', 'admin'
  description: string; // e.g., 'Can read messages', 'Can send messages', 'Can manage chat'
}

export interface ChatParticipant {
  id: number;
  userId: number;
  chatId: number;
  roleId: number;
  joinedAt: Date; // CHANGE TO TIMESTAMP
  leftAt: Date | null; // CHANGE TO TIMESTAMP, null if still a participant
  lastReadMessageId: number | null; // ID of the last message read by the participant
}

export interface ChatRoom {
  id: number;
  type: "group" | "direct";
  name: string;
  createdBy: number; // CHANGE TO UUID
  createdAt: Date; // CHANGE TO TIMESTAMP
  updatedAt: Date; // CHANGE TO TIMESTAMP
  messages?: Message[]; // Optional, can be loaded separately
}
