import type { IChatRole } from "../../domain/IChatRole";
import type { IUpdateChatRoleRequest } from "../../domain/IUpdateChatRoleRequest";
import { updateChatRole } from "../../infrastructure/api/chatApi";
import { normalizeRoleIds } from "../../utils/groupPermissions";

function normalizeUpdateRolePayload(
  payload: IUpdateChatRoleRequest,
): IUpdateChatRoleRequest {
  const name = payload.name.trim();
  const permissionIds = normalizeRoleIds(payload.permissionIds);

  if (!name) {
    throw new Error("name is required");
  }

  if (!Number.isFinite(payload.priority)) {
    throw new Error("priority is required");
  }

  if (permissionIds.length === 0) {
    throw new Error("permissionIds must contain at least one permission");
  }

  return {
    name,
    priority: payload.priority,
    permissionIds,
  };
}

export async function updateChatRoleUseCase(
  chatRoomId: string,
  roleId: string,
  payload: IUpdateChatRoleRequest,
): Promise<IChatRole> {
  const cleanChatRoomId = chatRoomId.trim();
  const cleanRoleId = roleId.trim();

  if (!cleanChatRoomId) {
    throw new Error("chatRoomId is required");
  }

  if (!cleanRoleId) {
    throw new Error("roleId is required");
  }

  return updateChatRole(
    cleanChatRoomId,
    cleanRoleId,
    normalizeUpdateRolePayload(payload),
  );
}
