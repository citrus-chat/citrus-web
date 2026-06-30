import { getCurrentUserApi } from "@/features/profile/infrastructure/api/profileApi";
import type { ICurrentUserResponse } from "@/features/profile/domain/ICurrentUserResponse";

export async function getCurrentUserUseCase(): Promise<ICurrentUserResponse> {
  return getCurrentUserApi();
}
