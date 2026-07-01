import { ChatRoomType } from "../domain/ChatRoomType";
import type { IChatParticipant } from "../domain/IChatParticipant";
import type { IChatPermission } from "../domain/IChatPermission";
import type { IChatRoom } from "../domain/IChatRoom";

export const CAN_DELETE_MESSAGE = "CAN_DELETE_MESSAGE";
export const CAN_EDIT_MESSAGE = "CAN_EDIT_MESSAGE";
export const CAN_PING_MESSAGE = "CAN_PING_MESSAGE";
export const CAN_SEND_MESSAGE = "CAN_SEND_MESSAGE";
export const CAN_VIEW_MESSAGE = "CAN_VIEW_MESSAGE";

export const CAN_ATTACH_FILE = "CAN_ATTACH_FILE";
export const CAN_START_CALL = "CAN_START_CALL";

export const CAN_ADD_CHAT_PARTICIPANT = "CAN_ADD_CHAT_PARTICIPANT";
export const CAN_MODIFY_CHAT_PARTICIPANT = "CAN_MODIFY_CHAT_PARTICIPANT";
export const CAN_REMOVE_CHAT_PARTICIPANT = "CAN_REMOVE_CHAT_PARTICIPANT";

export const CAN_CREATE_ROLE = "CAN_CREATE_ROLE";
export const CAN_DELETE_ROLE = "CAN_DELETE_ROLE";
export const CAN_MODIFY_ROLE = "CAN_MODIFY_ROLE";

export const CAN_DELETE_CHAT = "CAN_DELETE_CHAT";
export const CAN_MODIFY_CHAT = "CAN_MODIFY_CHAT";

export const CAN_CREATE_ROLE_PERMISSION = CAN_CREATE_ROLE;
export const CAN_MODIFY_ROLE_PERMISSION = CAN_MODIFY_ROLE;
export const CAN_DELETE_ROLE_PERMISSION = CAN_DELETE_ROLE;
export const CAN_VIEW_MESSAGE_PERMISSION = CAN_VIEW_MESSAGE;
export const CAN_SEND_MESSAGE_PERMISSION = CAN_SEND_MESSAGE;
export const CAN_ATTACH_FILE_PERMISSION = CAN_ATTACH_FILE;
export const CAN_EDIT_MESSAGE_PERMISSION = CAN_EDIT_MESSAGE;
export const CAN_DELETE_MESSAGE_PERMISSION = CAN_DELETE_MESSAGE;
export const CAN_PING_MESSAGE_PERMISSION = CAN_PING_MESSAGE;
export const CAN_START_CALL_PERMISSION = CAN_START_CALL;

type GroupActionParams = {
  chatRoom: IChatRoom;
  currentUserId: string;
  permissions?: IChatPermission[];
  currentUserPermissions?: IChatPermission[];
};

function permissionsFromParams(params: GroupActionParams): IChatPermission[] {
  return params.permissions ?? params.currentUserPermissions ?? [];
}

export function isGroupChat(chatRoom: IChatRoom | null | undefined): boolean {
  return chatRoom?.type === ChatRoomType.GROUP;
}

export function isChatCreator(
  chatRoom: IChatRoom,
  currentUserId: string,
): boolean {
  return chatRoom.createdBy === currentUserId;
}

export function isActiveParticipant(
  participant: IChatParticipant | null | undefined,
): boolean {
  return Boolean(participant && !participant.leftAt);
}

export function hasPermission(
  permissions: IChatPermission[],
  code: string,
): boolean {
  const expected = code.toUpperCase();

  return permissions.some(
    (permission) => permission.code?.toUpperCase() === expected,
  );
}

export function hasAnyPermission(
  permissions: IChatPermission[],
  codes: string[],
): boolean {
  const normalized = new Set<string>();

  for (const permission of permissions) {
    const code = permission.code?.toUpperCase();

    if (code) {
      normalized.add(code);
    }
  }

  return codes.some((code) => normalized.has(code.toUpperCase()));
}

export const canViewMessages = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_VIEW_MESSAGE);

export const canSendMessages = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_SEND_MESSAGE);

export const canEditMessages = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_EDIT_MESSAGE);

export const canDeleteMessages = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_DELETE_MESSAGE);

export const canPingMessages = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_PING_MESSAGE);

export const canAttachFiles = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_ATTACH_FILE);

export const canStartCall = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_START_CALL);

export const canAddParticipant = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_ADD_CHAT_PARTICIPANT);

export const canModifyParticipant = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_MODIFY_CHAT_PARTICIPANT);

export const canRemoveParticipant = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_REMOVE_CHAT_PARTICIPANT);

export const canCreateRole = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_CREATE_ROLE);

export const canModifyRole = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_MODIFY_ROLE);

export const canDeleteRole = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_DELETE_ROLE);

export const canModifyChat = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_MODIFY_CHAT);

export const canDeleteChat = (permissions: IChatPermission[]): boolean =>
  hasPermission(permissions, CAN_DELETE_CHAT);

function canUseGroupPermission(
  params: GroupActionParams,
  predicate: (permissions: IChatPermission[]) => boolean,
): boolean {
  if (!isGroupChat(params.chatRoom)) {
    return false;
  }

  if (isChatCreator(params.chatRoom, params.currentUserId)) {
    return true;
  }

  return predicate(permissionsFromParams(params));
}

export function canCreateChatRole(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canCreateRole);
}

export function canModifyChatRole(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canModifyRole);
}

export function canDeleteChatRole(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canDeleteRole);
}

export function canAssignParticipantRoles(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canModifyRole);
}

export function canModifyGroupChat(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canModifyChat);
}

export function canDeleteGroupChat(params: GroupActionParams): boolean {
  return canUseGroupPermission(params, canDeleteChat);
}

export function canManageGroupRoles(params: GroupActionParams): boolean {
  return canModifyChatRole(params);
}

export function canManageGroupMembers(
  params: GroupActionParams & {
    currentUserParticipant?: IChatParticipant | null;
  },
): boolean {
  if (
    !params.currentUserParticipant &&
    !isChatCreator(params.chatRoom, params.currentUserId)
  ) {
    return false;
  }

  return (
    canAssignParticipantRoles(params) ||
    canAddParticipant(permissionsFromParams(params)) ||
    canModifyParticipant(permissionsFromParams(params)) ||
    canRemoveParticipant(permissionsFromParams(params))
  );
}

export function permissionDeniedMessage(permissionCode?: string): string {
  switch (permissionCode?.toUpperCase()) {
    case CAN_VIEW_MESSAGE:
      return "No tenes permisos para ver mensajes.";
    case CAN_SEND_MESSAGE:
      return "No tenes permisos para enviar mensajes.";
    case CAN_EDIT_MESSAGE:
      return "No tenes permisos para editar mensajes.";
    case CAN_DELETE_MESSAGE:
      return "No tenes permisos para borrar mensajes.";
    case CAN_PING_MESSAGE:
      return "No tenes permisos para hacer ping en mensajes.";
    case CAN_ATTACH_FILE:
      return "No tenes permisos para adjuntar archivos.";
    case CAN_START_CALL:
      return "No tenes permisos para iniciar llamadas.";
    case CAN_ADD_CHAT_PARTICIPANT:
      return "No tenes permisos para agregar participantes.";
    case CAN_MODIFY_CHAT_PARTICIPANT:
      return "No tenes permisos para modificar participantes.";
    case CAN_REMOVE_CHAT_PARTICIPANT:
      return "No tenes permisos para remover participantes.";
    case CAN_CREATE_ROLE:
      return "No tenes permisos para crear roles.";
    case CAN_MODIFY_ROLE:
      return "No tenes permisos para modificar roles.";
    case CAN_DELETE_ROLE:
      return "No tenes permisos para eliminar roles.";
    case CAN_MODIFY_CHAT:
      return "No tenes permisos para modificar este chat.";
    case CAN_DELETE_CHAT:
      return "No tenes permisos para eliminar este chat.";
    default:
      return "No tenes permisos para realizar esta accion.";
  }
}

export function normalizeRoleIds(roleIds: string[]): string[] {
  return Array.from(
    new Set(roleIds.map((roleId) => roleId.trim()).filter(Boolean)),
  );
}

export function hasRoleSelectionChanged(
  previous: string[],
  next: string[],
): boolean {
  const previousNormalized = normalizeRoleIds(previous).sort();
  const nextNormalized = normalizeRoleIds(next).sort();

  if (previousNormalized.length !== nextNormalized.length) {
    return true;
  }

  return previousNormalized.some(
    (roleId, index) => roleId !== nextNormalized[index],
  );
}
