import type { IChatRole } from "../domain/IChatRole";
import type { IChatRoom } from "../domain/IChatRoom";

function hasRoleCatalog(
  roles: Record<string, IChatRole> | null | undefined,
): roles is Record<string, IChatRole> {
  return Boolean(roles && Object.keys(roles).length > 0);
}

export function mergeChatRoomRoles(
  incoming: IChatRoom,
  existing: IChatRoom | null | undefined,
): IChatRoom {
  if (hasRoleCatalog(incoming.roles) || !hasRoleCatalog(existing?.roles)) {
    return incoming;
  }

  return {
    ...incoming,
    roles: existing.roles,
  };
}
