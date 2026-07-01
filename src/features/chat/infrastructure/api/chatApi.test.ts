import { beforeEach, describe, expect, it, vi } from "vitest";

const { deleteRequest, get, patch, post } = vi.hoisted(() => ({
  deleteRequest: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/core/api/apiClient", () => ({
  apiClient: { delete: deleteRequest, get, patch, post },
}));

import {
  createChatRole,
  deleteChatRole,
  getAvailableChatPermissions,
  getParticipantPermissionsApi,
  updateParticipantRolesApi,
} from "./chatApi";

describe("chatApi", () => {
  beforeEach(() => {
    deleteRequest.mockReset();
    get.mockReset();
    patch.mockReset();
    post.mockReset();
    get.mockResolvedValue({ permissions: [] });
    patch.mockResolvedValue({
      participantId: "participant-1",
      chatRoomId: "chat-1",
      userId: "user-1",
      roleIds: ["role-1"],
      permissions: [],
    });
    post.mockResolvedValue({
      id: "role-1",
      name: "READ_ONLY",
      priority: 3,
      chatPermissions: [],
    });
    deleteRequest.mockResolvedValue(undefined);
  });

  it("requests participant permissions with participant.id", async () => {
    await getParticipantPermissionsApi("chat-1", "participant-1");

    expect(get).toHaveBeenCalledWith(
      "/chatroom/chat-1/participant/participant-1/permission",
    );
  });

  it("updates participant roles with participant.id and roleIds body", async () => {
    await updateParticipantRolesApi("chat-1", "participant-1", ["role-1"]);

    expect(patch).toHaveBeenCalledWith(
      "/chatroom/chat-1/participant/participant-1/roles",
      { roleIds: ["role-1"] },
    );
  });

  it("creates a chat role with permission ids body", async () => {
    await createChatRole("chat-1", {
      name: "READ_ONLY",
      priority: 1,
      permissionIds: ["permission-1"],
    });

    expect(post).toHaveBeenCalledWith("/chatroom/chat-1/roles", {
      name: "READ_ONLY",
      priority: 1,
      permissionIds: ["permission-1"],
    });
  });

  it("keeps priority 100 when creating a chat role", async () => {
    await createChatRole("chat-1", {
      name: "MEMBER",
      priority: 100,
      permissionIds: ["permission-1"],
    });

    expect(post).toHaveBeenCalledWith("/chatroom/chat-1/roles", {
      name: "MEMBER",
      priority: 100,
      permissionIds: ["permission-1"],
    });
  });

  it("deletes a chat role with optional replacementRoleId query", async () => {
    await deleteChatRole("chat-1", "role-1", "role-2");

    expect(deleteRequest).toHaveBeenCalledWith(
      "/chatroom/chat-1/roles/role-1",
      {
        params: { replacementRoleId: "role-2" },
      },
    );
  });

  it("requests available chat permissions", async () => {
    await getAvailableChatPermissions();

    expect(get).toHaveBeenCalledWith("/chatroom/permissions");
  });
});
