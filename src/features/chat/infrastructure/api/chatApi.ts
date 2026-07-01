import { apiClient } from "@/core/api/apiClient";
import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import type { IDevice } from "@/features/device/domain/IDevice";
import type { ISyncChatRoomsResponse } from "../../domain/ISyncChatRoomsResponse";
import type { IUploadConversationKeyRequest } from "../../domain/IUploadConversationKeyRequest";
import type { IUploadConversationKeyResponse } from "../../domain/IUploadConversationKeyResponse";
import type { IUserPermissionResponse } from "../../domain/IUserPermissionResponse";
import type { IUpdateChatRoomResponse } from "../../domain/IUpdateChatRoomResponse";
import type { IParticipantPermissionsResponse } from "../../domain/IParticipantPermissionsResponse";
import type { IUpdateParticipantRolesRequest } from "../../domain/IUpdateParticipantRolesRequest";
import type { IUpdateParticipantRolesResponse } from "../../domain/IUpdateParticipantRolesResponse";
import type { IChatRole } from "../../domain/IChatRole";
import type { IChatRolesResponse } from "../../domain/IChatRolesResponse";
import type { IChatPermissionsResponse } from "../../domain/IChatPermissionsResponse";
import type { ICreateChatRoleRequest } from "../../domain/ICreateChatRoleRequest";
import type { IUpdateChatRoleRequest } from "../../domain/IUpdateChatRoleRequest";

export async function createChatRoomApi(
  request: ICreateChatRoomRequest,
): Promise<ICreateChatRoomResponse> {
  const data = await apiClient.post<ICreateChatRoomResponse>(
    "/chatroom/create",
    request,
  );

  return data;
}

export async function syncChatRoomApi(
  request: IDevice,
): Promise<ISyncChatRoomsResponse> {
  const data = await apiClient.get<ISyncChatRoomsResponse>("/chatroom/sync", {
    params: {
      deviceId: request.deviceId,
    },
  });

  return data;
}

export async function uploadConversationKeyApi(
  request: IUploadConversationKeyRequest,
): Promise<IUploadConversationKeyResponse> {
  const data = await apiClient.post<IUploadConversationKeyResponse>(
    "/chatroom/conversation-keys",
    request,
  );

  return data;
}

export async function getUserPermissionsApi(
  participantId: string,
  chatId: string,
): Promise<IUserPermissionResponse> {
  return getParticipantPermissionsApi(chatId, participantId);
}

export async function getParticipantPermissionsApi(
  chatRoomId: string,
  participantId: string,
): Promise<IParticipantPermissionsResponse> {
  const data = await apiClient.get<IParticipantPermissionsResponse>(
    `/chatroom/${chatRoomId}/participant/${participantId}/permission`,
  );
  return data;
}

export async function updateChatRoomNameApi(
  chatRoomId: string,
  newName: string,
): Promise<IUpdateChatRoomResponse> {
  const data = await apiClient.patch<IUpdateChatRoomResponse>(
    `/chatroom/${chatRoomId}/name`,
    { name: newName },
  );

  return data;
}

export async function updateParticipantRolesApi(
  chatRoomId: string,
  participantId: string,
  roleIds: string[],
): Promise<IUpdateParticipantRolesResponse> {
  const payload: IUpdateParticipantRolesRequest = { roleIds };
  const data = await apiClient.patch<
    IUpdateParticipantRolesResponse,
    IUpdateParticipantRolesRequest
  >(`/chatroom/${chatRoomId}/participant/${participantId}/roles`, payload);

  return data;
}

export async function getChatRoles(
  chatRoomId: string,
): Promise<IChatRolesResponse> {
  return apiClient.get<IChatRolesResponse>(`/chatroom/${chatRoomId}/roles`);
}

export async function getChatRole(
  chatRoomId: string,
  roleId: string,
): Promise<IChatRole> {
  return apiClient.get<IChatRole>(`/chatroom/${chatRoomId}/roles/${roleId}`);
}

export async function createChatRole(
  chatRoomId: string,
  payload: ICreateChatRoleRequest,
): Promise<IChatRole> {
  return apiClient.post<IChatRole, ICreateChatRoleRequest>(
    `/chatroom/${chatRoomId}/roles`,
    payload,
  );
}

export async function updateChatRole(
  chatRoomId: string,
  roleId: string,
  payload: IUpdateChatRoleRequest,
): Promise<IChatRole> {
  return apiClient.patch<IChatRole, IUpdateChatRoleRequest>(
    `/chatroom/${chatRoomId}/roles/${roleId}`,
    payload,
  );
}

export async function deleteChatRole(
  chatRoomId: string,
  roleId: string,
  replacementRoleId?: string,
): Promise<void> {
  return apiClient.delete<void>(`/chatroom/${chatRoomId}/roles/${roleId}`, {
    params: replacementRoleId ? { replacementRoleId } : undefined,
  });
}

export async function getAvailableChatPermissions(): Promise<IChatPermissionsResponse> {
  return apiClient.get<IChatPermissionsResponse>("/chatroom/permissions");
}
