import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateParticipantRolesApi } = vi.hoisted(() => ({
  updateParticipantRolesApi: vi.fn(),
}));

vi.mock("../../infrastructure/api/chatApi", () => ({
  updateParticipantRolesApi,
}));

import { updateParticipantRolesUseCase } from "./updateParticipantRolesUseCase";

describe("updateParticipantRolesUseCase", () => {
  beforeEach(() => {
    updateParticipantRolesApi.mockReset();
    updateParticipantRolesApi.mockResolvedValue({
      participantId: "participant-1",
      chatRoomId: "chat-1",
      userId: "user-1",
      roleIds: ["role-1"],
      permissions: [],
    });
  });

  it("normalizes role ids before updating", async () => {
    await updateParticipantRolesUseCase({
      chatRoomId: "chat-1",
      participantId: "participant-1",
      roleIds: ["role-1", " role-1 ", "role-2"],
    });

    expect(updateParticipantRolesApi).toHaveBeenCalledWith(
      "chat-1",
      "participant-1",
      ["role-1", "role-2"],
    );
  });

  it("rejects empty role selections", async () => {
    await expect(
      updateParticipantRolesUseCase({
        chatRoomId: "chat-1",
        participantId: "participant-1",
        roleIds: [],
      }),
    ).rejects.toThrow("roleIds must contain at least one role");
  });
});
