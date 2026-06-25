import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

const STORE = "sync";
const LAST_SYNC_KEY = "lastSync";

export async function getLastSync(): Promise<string | null> {
  const db = await citrusDb;
  const value = await db.get(STORE, LAST_SYNC_KEY);
  return value ?? null;
}

export async function setLastSync(value: string): Promise<void> {
  const db = await citrusDb;
  await db.put(STORE, value, LAST_SYNC_KEY);
}
