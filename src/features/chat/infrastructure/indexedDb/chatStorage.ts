import type { IChatRoom } from "../../domain/IChatRoom";
import type { IChatStorage } from "../../domain/IChatStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

class IndexedDbChatStorage implements IChatStorage {
  async saveMany(chatRooms: IChatRoom[]): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction("chatRooms", "readwrite");

    await Promise.all(chatRooms.map((chatRoom) => tx.store.put(chatRoom)));

    await tx.done;
  }

  async save(chatRoom: IChatRoom): Promise<void> {
    const db = await citrusDb;

    await db.put("chatRooms", chatRoom);
  }

  async getById(id: string): Promise<IChatRoom | null> {
    const db = await citrusDb;

    return (await db.get("chatRooms", id)) ?? null;
  }

  async getAll(): Promise<IChatRoom[]> {
    const db = await citrusDb;

    const all = await db.getAll("chatRooms");
    const seen = new Map<string, IChatRoom>();
    for (const chatRoom of all) {
      seen.set(chatRoom.id, chatRoom);
    }
    return Array.from(seen.values());
  }

  async remove(id: string): Promise<void> {
    const db = await citrusDb;

    await db.delete("chatRooms", id);
  }

  async exists(id: string): Promise<boolean> {
    const db = await citrusDb;

    return (await db.get("chatRooms", id)) != null;
  }
}

export const chatStorage = new IndexedDbChatStorage();
