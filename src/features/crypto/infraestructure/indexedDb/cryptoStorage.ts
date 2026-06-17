import type { ICryptoStorage } from "../../domain/ICryptoStorage";
import type { IDeviceKeyPair } from "../../domain/IDeviceKeyPair";
import type { IConversationKey } from "../../domain/IConversationKey";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

const IDENTITY_KEY = "current";

class IndexedDbCryptoStorage implements ICryptoStorage {
  async saveIdentityKey(key: IDeviceKeyPair): Promise<void> {
    const db = await citrusDb;

    await db.put("identityKeys", key, IDENTITY_KEY);
  }

  async getIdentityKey(): Promise<IDeviceKeyPair | null> {
    const db = await citrusDb;

    return (await db.get("identityKeys", IDENTITY_KEY)) ?? null;
  }

  async saveConversationKey(key: IConversationKey): Promise<void> {
    const db = await citrusDb;

    await db.put("conversationKeys", key);
  }

  async getConversationKey(
    conversationId: string,
    keyVersion: number,
  ): Promise<IConversationKey | null> {
    const db = await citrusDb;

    return (
      (await db.get("conversationKeys", [conversationId, keyVersion])) ?? null
    );
  }

  async getLatestConversationKey(
    conversationId: string,
  ): Promise<IConversationKey | null> {
    const db = await citrusDb;

    const index = db
      .transaction("conversationKeys")
      .store.index("conversationId");

    const keys = await index.getAll(conversationId);

    if (keys.length === 0) {
      return null;
    }

    keys.sort((a, b) => b.keyVersion - a.keyVersion);

    return keys[0];
  }

  async removeConversationKeys(conversationId: string): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction("conversationKeys", "readwrite");

    const index = tx.store.index("conversationId");

    const keys = await index.getAllKeys(conversationId);

    await Promise.all(keys.map((key) => tx.store.delete(key)));

    await tx.done;
  }

  async clear(): Promise<void> {
    const db = await citrusDb;

    const tx = db.transaction(
      ["identityKeys", "conversationKeys", "metadata"],
      "readwrite",
    );

    await tx.objectStore("identityKeys").clear();

    await tx.objectStore("conversationKeys").clear();

    await tx.objectStore("metadata").clear();

    await tx.done;
  }
}

export const cryptoStorage = new IndexedDbCryptoStorage();
