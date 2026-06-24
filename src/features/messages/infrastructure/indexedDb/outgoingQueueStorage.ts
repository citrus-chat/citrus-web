import type { IOutgoingQueueItem } from "../../domain/IOutgoingQueueItem";
import type { IOutgoingQueueStorage } from "../../domain/IOutgoingQueueStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

class IndexedDbOutgoingQueueStorage implements IOutgoingQueueStorage {
  async save(item: IOutgoingQueueItem): Promise<void> {
    const db = await citrusDb;

    await db.put("outgoingQueue", item);
  }

  async saveMany(items: IOutgoingQueueItem[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const db = await citrusDb;

    const tx = db.transaction("outgoingQueue", "readwrite");

    await Promise.all(items.map((item) => tx.store.put(item)));

    await tx.done;
  }

  async getAll(): Promise<IOutgoingQueueItem[]> {
    const db = await citrusDb;

    const items = await db.getAll("outgoingQueue");

    return items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  async remove(id: string): Promise<void> {
    const db = await citrusDb;

    await db.delete("outgoingQueue", id);
  }

  async clear(): Promise<void> {
    const db = await citrusDb;

    await db.clear("outgoingQueue");
  }
}

export const outgoingQueueStorage = new IndexedDbOutgoingQueueStorage();
