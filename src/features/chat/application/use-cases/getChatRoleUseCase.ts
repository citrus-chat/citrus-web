import type { IChatRole } from "../../domain/IChatRole";
import { getChatRole } from "../../infrastructure/api/chatApi";

export async function getChatRoleUseCase(
  chatRoomId: string,
  roleId: string,
): Promise<IChatRole> {
  const cleanChatRoomId = chatRoomId.trim();
  const cleanRoleId = roleId.trim();

  if (!cleanChatRoomId) {
    throw new Error("chatRoomId is required");
  }

  if (!cleanRoleId) {
    throw new Error("roleId is required");
  }

  return getChatRole(cleanChatRoomId, cleanRoleId);
}
