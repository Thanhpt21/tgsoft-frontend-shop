import { Role } from "./role.type";
import { User } from "./user.type";

export interface UserRoleInfo {
  user: User;
  role: Role;
}

// Response type
export interface UserTenantResponse {
  success: boolean;
  message: string;
  data: UserRoleInfo[];
}