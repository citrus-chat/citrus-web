import { openDB } from "idb";

export const citrusDb = openDB("citrus-chat", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("device")) {
      db.createObjectStore("device");
    }

    if (!db.objectStoreNames.contains("identityKeys")) {
      db.createObjectStore("identityKeys");
    }

    if (!db.objectStoreNames.contains("conversationKeys")) {
      const store = db.createObjectStore("conversationKeys", {
        keyPath: ["conversationId", "keyVersion"],
      });

      store.createIndex("conversationId", "conversationId", {
        unique: false,
      });
    }

    if (!db.objectStoreNames.contains("metadata")) {
      db.createObjectStore("metadata");
    }

    if (!db.objectStoreNames.contains("chatRooms")) {
      db.createObjectStore("chatRooms", {
        keyPath: "id",
      });
    }

    if (!db.objectStoreNames.contains("messages")) {
      const store = db.createObjectStore("messages", {
        keyPath: "id",
      });

      store.createIndex("chatRoomId", "chatRoomId", {
        unique: false,
      });

      store.createIndex("deliveredAt", "deliveredAt", {
        unique: false,
      });
    }
  },
});
