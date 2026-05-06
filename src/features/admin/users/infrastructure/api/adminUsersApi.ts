import type { RegisterUserRequest } from "@/features/admin/users/domain/RegisterUserRequest";
import type { RegisterUserResponse } from "@/features/admin/users/domain/RegisterUserResponse";
const API_URL = import.meta.env.VITE_API_URL;
export async function registerUserApi(
  request: RegisterUserRequest,
): Promise<RegisterUserResponse> {
  const response = await fetch(`${API_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  return await response.json();
}
