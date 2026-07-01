import { isProxy, reactive } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatRoomType } from "../../domain/ChatRoomType";
import type { IChatRole } from "../../domain/IChatRole";
import type { IChatRoom } from "../../domain/IChatRoom";

const dbMock = vi.hoisted(() => {
  const store = {
    get: vi.fn(),
    put: vi.fn((value: unknown) => {
      structuredClone(value);
      return Promise.resolve();
    }),
  };
  const tx = {
    store,
    done: Promise.resolve(),
  };
  const db = {
    transaction: vi.fn(() => tx),
    get: vi.fn(),
    getAll: vi.fn(),
    delete: vi.fn(),
  };

  return { db, store };
});

vi.mock("@/shared/infrastructure/indexedDb/citrusDb", () => ({
  citrusDb: Promise.resolve(dbMock.db),
}));

import { chatStorage } from "./chatStorage";

const role = (overrides: Partial<IChatRole> = {}): IChatRole => ({
  id: "role-1",
  name: "Admin",
  priority: 1,
  chatPermissions: [{ permissionId: "permission-1", code: "CAN_VIEW_MESSAGE" }],
  ...overrides,
});

const chatRoom = (
  overrides: Partial<IChatRoom> & { messages?: unknown } = {},
): IChatRoom & { messages?: unknown } => ({
  id: "chat-1",
  type: ChatRoomType.GROUP,
  name: "Equipo",
  avatarUrl: null,
  createdBy: "user-1",
  participants: [],
  roles: {},
  createdAt: "2026-06-30T00:00:00.000Z",
  updatedAt: "2026-06-30T00:00:00.000Z",
  deletedAt: null,
  ...overrides,
});

describe("chatStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMock.store.get.mockResolvedValue(null);
    dbMock.db.get.mockResolvedValue(null);
    dbMock.db.getAll.mockResolvedValue([]);
  });

  it("stores reactive chat rooms as plain cloneable objects", async () => {
    const adminRole = reactive(role());
    const reactiveChatRoom = reactive(
      chatRoom({
        roles: { [adminRole.id]: adminRole },
        messages: reactive([]),
      }),
    ) as unknown as IChatRoom;

    await expect(chatStorage.save(reactiveChatRoom)).resolves.toBeUndefined();

    const savedChatRoom = dbMock.store.put.mock.calls[0]?.[0] as
      | (IChatRoom & { messages?: unknown })
      | undefined;

    expect(savedChatRoom).toEqual(
      expect.objectContaining({
        id: "chat-1",
        roles: { [adminRole.id]: role() },
      }),
    );
    expect(savedChatRoom?.messages).toBeUndefined();
    expect(isProxy(savedChatRoom)).toBe(false);
    expect(isProxy(savedChatRoom?.roles)).toBe(false);
    expect(isProxy(savedChatRoom?.roles?.["role-1"]?.chatPermissions)).toBe(
      false,
    );
  });

  it("normalizes missing roles when reading chat rooms", async () => {
    dbMock.db.getAll.mockResolvedValue([chatRoom({ roles: null })]);

    const chatRooms = await chatStorage.getAll();

    expect(chatRooms[0]?.roles).toEqual({});
  });

  it("overwrites cached roles on explicit save", async () => {
    const staleRole = role({ id: "role-stale" });

    dbMock.store.get.mockResolvedValue(
      chatRoom({ roles: { [staleRole.id]: staleRole } }),
    );

    await chatStorage.save(chatRoom({ roles: {} }));

    const savedChatRoom = dbMock.store.put.mock.calls[0]?.[0] as
      | IChatRoom
      | undefined;

    expect(savedChatRoom?.roles).toEqual({});
  });
});
