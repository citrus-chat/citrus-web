export interface IDevice {
  deviceId: string;
  deviceName: string;

  publicIdentityKey: IIdentityKeyPair;

  signedPreKey: ISignedPreKey;

  oneTimePreKeys: Array<IOneTimePreKey>;
}