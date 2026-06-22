import { apiClient } from "@/core/api/apiClient";
import type { ICreateChatRoomRequest } from "../../domain/ICreateChatRoomRequest";
import type { ICreateChatRoomResponse } from "../../domain/ICreateChatRoomResponse";
import type { IDevice } from "@/features/device/domain/IDevice";
import type { ISyncChatRoomsResponse } from "../../domain/ISyncChatRoomsResponse";

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
