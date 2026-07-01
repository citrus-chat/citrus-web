import type { IUser } from "../domain/IUser";
import type { IUserResponse } from "../domain/IUserResponse";
import { toAbsoluteAvatarUrl } from "@/features/profile/infrastructure/api/publicProfileApi";

export function mapUserResponseToUser(response: IUserResponse): IUser {
  return {
    id: response.id,
    name: response.username,
    avatarUrl: toAbsoluteAvatarUrl(response.avatar_url) ?? null,
  };
}
