import type { ChatRoomType } from "./ChatRoomType";

export interface IChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  createdBy: string;
  // Not implemented yet.
  // participants: IChatParticipant[];
  // roles: IChatRole[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
