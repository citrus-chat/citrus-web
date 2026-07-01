import type { IUpdateParticipantRolesResponse } from "../../domain/IUpdateParticipantRolesResponse";
import { updateParticipantRolesApi } from "../../infrastructure/api/chatApi";
import { normalizeRoleIds } from "../../utils/groupPermissions";

export async function updateParticipantRolesUseCase(params: {
  chatRoomId: string;
  participantId: string;
  roleIds: string[];
}): Promise<IUpdateParticipantRolesResponse> {
  const chatRoomId = params.chatRoomId.trim();
  const participantId = params.participantId.trim();
  const roleIds = normalizeRoleIds(params.roleIds);

  if (!chatRoomId) {
    throw new Error("chatRoomId is required");
  }

  if (!participantId) {
    throw new Error("participantId is required");
  }

  if (roleIds.length === 0) {
    throw new Error("roleIds must contain at least one role");
  }

  return updateParticipantRolesApi(chatRoomId, participantId, roleIds);
}
