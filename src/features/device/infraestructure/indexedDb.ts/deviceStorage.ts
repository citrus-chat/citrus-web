import type { IDevice } from "../../domain/IDevice";
import type { IDeviceStorage } from "../../domain/IDeviceStorage";
import { citrusDb } from "@/shared/infrastructure/indexedDb/citrusDb";

const DEVICE_KEY = "current-device";

class IndexedDbDeviceStorage implements IDeviceStorage {
  async save(device: IDevice): Promise<void> {
    const db = await citrusDb;

    console.log("Saving device to IndexedDB:", device);

    await db.put("device", device, DEVICE_KEY);
  }

  async get(): Promise<IDevice | null> {
    const db = await citrusDb;

    return (await db.get("device", DEVICE_KEY)) ?? null;
  }

  async remove(): Promise<void> {
    const db = await citrusDb;

    await db.delete("device", DEVICE_KEY);
  }

  async exists(): Promise<boolean> {
    const db = await citrusDb;

    return (await db.get("device", DEVICE_KEY)) != null;
  }
}

export const deviceStorage = new IndexedDbDeviceStorage();
