import type { IChatPermission } from "../../domain/IChatPermission";
import { getAvailableChatPermissions } from "../../infrastructure/api/chatApi";

export async function getAvailableChatPermissionsUseCase(): Promise<
  IChatPermission[]
> {
  const response = await getAvailableChatPermissions();

  return Array.isArray(response.permissions) ? response.permissions : [];
}
