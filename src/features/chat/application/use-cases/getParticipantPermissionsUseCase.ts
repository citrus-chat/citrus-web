import type { IChatPermission } from "../../domain/IChatPermission";
import { getParticipantPermissionsApi } from "../../infrastructure/api/chatApi";

export async function getParticipantPermissionsUseCase(
  chatRoomId: string,
  participantId: string,
): Promise<IChatPermission[]> {
  const response = await getParticipantPermissionsApi(
    chatRoomId,
    participantId,
  );
  return response.permissions;
}
