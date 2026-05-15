import type { ILoginRequest } from "@/features/auth/login/domain/ILoginRequest";
import type { ILoginResponse } from "@/features/auth/login/domain/ILoginResponse";
import { loginApi } from "@/features/auth/login/infrastructure/api/loginApi";
import { tokenService } from "@/core/auth/tokenService";

export async function loginUserUseCase(
  request: ILoginRequest,
): Promise<ILoginResponse> {
  const data = await loginApi(request);

  if (!data || !data.accessToken) {
    throw new Error("Invalid login response: missing access token");
  }

  // save only the access token
  tokenService.saveAccessToken(data.accessToken);

  return data;
}
