import { getOrCreateDeviceUseCase } from "@/features/device/application/getOrCreateDeviceUseCase";
import type { IDevice } from "@/features/device/domain/IDevice";
import type { ICreateWebLoginTokenResponse } from "@/features/auth/login/domain/IWebLoginToken";
import { createWebLoginTokenApi } from "@/features/auth/login/infrastructure/api/webLoginTokenApi";

export async function createWebLoginTokenUseCase(): Promise<ICreateWebLoginTokenResponse> {
  const device = (await getOrCreateDeviceUseCase()) as IDevice;

  return createWebLoginTokenApi({
    webDeviceId: device.deviceId,
    deviceName: device.deviceName,
    publicKey: device.publicKey,
  });
}
