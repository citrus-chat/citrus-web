//llama al get api/v1/auth por la api client
import { apiClient } from "@/core/api/apiClient";
import type { ICurrentUserResponse } from "@/features/profile/domain/ICurrentUserResponse";

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────────
export function getCurrentUserApi(): Promise<ICurrentUserResponse> {
  return apiClient.get<ICurrentUserResponse>("/auth/me");
}

// ── Persisted profile shape (matches backend UserProfileResponse) ─────────────
export interface IRemoteProfile {
  userId: string;

  username: string;
  avatarUrl: string | null;

  description: string;
  privacy: "public" | "contacts" | "private";

  showPhone: boolean;
  showEmail: boolean;
  showStatus: boolean;
  showDescription: boolean;
  allowGroupInvites: boolean;
}

export interface IUpdateProfilePayload {
  username: string;
  avatarUrl: string;

  description: string;
  privacy: "public" | "contacts" | "private";

  showPhone: boolean;
  showEmail: boolean;
  showStatus: boolean;
  showDescription: boolean;
  allowGroupInvites: boolean;
}

// ── GET /api/v1/users/me/profile ─────────────────────────────────────────────
export function getMyProfileApi(): Promise<IRemoteProfile> {
  return apiClient.get<IRemoteProfile>("/users/me/profile");
}

// ── PUT /api/v1/users/me/profile ─────────────────────────────────────────────
export function updateMyProfileApi(payload: IUpdateProfilePayload): Promise<IRemoteProfile> {
  return apiClient.put<IRemoteProfile, IUpdateProfilePayload>("/users/me/profile", payload);
}