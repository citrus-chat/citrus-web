import { afterEach, describe, expect, it, vi } from "vitest";

import type { IOutgoingQueueItem } from "../domain/IOutgoingQueueItem";
import type { IOutgoingQueueStorage } from "../domain/IOutgoingQueueStorage";
import { OutgoingQueueItemType } from "../domain/OutgoingQueueItemType";
import type { IOutgoingQueueHandler } from "./IOutgoingQueueHandler";

const moduleMocks = vi.hoisted(() => ({
  outgoingQueueStorage: {
    save: vi.fn(),
    saveMany: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  },
  sendMessageQueueHandler: {
    handle: vi.fn(),
  },
}));

vi.mock("../infrastructure/indexedDb/outgoingQueueStorage", () => ({
  outgoingQueueStorage: moduleMocks.outgoingQueueStorage,
}));

vi.mock("./SendMessageHandler", () => ({
  sendMessageQueueHandler: moduleMocks.sendMessageQueueHandler,
}));

import { OutgoingQueueProcessor } from "./OutgoingQueueProcessor";

const queueItem: IOutgoingQueueItem = {
  id: "queue-1",
  type: OutgoingQueueItemType.SEND_MESSAGE,
  payload: { encryptedMessageId: "encrypted-message-1" },
  createdAt: "2026-06-30T00:00:00.000Z",
};

const createStorage = (items: IOutgoingQueueItem[]): IOutgoingQueueStorage => ({
  save: vi.fn(),
  saveMany: vi.fn(),
  getAll: vi.fn().mockResolvedValue(items),
  remove: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn(),
});

describe("OutgoingQueueProcessor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("releases the processing lock when the queue is empty", async () => {
    const storage = createStorage([]);
    const processor = new OutgoingQueueProcessor(storage, new Map());

    await processor.process();
    await processor.process();

    expect(storage.getAll).toHaveBeenCalledTimes(2);
  });

  it("removes forbidden queue items and rethrows the 403", async () => {
    const error = { statusCode: 403 };
    const storage = createStorage([queueItem]);
    const handler: IOutgoingQueueHandler = {
      handle: vi.fn().mockRejectedValue(error),
    };
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const processor = new OutgoingQueueProcessor(
      storage,
      new Map([[OutgoingQueueItemType.SEND_MESSAGE, handler]]),
    );

    await expect(processor.process()).rejects.toBe(error);

    expect(storage.remove).toHaveBeenCalledWith(queueItem.id);
    expect(consoleError).toHaveBeenCalledOnce();
  });
});
