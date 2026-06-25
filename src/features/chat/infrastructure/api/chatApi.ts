import { apiClient } from "@/core/api/apiClient";
import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import type { IDevice } from "@/features/device/domain/IDevice";
import type { ISyncChatRoomsResponse } from "../../domain/ISyncChatRoomsResponse";
import type { IUploadConversationKeyRequest } from "../../domain/IUploadConversationKeyRequest";
import type { IUploadConversationKeyResponse } from "../../domain/IUploadConversationKeyResponse";
import type { IUserPermissionResponse } from "../../domain/IUserPermissionResponse";

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
  const data = await apiClient.get<IUserPermissionResponse>(
    `/chatroom/${chatId}/participant/${participantId}/permission`,
  );
  return data;
}
