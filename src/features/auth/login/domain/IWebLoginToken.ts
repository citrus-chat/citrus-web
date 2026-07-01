export interface ICreateWebLoginTokenRequest {
  webDeviceId: string;
  deviceName: string;
  publicKey: string;
}

export interface ICreateWebLoginTokenResponse {
  token: string;
  web_device_id: string;
  expires_at: string;
  qr_payload: string;
  web_socket_token_header: string;
  web_socket_queue: string;
}

export interface IWebLoginSessionResult {
  userId?: string;
  email?: string;
  username?: string;
  deviceId?: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface IWebLoginEvent {
  event?: string;
  type?: string;
  eventType?: string;
  payload?: IWebLoginSessionResult;
  data?: IWebLoginSessionResult;
  result?: IWebLoginSessionResult;
}
