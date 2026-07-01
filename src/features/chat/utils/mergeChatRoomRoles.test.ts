import { describe, expect, it } from "vitest";

import { ChatRoomType } from "../domain/ChatRoomType";
import type { IChatRoom } from "../domain/IChatRoom";
import { mergeChatRoomRoles } from "./mergeChatRoomRoles";

const chatRoom = (overrides: Partial<IChatRoom> = {}): IChatRoom => ({
  id: "chat-1",
  type: ChatRoomType.GROUP,
  name: "Equipo",
  createdBy: "user-1",
  participants: [],
  createdAt: "2026-06-29T00:00:00Z",
  updatedAt: "2026-06-29T00:00:00Z",
  deletedAt: null,
  ...overrides,
});

const adminRole = {
  id: "role-admin",
  name: "Admin",
  priority: 1,
  chatPermissions: [],
};

describe("mergeChatRoomRoles", () => {
  it("keeps incoming roles when sync sends a catalog", () => {
    const incoming = chatRoom({
      roles: {
        "role-member": {
          id: "role-member",
          name: "Member",
          priority: 2,
          chatPermissions: [],
        },
      },
    });

    expect(
      mergeChatRoomRoles(
        incoming,
        chatRoom({ roles: { "role-admin": adminRole } }),
      ).roles,
    ).toEqual(incoming.roles);
  });

  it("preserves cached roles when sync omits the catalog", () => {
    expect(
      mergeChatRoomRoles(
        chatRoom({ roles: undefined }),
        chatRoom({ roles: { "role-admin": adminRole } }),
      ).roles,
    ).toEqual({ "role-admin": adminRole });
  });
});
