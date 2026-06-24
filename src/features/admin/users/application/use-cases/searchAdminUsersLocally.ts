import type { IAdminUser } from "@/features/admin/users/domain/IAdminUser";
import type {
  AdminUserStatus,
  AdminUserValidationStatus,
} from "@/features/admin/users/domain/AdminUserStatus";

export type AdminUserFilters = {
  query?: string;
  status?: AdminUserStatus | "all";
  validation?: AdminUserValidationStatus | "all";
  role?: string | "all";
};

function normalize(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

export function searchAdminUsersLocally(
  users: IAdminUser[],
  filters: AdminUserFilters,
): IAdminUser[] {
  const query = normalize(filters.query);

  return users.filter((user) => {
    const searchableContent = [
      user.displayName,
      user.username,
      user.email,
      user.phoneNumber,
      user.organization,
      user.position,
      user.role,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!query || searchableContent.includes(query)) &&
      (!filters.status ||
        filters.status === "all" ||
        user.status === filters.status) &&
      (!filters.validation ||
        filters.validation === "all" ||
        user.validationStatus === filters.validation) &&
      (!filters.role || filters.role === "all" || user.role === filters.role)
    );
  });
}
