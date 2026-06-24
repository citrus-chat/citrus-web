import { describe, expect, it } from "vitest";

import { ApiError } from "./apiError";
import {
  getUserFriendlyErrorMessage,
  normalizeApiError,
} from "./apiErrorMapper";

describe("apiErrorMapper", () => {
  it.each([
    ["Invalid public key format", 400, "UNEXPECTED_ERROR"],
    ["JWT validation failed", 400, undefined],
    ["private key is missing", 400, undefined],
    ["cryptographic operation failed", 400, undefined],
    ["invalid signature", 400, undefined],
    ["A server-side failure occurred", 500, undefined],
  ])(
    "never exposes technical backend message %s during login",
    (message, statusCode, errorCode) => {
      const error = new ApiError("API request failed", statusCode, {
        success: false,
        message,
        statusCode,
        ...(errorCode ? { errorCode } : {}),
      });

      expect(normalizeApiError(error).category).toBe("technical");
      expect(getUserFriendlyErrorMessage(error, "login")).toBe(
        "No pudimos procesar el inicio de sesión. Verifica tus datos o intenta nuevamente más tarde.",
      );
    },
  );

  it.each([
    ["INVALID_CREDENTIALS", "Email o contraseña incorrectos."],
    ["ACCOUNT_NOT_VERIFIED", "Tu cuenta todavía no fue validada."],
    ["ACCOUNT_DISABLED", "Tu cuenta no está habilitada para acceder."],
  ])("maps %s to a safe message", (errorCode, expectedMessage) => {
    const error = new ApiError("API request failed", 400, {
      success: false,
      message: "Internal detail that must not reach the UI",
      statusCode: 400,
      errorCode,
    });

    expect(getUserFriendlyErrorMessage(error, "login")).toBe(expectedMessage);
  });

  it("maps fetch failures to the connection message", () => {
    expect(getUserFriendlyErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.",
    );
  });
});
