import { apiClient } from "@/core/api/apiClient";
import type { IGetKeysResponse } from "../../domain/IGetKeysResponse";

export async function getDeviceKeysApi(
  deviceId: string,
): Promise<IGetKeysResponse> {
  const data = await apiClient.get<IGetKeysResponse>(
    `/devices/${deviceId}/keys`,
  );

  return data;
}
