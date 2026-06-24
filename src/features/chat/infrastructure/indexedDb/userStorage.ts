import type { IUser } from "../../domain/IUser";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

export class UserStorage {
  async getById(id: string): Promise<IUser | undefined> {
    const db = await citrusDb;
    return db.get("users", id);
  }

  async getAll(): Promise<IUser[]> {
    const db = await citrusDb;
    return db.getAll("users");
  }

  async set(user: IUser): Promise<void> {
    const db = await citrusDb;
    await db.put("users", user);
  }

  async setMany(users: IUser[]): Promise<void> {
    const db = await citrusDb;
    const tx = db.transaction("users", "readwrite");

    for (const user of users) {
      tx.store.put(user);
    }

    await tx.done;
  }

  async clear(): Promise<void> {
    const db = await citrusDb;
    await db.clear("users");
  }
}

export const userStorage = new UserStorage();
