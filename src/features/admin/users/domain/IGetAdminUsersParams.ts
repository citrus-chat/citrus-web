export interface IGetAdminUsersParams {
  /** Zero-based page index expected by the backend. */
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  direction?: "asc" | "desc";
}
