import type { IChatPermission } from "./IChatPermission";

export interface IUpdateParticipantRolesResponse {
  participantId: string;
  chatRoomId: string;
  userId: string;
  roleIds: string[];
  permissions: IChatPermission[];
}
