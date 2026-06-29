import type { IChatRoom } from "../domain/IChatRoom";
import { getUserApi } from "../infrastructure/api/userApi";

export async function resolveDirectChatName(
  chatRoom: IChatRoom,
  currentUserId: string,
): Promise<void> {
  if (chatRoom.name !== "Mensaje Directo" || chatRoom.type !== "DIRECT") {
    return;
  }

  const otherParticipant = chatRoom.participants.find(
    ({ userId }) => userId !== currentUserId,
  );

  if (!otherParticipant) return;

  const user = await getUserApi(otherParticipant.userId);
  chatRoom.name = user?.username ?? chatRoom.name;
}
