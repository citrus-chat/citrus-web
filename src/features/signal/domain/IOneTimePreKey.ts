import type { IIdentityKeyPair } from "./IIdentityKeyPair";

export interface IOneTimePreKey{
  keyId: number;
  keyPair: IIdentityKeyPair;
}