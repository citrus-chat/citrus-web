import type { IProfileData } from "./IProfileData";

export interface IProfileStorage {
  save(profile: IProfileData): Promise<void>;

  get(userId: string): Promise<IProfileData | null>;

  remove(userId: string): Promise<void>;

  exists(userId: string): Promise<boolean>;
}