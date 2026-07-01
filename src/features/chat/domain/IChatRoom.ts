import type { ChatRoomType } from "./ChatRoomType";
import type { IChatParticipant } from "./IChatParticipant";
import type { IChatRole } from "./IChatRole";

export interface IChatRoom {
  id: string;
  type: ChatRoomType;
  name: string;
  avatarUrl?: string;
  createdBy: string;
  participants: IChatParticipant[];
  roles?: Record<string, IChatRole> | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
