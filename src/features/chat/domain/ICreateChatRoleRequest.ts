export interface ICreateChatRoleRequest {
  name: string;
  priority: number;
  permissionIds: string[];
}
