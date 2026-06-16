import type { IIdentityKeyPair } from "./IIdentityKeyPair";
import type { ISignedPreKey } from "./ISignedPreKey";
import type { IOneTimePreKey } from "./IOneTimePreKey";
import type { ISessionRecord } from "./ISessionRecord";

export interface ISignalStorage {
    saveIdentityKey(key: IIdentityKeyPair, ): Promise<void>;

    getIdentityKey(): Promise<IIdentityKeyPair | null>;

    saveSignedPreKey(key: ISignedPreKey,): Promise<void>;

    getSignedPreKey(): Promise<ISignedPreKey | null>;

    nextSignedPreKeyId(): Promise<number>;

    saveOneTimePreKeys(keys: IOneTimePreKey[],): Promise<void>;

    getOneTimePreKeys(): Promise<IOneTimePreKey[]>;

    getOneTimePreKey(keyId: number): Promise<IOneTimePreKey | null>;

    getNextOneTimePreKeyIds(count: number): Promise<number[]>;

    countOneTimePreKeys(): Promise<number>;

    removeOneTimePreKey(keyId: number): Promise<void>;

    saveSession(session: ISessionRecord): Promise<void>;

    getSession(userId: string, deviceId: string): Promise<ISessionRecord | null>;

    removeSession(userId: string, deviceId: string): Promise<void>;

    removeUserSessions(userId: string): Promise<void>

    clear() : Promise<void>;
}