import type { IValidateUserAccountRequest } from "./../../domain/IValidateUserAccountRequest";
import type { IValidateUserAccountResponse } from "../../domain/IValidateUserAccountResponse";

const API_URL = import.meta.env.VITE_API_URL;

export async function validateUserAccountApi(
  request: IValidateUserAccountRequest,
): Promise<IValidateUserAccountResponse> {
  const response = await fetch(`${API_URL}/auth/validate-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to validate account");
  }

  return await response.json();
}
