import type { ChatRoomType } from "./ChatRoomType";
import type { IChatParticipant } from "./IChatParticipant";

export interface IChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  avatarUrl: string | null;
  createdBy: string;
  // Not implemented yet.
  participants: IChatParticipant[];
  // roles: IChatRole[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IChatPermission {
  userId: string;
  chatRoomId: string;
  canWrite: boolean;
  canRead: boolean;
  canDeleteMessages: boolean;
  canAddParticipants: boolean;
  canRemoveParticipants: boolean;
}
