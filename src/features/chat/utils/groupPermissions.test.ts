import { describe, expect, it } from "vitest";

import { ChatRoomType } from "../domain/ChatRoomType";
import type { IChatParticipant } from "../domain/IChatParticipant";
import type { IChatPermission } from "../domain/IChatPermission";
import type { IChatRoom } from "../domain/IChatRoom";
import {
  CAN_ATTACH_FILE_PERMISSION,
  CAN_CREATE_ROLE_PERMISSION,
  CAN_DELETE_ROLE_PERMISSION,
  CAN_MODIFY_CHAT,
  CAN_SEND_MESSAGE_PERMISSION,
  CAN_START_CALL_PERMISSION,
  CAN_VIEW_MESSAGE_PERMISSION,
  CAN_MODIFY_ROLE_PERMISSION,
  canAssignParticipantRoles,
  canCreateChatRole,
  canCreateRole,
  canDeleteChatRole,
  canDeleteGroupChat,
  canDeleteRole,
  canManageGroupRoles,
  canModifyChatRole,
  canModifyGroupChat,
  canModifyRole,
  canSendMessages,
  canViewMessages,
  hasAnyPermission,
  hasPermission,
  hasRoleSelectionChanged,
  isActiveParticipant,
  isGroupChat,
  normalizeRoleIds,
  permissionDeniedMessage,
} from "./groupPermissions";

const participant: IChatParticipant = {
  id: "participant-1",
  chatRoomId: "chat-1",
  userId: "user-1",
  roleIds: [],
  joinedAt: "2026-06-29T00:00:00Z",
  leftAt: null,
  lastReadMessageId: null,
};

const chatRoom: IChatRoom = {
  id: "chat-1",
  type: ChatRoomType.GROUP,
  name: "Equipo",
  avatarUrl: null,
  createdBy: "owner-1",
  participants: [participant],
  createdAt: "2026-06-29T00:00:00Z",
  updatedAt: "2026-06-29T00:00:00Z",
  deletedAt: null,
};

const permission = (code: string): IChatPermission => ({
  permissionId: code,
  code,
  description: null,
});

describe("groupPermissions", () => {
  it("isGroupChat returns true only for GROUP chats", () => {
    expect(isGroupChat(chatRoom)).toBe(true);
    expect(isGroupChat({ ...chatRoom, type: ChatRoomType.DIRECT })).toBe(false);
  });

  it("isActiveParticipant returns false when leftAt has a value", () => {
    expect(isActiveParticipant(participant)).toBe(true);
    expect(
      isActiveParticipant({
        ...participant,
        leftAt: "2026-06-29T12:00:00Z",
      }),
    ).toBe(false);
  });

  it("hasAnyPermission matches permission codes case-insensitively", () => {
    expect(
      hasAnyPermission([permission("manage_roles")], ["MANAGE_ROLES"]),
    ).toBe(true);
  });

  it("hasPermission detects CAN_MODIFY_ROLE case-insensitively", () => {
    expect(
      hasPermission(
        [permission("can_modify_role")],
        CAN_MODIFY_ROLE_PERMISSION,
      ),
    ).toBe(true);
  });

  it("checks message read, write, attach and call permissions independently", () => {
    const permissions = [
      permission("can_view_message"),
      permission(CAN_ATTACH_FILE_PERMISSION),
    ];

    expect(hasPermission(permissions, CAN_VIEW_MESSAGE_PERMISSION)).toBe(true);
    expect(hasPermission(permissions, CAN_SEND_MESSAGE_PERMISSION)).toBe(false);
    expect(hasPermission(permissions, CAN_ATTACH_FILE_PERMISSION)).toBe(true);
    expect(hasPermission(permissions, CAN_START_CALL_PERMISSION)).toBe(false);
  });

  it("keeps semantic view and send permissions separate", () => {
    const readOnlyPermissions = [permission(CAN_VIEW_MESSAGE_PERMISSION)];

    expect(canViewMessages(readOnlyPermissions)).toBe(true);
    expect(canSendMessages(readOnlyPermissions)).toBe(false);
    expect(canSendMessages([permission(CAN_SEND_MESSAGE_PERMISSION)])).toBe(
      true,
    );
  });

  it("canManageGroupRoles allows the group creator", () => {
    expect(
      canManageGroupRoles({
        chatRoom,
        currentUserId: "owner-1",
        currentUserPermissions: [],
      }),
    ).toBe(true);
  });

  it("canManageGroupRoles allows CAN_MODIFY_ROLE", () => {
    expect(
      canManageGroupRoles({
        chatRoom,
        currentUserId: "user-1",
        currentUserPermissions: [permission("CAN_MODIFY_ROLE")],
      }),
    ).toBe(true);
  });

  it("checks create, modify and delete role permissions independently", () => {
    const rolePermissions = [
      permission(CAN_CREATE_ROLE_PERMISSION),
      permission(CAN_MODIFY_ROLE_PERMISSION),
    ];

    expect(canCreateRole(rolePermissions)).toBe(true);
    expect(canModifyRole(rolePermissions)).toBe(true);
    expect(canDeleteRole(rolePermissions)).toBe(false);
    expect(
      canCreateChatRole({
        chatRoom,
        currentUserId: "user-1",
        currentUserPermissions: [permission(CAN_CREATE_ROLE_PERMISSION)],
      }),
    ).toBe(true);
    expect(
      canModifyChatRole({
        chatRoom,
        currentUserId: "user-1",
        currentUserPermissions: [permission(CAN_CREATE_ROLE_PERMISSION)],
      }),
    ).toBe(false);
    expect(
      canDeleteChatRole({
        chatRoom,
        currentUserId: "user-1",
        currentUserPermissions: [permission(CAN_DELETE_ROLE_PERMISSION)],
      }),
    ).toBe(true);
  });

  it("allows participant role assignment only with CAN_MODIFY_ROLE in group chats", () => {
    expect(
      canAssignParticipantRoles({
        chatRoom,
        currentUserId: "user-1",
        permissions: [permission(CAN_MODIFY_ROLE_PERMISSION)],
      }),
    ).toBe(true);

    expect(
      canAssignParticipantRoles({
        chatRoom,
        currentUserId: "user-1",
        permissions: [],
      }),
    ).toBe(false);

    expect(
      canAssignParticipantRoles({
        chatRoom: { ...chatRoom, type: ChatRoomType.DIRECT },
        currentUserId: "owner-1",
        permissions: [permission(CAN_MODIFY_ROLE_PERMISSION)],
      }),
    ).toBe(false);
  });

  it("allows group chat modification to the creator or CAN_MODIFY_CHAT", () => {
    expect(
      canModifyGroupChat({
        chatRoom,
        currentUserId: "owner-1",
        permissions: [],
      }),
    ).toBe(true);

    expect(
      canModifyGroupChat({
        chatRoom,
        currentUserId: "user-1",
        permissions: [permission(CAN_MODIFY_CHAT)],
      }),
    ).toBe(true);

    expect(
      canDeleteGroupChat({
        chatRoom,
        currentUserId: "user-1",
        permissions: [permission(CAN_MODIFY_CHAT)],
      }),
    ).toBe(false);
  });

  it("canManageGroupRoles denies direct chats", () => {
    expect(
      canManageGroupRoles({
        chatRoom: { ...chatRoom, type: ChatRoomType.DIRECT },
        currentUserId: "owner-1",
        currentUserPermissions: [permission("CAN_MODIFY_ROLE")],
      }),
    ).toBe(false);
  });

  it("normalizeRoleIds removes blanks and duplicates", () => {
    expect(normalizeRoleIds(["role-1", "", " role-1 ", "role-2"])).toEqual([
      "role-1",
      "role-2",
    ]);
  });

  it("maps forbidden permissions to action-specific messages", () => {
    expect(permissionDeniedMessage(CAN_SEND_MESSAGE_PERMISSION)).toBe(
      "No tenes permisos para enviar mensajes.",
    );
    expect(permissionDeniedMessage(CAN_MODIFY_CHAT)).toBe(
      "No tenes permisos para modificar este chat.",
    );
    expect(permissionDeniedMessage()).toBe(
      "No tenes permisos para realizar esta accion.",
    );
  });

  it("hasRoleSelectionChanged ignores order and detects real changes", () => {
    expect(
      hasRoleSelectionChanged(["role-1", "role-2"], ["role-2", "role-1"]),
    ).toBe(false);
    expect(hasRoleSelectionChanged(["role-1"], ["role-1", "role-2"])).toBe(
      true,
    );
  });
});
