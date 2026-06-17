import type { IDevice } from "./IDevice";

export interface IDeviceStorage {
  save(device: IDevice): Promise<void>;
  get(): Promise<IDevice | null>;
  remove(): Promise<void>;
  exists(): Promise<boolean>;
}
