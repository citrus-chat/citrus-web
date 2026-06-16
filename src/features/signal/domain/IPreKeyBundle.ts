export interface IPreKeyBundle {
  identityPublicKey: string;

  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };

  oneTimePreKey?: {
    keyId: number;
    publicKey: string;
  };
}