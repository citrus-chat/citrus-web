import type { IChatRole } from "../../domain/IChatRole";
import { getChatRoles } from "../../infrastructure/api/chatApi";

export async function getChatRolesUseCase(
  chatRoomId: string,
): Promise<IChatRole[]> {
  const id = chatRoomId.trim();

  if (!id) {
    throw new Error("chatRoomId is required");
  }

  const response = await getChatRoles(id);

  return Array.isArray(response.roles) ? response.roles : [];
}
