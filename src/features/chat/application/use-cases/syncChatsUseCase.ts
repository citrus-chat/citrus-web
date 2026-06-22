import type { IDevice } from "@/features/device/domain/IDevice";
import { chatStorage } from "../../infrastructure/indexedDb/chatStorage";
import { syncChatRoomApi } from "../../infrastructure/api/chatApi";
import type { ISyncChatRoomsResponse } from "../../domain/ISyncChatRoomsResponse";

export async function syncChatsUseCase(request: IDevice) {
  const data: ISyncChatRoomsResponse = await syncChatRoomApi(request);

  await chatStorage.saveMany(data.chatRooms);
}
