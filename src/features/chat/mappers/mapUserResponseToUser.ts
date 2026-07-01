import type { IUser } from "../domain/IUser";
import type { IUserResponse } from "../domain/IUserResponse";

export function mapUserResponseToUser(response: IUserResponse): IUser {
  return {
    id: response.id,
    name: response.username,
    avatarUrl: response.avatar_url ?? null,
  };
}
