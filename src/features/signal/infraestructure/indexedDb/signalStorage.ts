import { signalDb } from "../signalDb";
import type { ISignalStorage } from "../../domain/ISignalStorage";
import type { IIdentityKeyPair } from "../../domain/IIdentityKeyPair";
import type { ISignedPreKey } from "../../domain/ISignedPreKey";
import type { IOneTimePreKey } from "../../domain/IOneTimePreKey";
import type { ISessionRecord } from "../../domain/ISessionRecord";

const IDENTITY_KEY = "current";
const SIGNED_PREKEY = "active";

const ONE_TIME_PREKEY_COUNTER = "one-time-prekey-counter";
const SIGNED_PREKEY_COUNTER = "signed-prekey-counter";

class IndexedDbSignalStorage implements ISignalStorage {
    private buildSessionId(userId: string, deviceId: string): string {
        return `${userId}:${deviceId}`;
    }

    async saveIdentityKey(key: IIdentityKeyPair): Promise<void> {
        const db = await signalDb;

        await db.put("identityKeys",key,IDENTITY_KEY);
    }

    async getIdentityKey() {
        const db = await signalDb;

        return (await db.get("identityKeys",IDENTITY_KEY)) ?? null;
    }

    async saveSignedPreKey(key: ISignedPreKey) {
        const db = await signalDb;

        await db.put("signedPreKeys",key,SIGNED_PREKEY);
    }

    async getSignedPreKey() {
        const db = await signalDb;

        return (await db.get("signedPreKeys",SIGNED_PREKEY)) ?? null;
    }

    async nextSignedPreKeyId(): Promise<number> {
        const db = await signalDb;

        const current =(await db.get("metadata",SIGNED_PREKEY_COUNTER)) ?? 0;

        const next = current + 1;

        await db.put("metadata",next,SIGNED_PREKEY_COUNTER);

        return next;
    }

    async saveOneTimePreKeys(keys: IOneTimePreKey[]) {
        const db = await signalDb;

        const tx = db.transaction("oneTimePreKeys","readwrite");

        const puts = keys.map(key => tx.store.put(key));

        await Promise.all(puts);

        await tx.done;

        await tx.done;
    }

    async getOneTimePreKeys() {
        const db = await signalDb;

        return await db.getAll("oneTimePreKeys");
    }

    async getOneTimePreKey(keyId: number): Promise<IOneTimePreKey | null> {
        const db = await signalDb;

        return (await db.get("oneTimePreKeys",keyId)) ?? null;
    }

    async getNextOneTimePreKeyIds(count: number): Promise<number[]> {
        const db = await signalDb;

        const current =(await db.get("metadata",ONE_TIME_PREKEY_COUNTER)) ?? 0;

        const ids: number[] = [];

        for (let i = 1; i <= count; i++) {
            ids.push(current + i);
        }

        await db.put("metadata", current + count, ONE_TIME_PREKEY_COUNTER);

        return ids;
    }

    async countOneTimePreKeys() {
        const db = await signalDb;

        return await db.count("oneTimePreKeys");
    }

    async removeOneTimePreKey(keyId: number) {
        const db = await signalDb;

        await db.delete("oneTimePreKeys",keyId);
    }

    async saveSession(session: ISessionRecord): Promise<void> {

        const db = await signalDb;

        await db.put("sessions",{
            id: this.buildSessionId(session.userId, session.deviceId),
            ...session
            });
    }

    async getSession(userId: string, deviceId: string): Promise<ISessionRecord | null> {
        const db = await signalDb;

        return (await db.get("sessions", this.buildSessionId(userId,deviceId))) ?? null;
    }

    async removeSession(userId: string, deviceId: string): Promise<void> {
        const db = await signalDb;

        await db.delete("sessions",this.buildSessionId(userId,deviceId));
    }

    async removeUserSessions(userId: string): Promise<void> {
        const db = await signalDb;

        const tx = db.transaction("sessions","readwrite");

        const index = tx.store.index("userId");

        const keys = await index.getAllKeys(userId);

        await Promise.all(keys.map(key =>tx.store.delete(key)));

        await tx.done;
    }

    async clear(): Promise<void> {
        const db = await signalDb;

        const tx = db.transaction(
            [
            "identityKeys",
            "signedPreKeys",
            "oneTimePreKeys",
            "sessions",
            "metadata",
            ],
            "readwrite",
        );

        await tx.objectStore("identityKeys").clear();

        await tx.objectStore("signedPreKeys").clear();

        await tx.objectStore("oneTimePreKeys").clear();

        await tx.objectStore("sessions").clear();

        await tx.objectStore("metadata").clear();

        await tx.done;
    }
}

export const signalStorage = new IndexedDbSignalStorage();