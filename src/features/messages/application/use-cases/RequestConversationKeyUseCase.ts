import { requestConversationKeyApi } from "../../infrastructure/api/conversationKeyApi";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";

export async function requestConversationKeyUseCase(
  conversationId: string,
): Promise<void> {
  const device = await deviceStorage.get();

  if (!device || !device.publicKey || !device.deviceId) {
    throw new Error(
      "Device not found, or required information is missing. Cannot request conversation key.",
    );
  }

  await requestConversationKeyApi({
    conversationId,
    deviceId: device.deviceId,
    publicKey: device.publicKey,
  });
}
