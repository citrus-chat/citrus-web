import type { IChatPermission } from "./IChatPermission";

export interface IChatRole {
  id: string;
  chatRoomId?: string;
  chatPermissions: IChatPermission[];
  name: string;
  priority: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}
