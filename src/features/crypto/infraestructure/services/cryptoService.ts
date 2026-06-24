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

  private async importECDHPublicKey(publicKey: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      "raw",
      base64ToUint8Array(publicKey),
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      [],
    );
  }

  private async importECDHPrivateKey(privateKey: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
      "pkcs8",
      base64ToUint8Array(privateKey),
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveBits"],
    );
  }

  async generateIdentityKey(): Promise<IDeviceKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
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

  private async deriveAesKeyFromSharedSecret(
    privateKey: string,
    publicKey: string,
  ): Promise<CryptoKey> {
    const priv = await this.importECDHPrivateKey(privateKey);
    const pub = await this.importECDHPublicKey(publicKey);

    const sharedBits = await crypto.subtle.deriveBits(
      { name: "ECDH", public: pub },
      priv,
      256,
    );

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      sharedBits,
      "HKDF",
      false,
      ["deriveKey"],
    );

    return crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array([]),
        info: new TextEncoder().encode("conversation-key-wrap"),
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
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

  async encryptConversationKeyForUser(
    conversationKey: string,
    userPublicKey: string,
    myPrivateKey: string,
  ): Promise<{ iv: string; ciphertext: string }> {
    const aesKey = await this.deriveAesKeyFromSharedSecret(
      myPrivateKey,
      userPublicKey,
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(conversationKey);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      encoded,
    );

    return {
      iv: uint8ArrayToBase64(iv),
      ciphertext: uint8ArrayToBase64(new Uint8Array(encrypted)),
    };
  }

  async decryptConversationKeyForUser(
    payload: { iv: string; ciphertext: string },
    senderPublicKey: string,
    myPrivateKey: string,
  ): Promise<string> {
    const aesKey = await this.deriveAesKeyFromSharedSecret(
      myPrivateKey,
      senderPublicKey,
    );

    const iv = base64ToUint8Array(payload.iv);
    const ciphertext = base64ToUint8Array(payload.ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      ciphertext,
    );

    return new TextDecoder().decode(decrypted);
  }
}

export const cryptoService = new CryptoService();
