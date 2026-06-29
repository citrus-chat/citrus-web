import { openDB } from "idb";

export const citrusDb = openDB("citrus-chat", 6, {
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
      const messageStore = db.createObjectStore("messages", {
        keyPath: "id",
      });

      messageStore.createIndex("conversationId", "conversationId");
    }

    if (!db.objectStoreNames.contains("encryptedMessages")) {
      const store = db.createObjectStore("encryptedMessages", {
        keyPath: "id",
      });

      store.createIndex("conversationId", "conversationId", {
        unique: false,
      });

      store.createIndex("messageId", "messageId", {
        unique: false,
      });

      store.createIndex("by_conversation_createdAt", [
        "conversationId",
        "createdAt",
      ]);
    }

    if (!db.objectStoreNames.contains("outgoingQueue")) {
      const store = db.createObjectStore("outgoingQueue", {
        keyPath: "id",
      });

      store.createIndex("createdAt", "createdAt");
    }

    if (!db.objectStoreNames.contains("users")) {
      const store = db.createObjectStore("users", {
        keyPath: "id",
      });

      store.createIndex("name", "name", { unique: false });
    }

    if (!db.objectStoreNames.contains("profile")) {
      db.createObjectStore("profile", {
        keyPath: "userId",
      });
    }

    if (!db.objectStoreNames.contains("sync")) {
      db.createObjectStore("sync");
    }
  },
});
