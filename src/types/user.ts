// src/types/user.ts
export interface UserPermissions {
  can_create: boolean;
  can_read: boolean;
  can_view: boolean;
  can_update: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_provision: boolean;
}

export interface User {
  id: number;
  user_id: string; 
  name: string;
  email: string;
  role_id: number;
  unit_id: number | null;
  status: string;
  role_name?: string;
  unit_name?: string;
  permissions?: UserPermissions;
}
