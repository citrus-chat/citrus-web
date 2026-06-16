import type { IOneTimePreKey } from "./IOneTimePreKey";
import type { ISignedPreKey } from "./ISignedPreKey";
import type { IIdentityKeyPair } from "./IIdentityKeyPair";
// import { IPreKeyBundle } from "./IPreKeyBundle";


export interface ISignalService {
  generateIdentityKey(): Promise<IIdentityKeyPair>;

  generateSignedPreKey(identityKey: IIdentityKeyPair, keyId: number): Promise<ISignedPreKey>;

  generateOneTimePreKeys(ids: number[]): Promise<IOneTimePreKey[]> 

  // createSession(userId: string,deviceId: string,bundle: IPreKeyBundle): Promise<void>; // Not implemented yet.
}