export function uint8ArrayToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

export function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {

    const binary = atob(base64);

    const buffer = new ArrayBuffer(binary.length);

    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {

    const raw = await crypto.subtle.exportKey("raw", key);

    return uint8ArrayToBase64(new Uint8Array(raw));
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {

    const pkcs8 = await crypto.subtle.exportKey("pkcs8", key);

    return uint8ArrayToBase64(new Uint8Array(pkcs8));
}