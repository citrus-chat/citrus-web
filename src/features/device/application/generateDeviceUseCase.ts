import type { IDevice } from "@/features/device/domain/IDevice";
import { generateDeviceName } from "@/features/device/application/generateDeviceName";

import { CryptoService } from "@/features/crypto/infraestructure/services/cryptoService";
import { cryptoStorage } from "@/features/crypto/infraestructure/indexedDb/cryptoStorage";

const cryptoService = new CryptoService();

export async function generateDeviceUseCase(): Promise<IDevice> {
  const deviceId = crypto.randomUUID();

  const deviceName = generateDeviceName();

  const identityKey = await cryptoService.generateIdentityKey();

  await cryptoStorage.saveIdentityKey(identityKey);

  return {
    deviceId,
    deviceName,
    deviceType: "WEB",
    publicKey: identityKey.publicKey,
  };
}
