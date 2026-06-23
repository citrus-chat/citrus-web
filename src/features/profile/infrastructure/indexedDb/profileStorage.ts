import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

import type { IProfileStorage } from "../../domain/IProfileStorage";
import type { IProfileData } from "../../domain/IProfileData";

class IndexedDbProfileStorage implements IProfileStorage {
  async save(profile: IProfileData): Promise<void> {
    const db = await citrusDb;

    await db.put("profile", profile);
  }

  async get(userId: string): Promise<IProfileData | null> {
    const db = await citrusDb;

    return (await db.get("profile", userId)) ?? null;
  }

  async remove(userId: string): Promise<void> {
    const db = await citrusDb;

    await db.delete("profile", userId);
  }

  async exists(userId: string): Promise<boolean> {
    const db = await citrusDb;

    return (await db.get("profile", userId)) != null;
  }
}
export const profileStorage = new IndexedDbProfileStorage();