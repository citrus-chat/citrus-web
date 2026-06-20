import type { ChatRoomType } from "./ChatRoomType";

export interface ICreateChatRoomRequest {
  chatRoomType: ChatRoomType;
  name?: string;
  participantIds: string[];
}
