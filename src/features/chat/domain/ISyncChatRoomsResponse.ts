import type { IConversationKeyResponse } from "./IConversationKeyResponse";
import type { IChatRoom } from "./IChatRoom";

export interface ISyncChatRoomsResponse {
  chatRooms: IChatRoom[];
  conversationKeys: IConversationKeyResponse[];
}
