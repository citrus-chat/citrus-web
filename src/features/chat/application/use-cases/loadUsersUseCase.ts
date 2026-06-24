import { userStorage } from "../../infrastructure/indexedDb/userStorage";
import { getUsersApi } from "../../infrastructure/api/userApi";
import type { IUserResponse } from "../../domain/IUserResponse";
import { mapUserResponseToUser } from "../../mappers/mapUserResponseToUser";

export async function loadUsersUseCase(): Promise<void> {
  const data: IUserResponse[] = await getUsersApi();

  const users = data.map(mapUserResponseToUser);

  await userStorage.clear();
  await userStorage.setMany(users);
}
