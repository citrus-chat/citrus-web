import type { ChatRoomType } from "./ChatRoomType";
import type { IChatParticipant } from "./IChatParticipant";

export interface ICreateChatRoomResponse {
  id: string;
  type: ChatRoomType;
  name: string;
  avatarUrl?: string;
  createdBy: string;
  // Not implemented yet.
  participants: IChatParticipant[];
  // roles: Record<string, IChatRole>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
