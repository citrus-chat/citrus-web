import type { ICryptoService } from "../../domain/ICryptoService";
import type { IDeviceKeyPair } from "../../domain/IDeviceKeyPair";
import type { IEncryptedMessage } from "../../domain/IEncryptedMessage";
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "../../helpers/cryptoHelper";

export class CryptoService implements ICryptoService {
  private async importSimetricKey(key: string): Promise<CryptoKey> {
    const rawKey = base64ToUint8Array(key);

    return crypto.subtle.importKey(
      "raw",
      rawKey,
      {
        name: "AES-GCM",
      },
      false,
      ["encrypt", "decrypt"],
    );
  }

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

    const privateKey = await crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

    return {
      publicKey: uint8ArrayToBase64(new Uint8Array(publicKey)),
      privateKey: uint8ArrayToBase64(new Uint8Array(privateKey)),
    };
  }

  async deriveSharedSecret(
    privateKey: string,
    publicKey: string,
  ): Promise<Uint8Array> {
    const importedPrivateKey = await this.importPrivateKey(privateKey);
    const importedPublicKey = await this.importPublicKey(publicKey);

    const bits = await crypto.subtle.deriveBits(
      {
        name: "X25519",
        public: importedPublicKey,
      },
      importedPrivateKey,
      256,
    );

    return new Uint8Array(bits);
  }

  async generateConversationKey(): Promise<string> {
    const key = crypto.getRandomValues(new Uint8Array(32));
    return uint8ArrayToBase64(key);
  }

  async encrypt(
    plaintext: string,
    key: string,
  ): Promise<{ iv: string; ciphertext: string }> {
    const cryptoKey = await this.importSimetricKey(key);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encoded = new TextEncoder().encode(plaintext);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      encoded,
    );

    return {
      iv: uint8ArrayToBase64(iv),
      ciphertext: uint8ArrayToBase64(new Uint8Array(encrypted)),
    };
  }

  async decrypt(payload: IEncryptedMessage, key: string): Promise<string> {
    const cryptoKey = await this.importSimetricKey(key);

    const iv = base64ToUint8Array(payload.iv);
    const encrypted = base64ToUint8Array(payload.ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      encrypted,
    );

    return new TextDecoder().decode(decrypted);
  }
}

export const cryptoService = new CryptoService();
