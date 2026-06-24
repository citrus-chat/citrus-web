import { getUserKeysApi } from "../../infrastructure/api/userApi";
import type { IDevicePublicKey } from "../../../crypto/domain/IDevicePublicKey";

export async function loadUsersDeviceKeysUseCase(
  userIds: string[],
): Promise<IDevicePublicKey[]> {
  const results = await Promise.allSettled(
    userIds.map((id) => getUserKeysApi(id)),
  );

  const devices: IDevicePublicKey[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      const user = result.value;

      for (const device of user.devices) {
        devices.push({
          userId: user.userId,
          deviceId: device.deviceId,
          publicKey: device.publicKey,
        });
      }
    }
  }

  return devices;
}
