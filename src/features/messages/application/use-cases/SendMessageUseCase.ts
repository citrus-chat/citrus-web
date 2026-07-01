import type { IMessage } from "../../domain/IMessage";
import type { ISendMessageLocallyRequest } from "../../domain/ISendMessageLocallyRequest";
import type { IDeviceStorage } from "@/features/device/domain/IDeviceStorage";
import type { IMessageStorage } from "../../domain/IMessageStorage";
import type { ICryptoService } from "@/features/crypto/domain/ICryptoService";
import type { ICryptoStorage } from "@/features/crypto/domain/ICryptoStorage";
import type { IEncryptedMessage } from "@/features/crypto/domain/IEncryptedMessage";
import { encryptedMessageStorage } from "@/features/crypto/infraestructure/indexedDb/encryptedMessageStorage";
import { outgoingQueueStorage } from "../../infrastructure/indexedDb/outgoingQueueStorage";
import { OutgoingQueueItemType } from "../../domain/OutgoingQueueItemType";
import { outgoingQueueProcessor } from "../../handlers/OutgoingQueueProcessor";
import { getCurrentUserUseCase } from "@/features/profile/application/use-cases/getCurrentUserUseCase";
import { MissingConversationKeyError } from "@/features/crypto/domain/MissingConversationKeyError";

export class SendMessageUseCase {
  constructor(
    private readonly messageStorage: IMessageStorage,
    private readonly deviceStorage: IDeviceStorage,
    private readonly cryptoService: ICryptoService,
    private readonly cryptoStorage: ICryptoStorage,
  ) {}

  async execute(request: ISendMessageLocallyRequest): Promise<IMessage> {
    const currentDevice = await this.deviceStorage.get();

    if (!currentDevice) {
      throw new Error("Current device not found");
    }

    const currentUser = await getCurrentUserUseCase();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const message: IMessage = {
      id: crypto.randomUUID(),
      conversationId: request.conversationId,
      senderDeviceId: currentDevice.deviceId,
      senderUserId: currentUser.userId,
      replyToMessageId: null,
      content: request.content,
      createdAt: Date.now().toString(),
      editedAt: undefined,
      deletedAt: undefined,
      status: "pending",
    };

    const conversationKey = await this.cryptoStorage.getActiveConversationKey(
      request.conversationId,
    );

    if (!conversationKey) {
      throw new MissingConversationKeyError(request.conversationId);
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

    await this.messageStorage.save(message);

    await encryptedMessageStorage.save(encryptedMessage);

    await outgoingQueueStorage.save({
      id: crypto.randomUUID(),
      type: OutgoingQueueItemType.SEND_MESSAGE,
      payload: {
        encryptedMessageId: encryptedMessage.id,
      },
      createdAt: new Date().toISOString(),
    });

    await outgoingQueueProcessor.process();

    return message;
  }
}
