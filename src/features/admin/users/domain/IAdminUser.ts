import type {
  AdminUserStatus,
  AdminUserValidationStatus,
} from "./AdminUserStatus";

export interface IAdminUser {
  id: string;
  displayName: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string | null;
  status: AdminUserStatus;
  active?: boolean;
  validationStatus: AdminUserValidationStatus;
  validated?: boolean;
  role?: string;
  organization?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}
