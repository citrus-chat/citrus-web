import type { ILoginForm } from "@/features/auth/login/domain/ILoginForm";
import type { ILoginResponse } from "@/features/auth/login/domain/ILoginResponse";
import type { ILoginRequest } from "@/features/auth/login/domain/ILoginRequest";
import { getOrCreateDeviceUseCase } from "@/features/device/application/getOrCreateDeviceUseCase";
import { loginApi } from "@/features/auth/login/infrastructure/api/loginApi";
import { tokenService } from "@/core/auth/tokenService";
import type { IDevice } from "@/features/device/domain/IDevice";

export async function loginUserUseCase(
  request: ILoginForm,
): Promise<ILoginResponse> {
  const device = <IDevice>await getOrCreateDeviceUseCase(); // Generamos el dispositivo con sus keys

  const loginRequest: ILoginRequest = {
    email: request.email,
    password: request.password,
    deviceRequest: device,
  };

  const data = await loginApi(loginRequest);

  if (!data || !data.accessToken) {
    throw new Error("Invalid login response: missing access token");
  }

  tokenService.saveAccessToken(data.accessToken);

  return data;
}
