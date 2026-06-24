import type { ILoginForm } from "@/features/auth/login/domain/ILoginForm";
import type { ILoginResponse } from "@/features/auth/login/domain/ILoginResponse";
import type { ILoginRequest } from "@/features/auth/login/domain/ILoginRequest";
import { getOrCreateDeviceUseCase } from "@/features/device/application/getOrCreateDeviceUseCase";
import { loginApi } from "@/features/auth/login/infrastructure/api/loginApi";
import { tokenService } from "@/core/auth/tokenService";
import { ApiError } from "@/core/api/apiError";
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
    throw new ApiError("Invalid login response", 500, {
      success: false,
      message: "Login response did not include an access token",
      statusCode: 500,
      errorCode: "UNEXPECTED_ERROR",
    });
  }

  tokenService.saveAccessToken(data.accessToken);

  return data;
}
