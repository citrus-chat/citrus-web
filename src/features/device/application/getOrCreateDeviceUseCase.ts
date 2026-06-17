import { deviceStorage } from "@/features/device/infraestructure/indexedDb.ts/deviceStorage";
import { generateDeviceUseCase } from "./generateDeviceUseCase";
import type { IDevice } from "@/features/device/domain/IDevice";

export async function getOrCreateDeviceUseCase() {
  const stored = await deviceStorage.get();

  if (stored) {
    return stored;
  }

  const device = <IDevice>await generateDeviceUseCase();

  await deviceStorage.save(device);

  return device;
}
