import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  decryptMessageUseCase: vi.fn(),
  encryptedMessageStorageSaveMany: vi.fn(),
  getLastSync: vi.fn(),
  messageStorageSaveMany: vi.fn(),
  setLastSync: vi.fn(),
  syncMessagesApi: vi.fn(),
}));

vi.mock("../../infrastructure/api/messageApi", () => ({
  syncMessagesApi: mocks.syncMessagesApi,
}));

vi.mock(
  "@/features/crypto/infraestructure/indexedDb/encryptedMessageStorage",
  () => ({
    encryptedMessageStorage: {
      saveMany: mocks.encryptedMessageStorageSaveMany,
    },
  }),
);

vi.mock("../../infrastructure/indexedDb/messageStorage", () => ({
  messageStorage: {
    saveMany: mocks.messageStorageSaveMany,
  },
}));

vi.mock("./decryptMessageUseCase", () => ({
  decryptMessageUseCase: mocks.decryptMessageUseCase,
}));

vi.mock("../../infrastructure/indexedDb/syncStorage", () => ({
  getLastSync: mocks.getLastSync,
  setLastSync: mocks.setLastSync,
}));

import {
  MESSAGE_DECRYPTION_ERROR_CONTENT,
  syncMessagesUseCase,
} from "./SyncMessagesUseCase";

describe("syncMessagesUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLastSync.mockResolvedValue(null);
  });

  it("keeps synced messages visible when this device cannot decrypt them", async () => {
    mocks.syncMessagesApi.mockResolvedValue({
      messages: [
        {
          id: "message-1",
          chatRoomId: "chat-1",
          senderUserId: "user-1",
          senderDeviceId: "device-1",
          replyToMessageId: null,
          keyVersion: 1,
          iv: "iv",
          ciphertext: "ciphertext",
          createdAt: "2026-06-30T00:00:00.000Z",
        },
      ],
    });
    mocks.decryptMessageUseCase.mockRejectedValue(
      new Error("Conversation key not found"),
    );

    await syncMessagesUseCase("chat-1");

    expect(mocks.encryptedMessageStorageSaveMany).toHaveBeenCalledWith([
      expect.objectContaining({
        messageId: "message-1",
        conversationId: "chat-1",
      }),
    ]);
    expect(mocks.messageStorageSaveMany).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "message-1",
        content: MESSAGE_DECRYPTION_ERROR_CONTENT,
      }),
    ]);
  });
});
