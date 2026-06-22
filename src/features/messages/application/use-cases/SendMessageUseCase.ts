import type { IMessage } from "../../domain/IMessage";
import type { ISendMessageRequest } from "../../domain/ISendMessageRequest";
import type { IDeviceStorage } from "@/features/device/domain/IDeviceStorage";
import type { IMessageStorage } from "../../domain/IMessageStorage";

export class SendMessageUseCase {
  constructor(
    private readonly messageStorage: IMessageStorage,
    private readonly deviceStorage: IDeviceStorage,
  ) {}

  async execute(request: ISendMessageRequest): Promise<IMessage> {
    const currentDevice = await this.deviceStorage.get();

    if (!currentDevice) {
      throw new Error("Current device not found");
    }

    const message: IMessage = {
      id: crypto.randomUUID(),

      conversationId: request.conversationId,

      senderDeviceId: currentDevice.deviceId,

      content: request.content,

      createdAt: new Date().toISOString(),

      status: "pending",
    };

    await this.messageStorage.save(message);

    return message;
  }
}
