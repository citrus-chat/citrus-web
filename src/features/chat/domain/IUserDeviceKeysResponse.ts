export interface IUserDeviceKeysResponse {
  userId: string;
  devices: {
    deviceId: string;
    publicKey: string;
  }[];
}
