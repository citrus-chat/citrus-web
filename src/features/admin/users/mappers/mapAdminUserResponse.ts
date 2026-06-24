import type {
  AdminUserStatus,
  AdminUserValidationStatus,
} from "@/features/admin/users/domain/AdminUserStatus";
import type { IAdminUser } from "@/features/admin/users/domain/IAdminUser";
import type { IAdminUsersPaginatedResponse } from "@/features/admin/users/domain/IAdminUsersPaginatedResponse";
import type { IPaginationMeta } from "@/features/admin/users/domain/IPaginationMeta";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getBoolean(
  record: UnknownRecord,
  keys: string[],
): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (
        ["true", "active", "enabled", "validated", "verified"].includes(
          normalized,
        )
      ) {
        return true;
      }
      if (
        [
          "false",
          "inactive",
          "disabled",
          "pending",
          "unvalidated",
          "unverified",
        ].includes(normalized)
      ) {
        return false;
      }
    }
  }

  return undefined;
}

function getNumber(record: UnknownRecord, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function toStatus(value: boolean | undefined): AdminUserStatus {
  if (value === true) return "active";
  if (value === false) return "inactive";
  return "unknown";
}

function toValidationStatus(
  value: boolean | undefined,
): AdminUserValidationStatus {
  if (value === true) return "validated";
  if (value === false) return "pending";
  return "unknown";
}

export function mapAdminUserResponse(
  response: UnknownRecord,
  index: number,
): IAdminUser {
  const firstName = getString(response, ["firstName", "first_name"]);
  const lastName = getString(response, ["lastName", "last_name"]);
  const username = getString(response, ["username", "userName"]);
  const email = getString(response, ["email"]);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return {
    id:
      getString(response, ["id", "userId", "uuid"]) ??
      username ??
      email ??
      `user-${index}`,
    displayName: fullName || username || email || "Usuario sin identificar",
    username,
    email,
    firstName,
    lastName,
    fullName: fullName || undefined,
    phoneNumber: getString(response, ["phoneNumber", "phone", "phone_number"]),
    avatarUrl: getString(response, ["avatarUrl", "avatar_url"]) ?? null,
    status: toStatus(
      getBoolean(response, ["active", "isActive", "enabled", "status"]),
    ),
    active: getBoolean(response, ["active", "isActive", "enabled", "status"]),
    validationStatus: toValidationStatus(
      getBoolean(response, [
        "validated",
        "isValidated",
        "verified",
        "isVerified",
        "emailVerified",
        "validationStatus",
      ]),
    ),
    validated: getBoolean(response, [
      "validated",
      "isValidated",
      "verified",
      "isVerified",
      "emailVerified",
      "validationStatus",
    ]),
    role: getString(response, ["role", "userRole"]),
    organization: getString(response, ["organization", "department"]),
    position: getString(response, ["position", "jobTitle", "title"]),
    createdAt: getString(response, ["createdAt", "created_at"]),
    updatedAt: getString(response, ["updatedAt", "updated_at"]),
  };
}

function mapPaginationMeta(
  payload: unknown,
  itemCount: number,
): IPaginationMeta {
  const meta = isRecord(payload) ? payload : {};
  const currentPage = getNumber(meta, "currentPage") ?? 0;
  const perPage = getNumber(meta, "perPage") ?? itemCount;
  const total = getNumber(meta, "total") ?? itemCount;
  const lastPage =
    getNumber(meta, "lastPage") ??
    Math.max(0, Math.ceil(total / Math.max(perPage, 1)) - 1);

  return {
    currentPage,
    perPage,
    total,
    lastPage,
    from:
      getNumber(meta, "from") ?? (total === 0 ? 0 : currentPage * perPage + 1),
    to: getNumber(meta, "to") ?? Math.min(total, (currentPage + 1) * perPage),
    hasNextPage:
      typeof meta.hasNextPage === "boolean"
        ? meta.hasNextPage
        : currentPage < lastPage,
    hasPreviousPage:
      typeof meta.hasPreviousPage === "boolean"
        ? meta.hasPreviousPage
        : currentPage > 0,
  };
}

/** Maps the backend paginator payload into the stable UI user model. */
export function mapAdminUsersPaginatedResponse(
  payload: unknown,
): IAdminUsersPaginatedResponse {
  const response = isRecord(payload) ? payload : {};
  const rawItems = Array.isArray(response.items)
    ? response.items.filter(isRecord)
    : [];
  const items = rawItems.map(mapAdminUserResponse);

  return {
    items,
    meta: mapPaginationMeta(response.meta, items.length),
  };
}
