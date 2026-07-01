import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatRoomType } from "../domain/ChatRoomType";
import type { IChatRole } from "../domain/IChatRole";
import type { IChatRoom } from "../domain/IChatRoom";

const {
  deleteChatRoleUseCase,
  getChatRolesUseCase,
  getParticipantPermissionsUseCase,
  getUserApi,
  saveChatRoom,
} = vi.hoisted(() => ({
  deleteChatRoleUseCase: vi.fn(),
  getChatRolesUseCase: vi.fn(),
  getParticipantPermissionsUseCase: vi.fn(),
  getUserApi: vi.fn(),
  saveChatRoom: vi.fn(),
}));

vi.mock("../application/use-cases/getChatRolesUseCase", () => ({
  getChatRolesUseCase,
}));

vi.mock("../application/use-cases/deleteChatRoleUseCase", () => ({
  deleteChatRoleUseCase,
}));

vi.mock("../application/use-cases/getParticipantPermissionsUseCase", () => ({
  getParticipantPermissionsUseCase,
}));

vi.mock("../infrastructure/api/userApi", () => ({
  getUserApi,
}));

vi.mock("../infrastructure/indexedDb/chatStorage", () => ({
  chatStorage: {
    save: saveChatRoom,
    saveMany: vi.fn(),
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    remove: vi.fn(),
    exists: vi.fn().mockResolvedValue(false),
  },
}));

vi.mock("@/features/profile/Store/ProfileStore", () => ({
  useProfileStore: () => ({ profile: { value: null } }),
}));

vi.mock("../application/use-cases/syncChatsUseCase", () => ({
  syncChatsUseCase: vi.fn(),
}));

vi.mock("@/features/device/infraestructure/indexedDb.ts/deviceStorage", () => ({
  deviceStorage: {
    get: vi.fn().mockResolvedValue(null),
  },
}));

import { useChatStore } from "./ChatStore";

const role = (overrides: Partial<IChatRole> = {}): IChatRole => ({
  id: "role-1",
  name: "MEMBER",
  priority: 10,
  chatPermissions: [],
  ...overrides,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

const chatRoom = (overrides: Partial<IChatRoom> = {}): IChatRoom => ({
  id: "chat-1",
  type: ChatRoomType.GROUP,
  name: "Equipo",
  avatarUrl: null,
  createdBy: "user-1",
  participants: [],
  roles: {},
  createdAt: "2026-06-29T00:00:00Z",
  updatedAt: "2026-06-29T00:00:00Z",
  deletedAt: null,
  ...overrides,
});

describe("ChatStore role loading", () => {
  beforeEach(() => {
    const store = useChatStore();

    store.chats.value = [];
    store.selectedChat.value = null;
    store.chatRolesByChatRoomId.value = {};
    store.chatRolesLoadingByChatRoomId.value = {};
    store.chatRolesErrorByChatRoomId.value = {};
    store.chatRoleDeletingById.value = {};
    store.chatRoleErrorById.value = {};
    store.participantPermissionsById.value = {};
    store.participantPermissionsLoadingById.value = {};
    store.participantPermissionsErrorById.value = {};
    deleteChatRoleUseCase.mockReset();
    getChatRolesUseCase.mockReset();
    getParticipantPermissionsUseCase.mockReset();
    getUserApi.mockReset();
    saveChatRoom.mockReset();
  });

  it("hydrates roles from local data without calling the backend when refresh is not forced", async () => {
    const localRole = role({ id: "role-local", name: "LOCAL" });
    const store = useChatStore();

    const roles = await store.loadChatRoles("chat-1", {
      initialRoles: { [localRole.id]: localRole },
    });

    expect(getChatRolesUseCase).not.toHaveBeenCalled();
    expect(roles).toEqual([localRole]);
    expect(store.chatRolesByChatRoomId.value["chat-1"]).toEqual([localRole]);
  });

  it("force-refreshes roles from the backend and persists them in the selected chat", async () => {
    const staleRole = role({ id: "role-stale", name: "STALE" });
    const freshRole = role({ id: "role-fresh", name: "FRESH", priority: 4 });
    const store = useChatStore();
    const selected = chatRoom({ roles: { [staleRole.id]: staleRole } });

    store.selectedChat.value = selected;
    store.chats.value = [selected];
    getChatRolesUseCase.mockResolvedValue([freshRole]);

    const roles = await store.loadChatRoles("chat-1", {
      forceRefresh: true,
      initialRoles: { [staleRole.id]: staleRole },
    });

    expect(getChatRolesUseCase).toHaveBeenCalledWith("chat-1");
    expect(roles).toEqual([freshRole]);
    expect(store.chatRolesByChatRoomId.value["chat-1"]).toEqual([freshRole]);
    expect(store.selectedChat.value?.roles).toEqual({
      [freshRole.id]: freshRole,
    });
    expect(saveChatRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "chat-1",
        roles: { [freshRole.id]: freshRole },
        participants: [],
      }),
    );
  });

  it("lets a forced role refresh win over an older in-flight roles request", async () => {
    const staleRequest = deferred<IChatRole[]>();
    const freshRequest = deferred<IChatRole[]>();
    const staleRole = role({ id: "role-stale", name: "STALE" });
    const freshRole = role({ id: "role-fresh", name: "FRESH" });
    const store = useChatStore();

    getChatRolesUseCase
      .mockReturnValueOnce(staleRequest.promise)
      .mockReturnValueOnce(freshRequest.promise);

    const firstLoad = store.loadChatRoles("chat-1", { forceRefresh: true });
    const secondLoad = store.loadChatRoles("chat-1", { forceRefresh: true });

    freshRequest.resolve([freshRole]);
    await expect(secondLoad).resolves.toEqual([freshRole]);

    staleRequest.resolve([staleRole]);
    await expect(firstLoad).resolves.toEqual([staleRole]);

    expect(getChatRolesUseCase).toHaveBeenCalledTimes(2);
    expect(store.chatRolesByChatRoomId.value["chat-1"]).toEqual([freshRole]);
  });

  it("deletes a role locally, replaces participant role ids and force-refreshes roles", async () => {
    const deletedRole = role({ id: "role-deleted", name: "DELETED" });
    const replacementRole = role({
      id: "role-replacement",
      name: "REPLACEMENT",
      priority: 1,
    });
    const selected = chatRoom({
      participants: [
        {
          id: "participant-1",
          chatRoomId: "chat-1",
          userId: "user-1",
          roleIds: [deletedRole.id],
          joinedAt: "2026-06-29T00:00:00Z",
          leftAt: null,
          lastReadMessageId: null,
        },
      ],
      roles: {
        [deletedRole.id]: deletedRole,
        [replacementRole.id]: replacementRole,
      },
    });
    const store = useChatStore();

    store.selectedChat.value = selected;
    store.chats.value = [selected];
    store.chatRolesByChatRoomId.value = {
      "chat-1": [deletedRole, replacementRole],
    };
    deleteChatRoleUseCase.mockResolvedValue(undefined);
    getChatRolesUseCase.mockResolvedValue([replacementRole]);
    getParticipantPermissionsUseCase.mockResolvedValue([
      {
        permissionId: "permission-view",
        code: "CAN_VIEW_MESSAGE",
        description: null,
      },
    ]);

    await store.deleteRole("chat-1", deletedRole.id, replacementRole.id);

    expect(deleteChatRoleUseCase).toHaveBeenCalledWith(
      "chat-1",
      deletedRole.id,
      replacementRole.id,
    );
    expect(getChatRolesUseCase).toHaveBeenCalledWith("chat-1");
    expect(store.chatRolesByChatRoomId.value["chat-1"]).toEqual([
      replacementRole,
    ]);
    expect(store.selectedChat.value?.roles).toEqual({
      [replacementRole.id]: replacementRole,
    });
    expect(store.selectedChat.value?.participants[0]?.roleIds).toEqual([
      replacementRole.id,
    ]);
    expect(store.participantPermissionsById.value["participant-1"]).toEqual([
      {
        permissionId: "permission-view",
        code: "CAN_VIEW_MESSAGE",
        description: null,
      },
    ]);
    expect(saveChatRoom).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "chat-1",
        roles: { [replacementRole.id]: replacementRole },
        participants: [
          expect.objectContaining({ roleIds: [replacementRole.id] }),
        ],
      }),
    );
  });

  it("dedupes and caches workspace user lookups by user id", async () => {
    const userRequest = deferred<{
      id: string;
      username: string;
      email: string;
      active: boolean;
      avatar_url: string;
      publicKey: string;
    }>();
    const store = useChatStore();

    getUserApi.mockReturnValueOnce(userRequest.promise);

    const firstLookup = store.findWorkspaceUserById("user-cache-1");
    const secondLookup = store.findWorkspaceUserById("user-cache-1");

    userRequest.resolve({
      id: "user-cache-1",
      username: "sofia",
      email: "sofia@example.com",
      active: true,
      avatar_url: "",
      publicKey: "public-key",
    });

    await expect(Promise.all([firstLookup, secondLookup])).resolves.toEqual([
      expect.objectContaining({ id: "user-cache-1", username: "sofia" }),
      expect.objectContaining({ id: "user-cache-1", username: "sofia" }),
    ]);
    await expect(store.findWorkspaceUserById("user-cache-1")).resolves.toEqual(
      expect.objectContaining({ id: "user-cache-1", username: "sofia" }),
    );

    expect(getUserApi).toHaveBeenCalledTimes(1);
  });
});
