import type { IChatRoom } from "../../domain/IChatRoom";
import type { IChatStorage } from "../../domain/IChatStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

class IndexedDbChatStorage implements IChatStorage {
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

    return await db.getAll("chatRooms");
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