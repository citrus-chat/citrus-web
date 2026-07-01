import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countByConversationId: vi.fn(),
  executeSendMessage: vi.fn(),
  getByConversationId: vi.fn(),
  getUserApi: vi.fn(),
  syncMessagesUseCase: vi.fn(),
}));

vi.mock("../infrastructure/indexedDb/messageStorage", () => ({
  messageStorage: {
    countByConversationId: mocks.countByConversationId,
    getByConversationId: mocks.getByConversationId,
    save: vi.fn(),
    saveMany: vi.fn(),
  },
}));

vi.mock("@/features/device/infraestructure/indexedDb.ts/deviceStorage", () => ({
  deviceStorage: {},
}));

vi.mock("@/features/crypto/infraestructure/services/cryptoService", () => ({
  cryptoService: {},
}));

vi.mock("@/features/crypto/infraestructure/indexedDb/cryptoStorage", () => ({
  cryptoStorage: {},
}));

vi.mock("../application/use-cases/SendMessageUseCase", () => ({
  SendMessageUseCase: vi.fn().mockImplementation(function () {
    return {
      execute: mocks.executeSendMessage,
    };
  }),
}));

vi.mock("../application/use-cases/SyncMessagesUseCase", () => ({
  syncMessagesUseCase: mocks.syncMessagesUseCase,
}));

vi.mock("@/features/chat/infrastructure/api/userApi", () => ({
  getUserApi: mocks.getUserApi,
}));

import { useMessageStore } from "./MessageStore";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

const message = (id: string, senderUserId = "user-1") => ({
  id,
  conversationId: "chat-1",
  senderDeviceId: "device-1",
  senderUserId,
  replyToMessageId: null,
  content: "hola",
  createdAt: "1",
  editedAt: undefined,
  deletedAt: undefined,
  status: "recieved" as const,
});

describe("MessageStore request dedupe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = useMessageStore();

    store.messages.value = [];
    mocks.countByConversationId.mockResolvedValue(0);
    mocks.getByConversationId.mockResolvedValue([]);
    mocks.getUserApi.mockResolvedValue({
      id: "user-1",
      username: "Sofia",
      email: "sofia@example.com",
      active: true,
      avatar_url: "",
      publicKey: "public-key",
    });
  });

  it("dedupes concurrent message syncs for the same chat", async () => {
    const syncRequest = deferred<void>();
    const store = useMessageStore();

    mocks.syncMessagesUseCase.mockReturnValueOnce(syncRequest.promise);
    mocks.getByConversationId.mockResolvedValue([message("message-1")]);

    const firstSync = store.syncMessages("chat-1");
    const secondSync = store.syncMessages("chat-1");

    syncRequest.resolve();

    await expect(Promise.all([firstSync, secondSync])).resolves.toEqual([0, 0]);
    expect(mocks.syncMessagesUseCase).toHaveBeenCalledTimes(1);
  });

  it("dedupes sender lookups while hydrating messages", async () => {
    const store = useMessageStore();

    mocks.getByConversationId.mockResolvedValue([
      message("message-1", "user-shared"),
      message("message-2", "user-shared"),
    ]);
    mocks.getUserApi.mockResolvedValue({
      id: "user-shared",
      username: "Sofia",
      email: "sofia@example.com",
      active: true,
      avatar_url: "",
      publicKey: "public-key",
    });

    await store.loadMessages("chat-1");

    expect(mocks.getUserApi).toHaveBeenCalledTimes(1);
    expect(store.messages.value).toHaveLength(2);
    expect(store.messages.value[0]?.sender?.id).toBe("user-shared");
  });
});
