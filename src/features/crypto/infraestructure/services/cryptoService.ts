import type { ICryptoService } from "../../domain/ICryptoService";
import type { IDeviceKeyPair } from "../../domain/IDeviceKeyPair";
import { base64ToUint8Array, uint8ArrayToBase64 } from "../../helpers/cryptoHelper";

export class CryptoService implements ICryptoService {

    private async importPublicKey(publicKey: string): Promise<CryptoKey> {
    
        return crypto.subtle.importKey(
            "raw",
            base64ToUint8Array(publicKey),
            {
                name: "X25519",
            },
            true,
            [],
        );
    }

    private async importPrivateKey(privateKey: string): Promise<CryptoKey> {

        return crypto.subtle.importKey(
            "pkcs8",
            base64ToUint8Array(privateKey),
            {
                name: "X25519",
            },
            true,
            ["deriveBits"],
        );
    }

    async generateIdentityKey(): Promise<IDeviceKeyPair> {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "X25519",
            },
            true,
            ["deriveBits"],
        );

        const publicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);

        const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

        return {
            publicKey: uint8ArrayToBase64(new Uint8Array(publicKey)),

            privateKey: uint8ArrayToBase64(new Uint8Array(privateKey)),
        };
    }

    async deriveSharedSecret(privateKey: string, publicKey: string): Promise<Uint8Array> {

        const importedPrivateKey = await this.importPrivateKey(privateKey);

        const importedPublicKey = await this.importPublicKey(publicKey);

        const bits = await crypto.subtle.deriveBits(
            {
                name: "X25519",
                public: importedPublicKey,
            },
            importedPrivateKey,
            256
        );

        return new Uint8Array(bits);
    }

}