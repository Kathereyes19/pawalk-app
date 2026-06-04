export type UserRole = 'user' | 'admin';

export const DEFAULT_USER_ROLE: UserRole = 'user';

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin';
}
