import type { ChatRoomType } from "./ChatRoomType";

export interface ICreateChatRoomResponse {
  id: string;
  type: ChatRoomType;
  name: string;
  createdBy: string;
  // Not implemented yet.
  // participants: IChatParticipant[];
  // roles: Record<string, IChatRole>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
