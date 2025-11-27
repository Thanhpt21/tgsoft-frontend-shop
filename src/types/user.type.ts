import { UserTag } from "@/enums/user.enums"

export interface Role {
  id: number
  name: string
  description?: string
}

export interface UserTenantRole {
  tenantId: number
  role: Role
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string; // global role, ví dụ 'admin', 'user'
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  avatar?: string | null;
  isActive: boolean;
  type_account: 'normal' | 'google' | 'facebook' | string;
  tenantId?: number | null; // ✅ thêm để đồng bộ backend
  createdAt: string;
  updatedAt: string;
  conversationId?: number;
  chatConversations?: { id: number }[]; // Thêm chatConversations ở đây
  userTenantRoles?: UserTenantRole[];
  chatEnabled: boolean; // Thêm field chatEnabled
  tag?: UserTag  | null;
}
export interface LoginResponse {
  user: User
  access_token: string
}
