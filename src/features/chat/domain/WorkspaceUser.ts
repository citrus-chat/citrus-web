export interface WorkspaceUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role?: string;
  status?: "online" | "offline" | "away";
  avatar?: string;
  timezone?: string;
  phoneNumber?: string;
  bio?: string;
  managerId?: string;
  department?: string;
  isCurrentUser?: boolean;
}
