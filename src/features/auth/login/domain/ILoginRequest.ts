import type { IDevice } from "@/features/device/domain/IDevice";

export interface ILoginRequest {
  email: string;
  password: string;

  device: IDevice;
}
