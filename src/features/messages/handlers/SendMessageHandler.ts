import type { IOutgoingQueueItem } from "../domain/IOutgoingQueueItem";
import type { IOutgoingQueueHandler } from "./IOutgoingQueueHandler";
import { encryptedMessageStorage } from "../../crypto/infraestructure/indexedDb/encryptedMessageStorage";
import { sendMessageApi } from "../infrastructure/api/messageApi";
import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";

export class SendMessageQueueHandler implements IOutgoingQueueHandler {
  async handle(item: IOutgoingQueueItem): Promise<void> {
    const payload = item.payload as {
      encryptedMessageId: string;
    };

    const encryptedMessage = await encryptedMessageStorage.getById(
      payload.encryptedMessageId,
    );

    if (!encryptedMessage) {
      throw new Error("Encrypted message not found");
    }

    const senderDevice = await deviceStorage.get();

    if (!senderDevice) {
      throw new Error("Sender device not found");
    }

    await sendMessageApi({
      messageId: encryptedMessage.messageId,
      chatRoomId: encryptedMessage.conversationId,
      senderDeviceId: senderDevice.deviceId,
      keyVersion: encryptedMessage.keyVersion,
      iv: encryptedMessage.iv,
      ciphertext: encryptedMessage.ciphertext,
    });
  }
}

export const sendMessageQueueHandler = new SendMessageQueueHandler();
