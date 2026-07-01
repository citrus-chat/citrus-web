import type { IChatRoom } from "../../domain/IChatRoom";
import type { IChatStorage } from "../../domain/IChatStorage";
import { toPlainObject } from "@/core/utils/toPlainObject";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";
import { mergeChatRoomRoles } from "../../utils/mergeChatRoomRoles";

function normalizeChatRoomForStorage(chatRoom: IChatRoom): IChatRoom {
  const plainChatRoom = toPlainObject(chatRoom) as IChatRoom & {
    messages?: unknown;
  };

  delete plainChatRoom.messages;

  return {
    ...plainChatRoom,
    roles: plainChatRoom.roles ?? {},
  };
}

class IndexedDbChatStorage implements IChatStorage {
  async saveMany(chatRooms: IChatRoom[]): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction("chatRooms", "readwrite");

    for (const chatRoom of chatRooms) {
      const plainChatRoom = normalizeChatRoomForStorage(chatRoom);
      const existing = (await tx.store.get(plainChatRoom.id)) ?? null;
      const mergedChatRoom = mergeChatRoomRoles(
        plainChatRoom,
        existing ? normalizeChatRoomForStorage(existing) : null,
      );

      await tx.store.put(normalizeChatRoomForStorage(mergedChatRoom));
    }

    await tx.done;
  }

  async save(chatRoom: IChatRoom): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction("chatRooms", "readwrite");
    const plainChatRoom = normalizeChatRoomForStorage(chatRoom);

    await tx.store.put(plainChatRoom);
    await tx.done;
  }

  async getById(id: string): Promise<IChatRoom | null> {
    const db = await citrusDb;

    const chatRoom = (await db.get("chatRooms", id)) ?? null;

    return chatRoom ? normalizeChatRoomForStorage(chatRoom) : null;
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
