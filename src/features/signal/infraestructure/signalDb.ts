import { openDB } from "idb";

export const signalDb = openDB(
  "citrus-chat",
  1,
  {
    upgrade(db) {
    if(!db.objectStoreNames.contains("sessions")) {
        const sessionStore = db.createObjectStore(
            "sessions",
            {
                keyPath: "id",
            }
        );

        sessionStore.createIndex(
            "userId",
            "userId",
            {
                unique: false,
            }
        );

        sessionStore.createIndex(
            "deviceId",
            "deviceId",
            {
                unique: false,
            }
        );
    }
    
    if (!db.objectStoreNames.contains("identityKeys")) {
        db.createObjectStore("identityKeys");
    }

    if (!db.objectStoreNames.contains("signedPreKeys")) {
        db.createObjectStore("signedPreKeys");
    }

    if (!db.objectStoreNames.contains("oneTimePreKeys")) {
        db.createObjectStore(
            "oneTimePreKeys",
            {
            keyPath: "keyId",
            }
        );
    }

    if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata");
    }
    },
  },
);