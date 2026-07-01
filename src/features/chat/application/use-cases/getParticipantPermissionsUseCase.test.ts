import { beforeEach, describe, expect, it, vi } from "vitest";

const { getParticipantPermissionsApi } = vi.hoisted(() => ({
  getParticipantPermissionsApi: vi.fn(),
}));

vi.mock("../../infrastructure/api/chatApi", () => ({
  getParticipantPermissionsApi,
}));

import { getParticipantPermissionsUseCase } from "./getParticipantPermissionsUseCase";

describe("getParticipantPermissionsUseCase", () => {
  beforeEach(() => {
    getParticipantPermissionsApi.mockReset();
  });

  it("returns the response permissions", async () => {
    const permissions = [
      {
        permissionId: "permission-1",
        code: "MANAGE_ROLES",
        description: null,
      },
    ];

    getParticipantPermissionsApi.mockResolvedValue({ permissions });

    await expect(
      getParticipantPermissionsUseCase("chat-1", "participant-1"),
    ).resolves.toEqual(permissions);
  });
});
