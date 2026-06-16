import type { ISignalService } from "../../domain/ISignalService";
import type { IIdentityKeyPair } from "../../domain/IIdentityKeyPair";
import type { ISignedPreKey } from "../../domain/ISignedPreKey";
import type { IOneTimePreKey } from "../../domain/IOneTimePreKey";
import { base64ToUint8Array, normalizeUint8Array, uint8ArrayToBase64 } from "../../helpers/signalHelper";

export class SignalService implements ISignalService {

    private generateKeyPair() {
        const privateKey = PrivateKey.generate();
        const publicKey = privateKey.getPublicKey();

        return {
            privateKey,
            publicKey,
        };
    }

  async generateIdentityKey(): Promise<IIdentityKeyPair> {

    const { privateKey, publicKey } = this.generateKeyPair();

    return {
      privateKey: uint8ArrayToBase64(privateKey.serialize()),
      publicKey: uint8ArrayToBase64(publicKey.serialize())
    };
  }

    async generateSignedPreKey(identityKey: IIdentityKeyPair, keyId: number): Promise<ISignedPreKey> {
        const identityPrivateKey = PrivateKey.deserialize(base64ToUint8Array(identityKey.privateKey));

        const { privateKey: signedPreKeyPrivate, publicKey: signedPreKeyPublic } = this.generateKeyPair();

        const signature = identityPrivateKey.sign(normalizeUint8Array(signedPreKeyPublic.serialize()));

        return {
            keyId,

            keyPair: {
                publicKey: uint8ArrayToBase64(signedPreKeyPublic.serialize()),
                privateKey: uint8ArrayToBase64(signedPreKeyPrivate.serialize()),
            },

            signature: uint8ArrayToBase64(signature),
        };
    }

    async generateOneTimePreKeys(ids: number[]): Promise<IOneTimePreKey[]> {
        const preKeys: IOneTimePreKey[] = [];

        for (const keyId of ids) {
            const {privateKey, publicKey } = this.generateKeyPair();

            preKeys.push({
                keyId,

                keyPair: {
                publicKey: uint8ArrayToBase64(
                    publicKey.serialize(),
                ),

                privateKey: uint8ArrayToBase64(
                    privateKey.serialize(),
                ),
                },
            });
        }

        return preKeys;
    }
}