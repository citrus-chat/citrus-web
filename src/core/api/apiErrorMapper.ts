export type ApiErrorCategory =
  | "network"
  | "invalid_credentials"
  | "account_not_validated"
  | "account_disabled"
  | "technical"
  | "unknown";

export type NormalizedApiError = {
  category: ApiErrorCategory;
  errorCode?: string;
  statusCode?: number;
  rawMessage?: string;
};

export type ApiErrorMessageContext = "login" | "default";

const INVALID_CREDENTIALS_CODES = new Set([
  "INVALID_CREDENTIALS",
  "BAD_CREDENTIALS",
  "AUTH_INVALID_CREDENTIALS",
]);

const ACCOUNT_NOT_VALIDATED_CODES = new Set([
  "ACCOUNT_NOT_VALIDATED",
  "ACCOUNT_NOT_VERIFIED",
  "USER_NOT_VALIDATED",
  "USER_NOT_VERIFIED",
  "EMAIL_NOT_VERIFIED",
]);

const ACCOUNT_DISABLED_CODES = new Set([
  "ACCOUNT_BLOCKED",
  "ACCOUNT_DISABLED",
  "ACCOUNT_LOCKED",
  "USER_BLOCKED",
  "USER_DISABLED",
  "USER_LOCKED",
]);

const TECHNICAL_MESSAGE_PATTERN =
  /invalid\s+(?:public|private)\s+key|jwt|\bkey\b|public\s+key|private\s+key|cryptographic|signature/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/**
 * Extracts only the information needed to decide what can safely be shown to
 * a user. The original server message stays in ApiError.data for development
 * diagnostics, but must never be rendered directly in the UI.
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (error instanceof TypeError) {
    return { category: "network" };
  }

  if (!isRecord(error)) {
    return { category: "unknown" };
  }

  const data = isRecord(error.data) ? error.data : undefined;
  const errorCode = getString(
    data?.errorCode ?? error.errorCode,
  )?.toUpperCase();
  const statusCode = getNumber(
    data?.statusCode ?? error.statusCode ?? error.status,
  );
  const rawMessage = getString(data?.message ?? error.message);

  if (statusCode === 0) {
    return { category: "network", errorCode, statusCode, rawMessage };
  }

  if (INVALID_CREDENTIALS_CODES.has(errorCode ?? "")) {
    return {
      category: "invalid_credentials",
      errorCode,
      statusCode,
      rawMessage,
    };
  }

  if (ACCOUNT_NOT_VALIDATED_CODES.has(errorCode ?? "")) {
    return {
      category: "account_not_validated",
      errorCode,
      statusCode,
      rawMessage,
    };
  }

  if (ACCOUNT_DISABLED_CODES.has(errorCode ?? "")) {
    return {
      category: "account_disabled",
      errorCode,
      statusCode,
      rawMessage,
    };
  }

  if (
    errorCode === "UNEXPECTED_ERROR" ||
    (statusCode !== undefined && statusCode >= 500) ||
    TECHNICAL_MESSAGE_PATTERN.test(rawMessage ?? "")
  ) {
    return { category: "technical", errorCode, statusCode, rawMessage };
  }

  return { category: "unknown", errorCode, statusCode, rawMessage };
}

export function getUserFriendlyErrorMessage(
  error: unknown,
  context: ApiErrorMessageContext = "default",
): string {
  switch (normalizeApiError(error).category) {
    case "network":
      return "No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.";
    case "invalid_credentials":
      return "Email o contraseña incorrectos.";
    case "account_not_validated":
      return "Tu cuenta todavía no fue validada.";
    case "account_disabled":
      return "Tu cuenta no está habilitada para acceder.";
    case "technical":
      return context === "login"
        ? "No pudimos procesar el inicio de sesión. Verifica tus datos o intenta nuevamente más tarde."
        : "No pudimos iniciar sesión en este momento. Intenta nuevamente más tarde.";
    case "unknown":
      return "No pudimos completar la operación. Intenta nuevamente más tarde.";
  }
}
