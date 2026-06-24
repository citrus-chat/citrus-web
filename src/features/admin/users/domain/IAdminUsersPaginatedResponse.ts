import type { IAdminUser } from "./IAdminUser";
import type { IPaginationMeta } from "./IPaginationMeta";

export interface IAdminUsersPaginatedResponse {
  items: IAdminUser[];
  meta: IPaginationMeta;
}
