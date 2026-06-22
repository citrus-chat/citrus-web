import type { IMessage } from "../../domain/IMessage";
import type { ISendMessageRequest } from "../../domain/ISendMessageRequest";
import type { IDeviceStorage } from "@/features/device/domain/IDeviceStorage";
import type { IMessageStorage } from "../../domain/IMessageStorage";
import type { ICryptoService } from "@/features/crypto/domain/ICryptoService";
import type { ICryptoStorage } from "@/features/crypto/domain/ICryptoStorage";
import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";
import { encryptedMessageStorage } from "@/features/crypto/infraestructure/indexedDb/encryptedMessageStorage";

export class SendMessageUseCase {
  constructor(
    private readonly messageStorage: IMessageStorage,
    private readonly deviceStorage: IDeviceStorage,
    private readonly cryptoService: ICryptoService,
    private readonly cryptoStorage: ICryptoStorage,
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

    const conversationKey = await this.cryptoStorage.getActiveConversationKey(
      request.conversationId,
    );

    if (!conversationKey) {
      throw new Error("Conversation key not found");
    }

    const { iv, ciphertext } = await this.cryptoService.encrypt(
      request.content,
      conversationKey.key,
    );

    const encryptedMessage: IEncryptedMessage = {
      id: crypto.randomUUID(),
      messageId: message.id,
      conversationId: request.conversationId,
      keyVersion: conversationKey.keyVersion,
      iv,
      ciphertext,
    };

    await encryptedMessageStorage.save(encryptedMessage);

    return message;
  }
}
