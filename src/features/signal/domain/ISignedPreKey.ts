import type { IIdentityKeyPair } from "./IIdentityKeyPair";

export interface ISignedPreKey{
  keyId: number;
  keyPair: IIdentityKeyPair;
  signature: string;
}