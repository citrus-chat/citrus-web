import { openDB } from "idb";

export const deviceDb = openDB("citrus-chat", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("device")) {
      db.createObjectStore("device");
    }
  },
});