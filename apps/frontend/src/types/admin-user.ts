export type AdminUserRole = 'ADMIN' | 'VENDEDOR';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  is_active: boolean;
  created_at: string;
}