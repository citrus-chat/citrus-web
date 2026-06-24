import type { IUser } from "./IUser";

export interface IUserStorage {
  getById(id: string): IUser | undefined;
  getAll(): IUser[];
  set(user: IUser): void;
  setMany(users: IUser[]): void;
  clear(): void;
}
