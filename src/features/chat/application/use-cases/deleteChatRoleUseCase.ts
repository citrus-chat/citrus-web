import { deleteChatRole } from "../../infrastructure/api/chatApi";

export async function deleteChatRoleUseCase(
  chatRoomId: string,
  roleId: string,
  replacementRoleId?: string,
): Promise<void> {
  const cleanChatRoomId = chatRoomId.trim();
  const cleanRoleId = roleId.trim();
  const cleanReplacementRoleId = replacementRoleId?.trim();

  if (!cleanChatRoomId) {
    throw new Error("chatRoomId is required");
  }

  if (!cleanRoleId) {
    throw new Error("roleId is required");
  }

  if (cleanReplacementRoleId === cleanRoleId) {
    throw new Error("replacementRoleId must be different from roleId");
  }

  return deleteChatRole(cleanChatRoomId, cleanRoleId, cleanReplacementRoleId);
}
