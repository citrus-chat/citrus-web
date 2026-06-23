import type { IMessage } from "../../domain/IMessage";
import type { IMessageStorage } from "../../domain/IMessageStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

export class IndexedDbMessageStorage implements IMessageStorage {
  async save(message: IMessage): Promise<void> {
    const db = await citrusDb;

    await db.put("messages", message);
  }

  async saveMany(messages: IMessage[]): Promise<void> {
    if (messages.length === 0) {
      return;
    }

    const db = await citrusDb;

    const tx = db.transaction("messages", "readwrite");

    await Promise.all(messages.map((message) => tx.store.put(message)));

    await tx.done;
  }

  async getByConversationId(conversationId: string): Promise<IMessage[]> {
    const db = await citrusDb;

    const index = db.transaction("messages").store.index("conversationId");

    const messages = await index.getAll(conversationId);

    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
}

export const messageStorage = new IndexedDbMessageStorage();
