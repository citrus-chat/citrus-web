import type { IChatRole } from "../../domain/IChatRole";
import type { ICreateChatRoleRequest } from "../../domain/ICreateChatRoleRequest";
import { createChatRole } from "../../infrastructure/api/chatApi";
import { normalizeRoleIds } from "../../utils/groupPermissions";

function normalizeCreateRolePayload(
  payload: ICreateChatRoleRequest,
): ICreateChatRoleRequest {
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

export async function createChatRoleUseCase(
  chatRoomId: string,
  payload: ICreateChatRoleRequest,
): Promise<IChatRole> {
  const cleanChatRoomId = chatRoomId.trim();

  if (!cleanChatRoomId) {
    throw new Error("chatRoomId is required");
  }

  return createChatRole(cleanChatRoomId, normalizeCreateRolePayload(payload));
}
