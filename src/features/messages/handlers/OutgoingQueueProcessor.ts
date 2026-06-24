import type { IOutgoingQueueStorage } from "../domain/IOutgoingQueueStorage";
import { OutgoingQueueItemType } from "../domain/OutgoingQueueItemType";
import { outgoingQueueStorage } from "../infrastructure/indexedDb/outgoingQueueStorage";
import type { IOutgoingQueueHandler } from "./IOutgoingQueueHandler";
import { sendMessageQueueHandler } from "./SendMessageHandler";

export class OutgoingQueueProcessor {
  private isProcessing = false;

  constructor(
    private readonly queueStorage: IOutgoingQueueStorage,
    private readonly handlers: Map<string, IOutgoingQueueHandler>,
  ) {}

  async process(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const items = await this.queueStorage.getAll();

    for (const item of items) {
      const handler = this.handlers.get(item.type);

      if (!handler) {
        continue;
      }

      try {
        await handler.handle(item);

        await this.queueStorage.remove(item.id);
      } catch (error) {
        console.error("Failed to process queue item", item.id, error);

        break;
      } finally {
        this.isProcessing = false;
      }
    }
  }
}

export const outgoingQueueProcessor = new OutgoingQueueProcessor(
  outgoingQueueStorage,
  new Map([[OutgoingQueueItemType.SEND_MESSAGE, sendMessageQueueHandler]]),
);
