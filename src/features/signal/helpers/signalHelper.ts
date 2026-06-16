export function normalizeUint8Array(bytes: Uint8Array,): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(bytes.length);

  const normalized = new Uint8Array(buffer);

  normalized.set(bytes);

  return normalized;
}

export function uint8ArrayToBase64(bytes: Uint8Array,): string {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToUint8Array(base64: string,): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);

  const buffer = new ArrayBuffer(binary.length);

  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}