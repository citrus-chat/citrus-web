import type { IEncryptedMessage } from "../../domain/IEncryptedMessage";
import type { IEncryptedMessageStorage } from "../../domain/IEncryptedMessageStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

export class IndexedDbEncryptedMessageStorage implements IEncryptedMessageStorage {
  async save(message: IEncryptedMessage): Promise<void> {
    const db = await citrusDb;

    await db.put("encryptedMessages", message);
  }

  async saveMany(messages: IEncryptedMessage[]): Promise<void> {
    if (messages.length === 0) return;

    const db = await citrusDb;

    const tx = db.transaction("encryptedMessages", "readwrite");

    await Promise.all(messages.map((msg) => tx.store.put(msg)));

    await tx.done;
  }

  async getById(id: string): Promise<IEncryptedMessage | null> {
    const db = await citrusDb;

    return (await db.get("encryptedMessages", id)) ?? null;
  }

  async getByConversationId(
    conversationId: string,
  ): Promise<IEncryptedMessage[]> {
    const db = await citrusDb;

    const index = db
      .transaction("encryptedMessages")
      .store.index("conversationId");

    const messages = await index.getAll(conversationId);

    return messages.sort((a, b) => a.messageId.localeCompare(b.messageId));
  }

  async deleteByConversationId(conversationId: string): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction("encryptedMessages", "readwrite");

    const index = tx.store.index("conversationId");

    const keys = await index.getAllKeys(conversationId);

    await Promise.all(keys.map((key) => tx.store.delete(key)));

    await tx.done;
  }

  async getLastMessage(
    conversationId: string,
  ): Promise<IEncryptedMessage | undefined> {
    const db = await citrusDb;

    const tx = db.transaction("encryptedMessages", "readonly");
    const store = tx.objectStore("encryptedMessages");

    const index = store.index("by_conversation_createdAt");

    const range = IDBKeyRange.bound(
      [conversationId, -Infinity],
      [conversationId, Infinity],
    );

    const cursor = await index.openCursor(range, "prev");

    return cursor?.value;
  }
}

export const encryptedMessageStorage = new IndexedDbEncryptedMessageStorage();
