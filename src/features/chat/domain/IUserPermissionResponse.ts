export interface IUserPermissionResponse {
  permissions: {
    permissionId: string;
    code: string;
    description: string;
  }[];
}
