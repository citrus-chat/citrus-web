export interface IPaginationMeta {
  /** Zero-based page index, matching the backend contract. */
  currentPage: number;
  perPage: number;
  total: number;
  /** Zero-based last page index, matching the backend contract. */
  lastPage: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
