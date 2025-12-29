/**
 * Permission constants based on backend API
 * These match the permissions returned in /api/user/profile
 */

// Admin Permissions
export const PERM_ADMIN = 'ADMIN';

// User Management Permissions
export const PERM_USERS_VIEW = 'USERS:VIEW';
export const PERM_USERS_BAN = 'USERS:BAN';
export const PERM_USERS_ROLE = 'USERS:ROLE';
export const PERM_USERS_BALANCE = 'USERS:BALANCE';
export const PERM_USERS_WARN = 'USERS:WARN';

// Shop Management Permissions
export const PERM_SHOP_PURCHASE = 'SHOP:PURCHASE';
export const PERM_SHOP_MANAGE = 'SHOP:MANAGE';

// Content Management Permissions
export const PERM_NEWS_MANAGE = 'NEWS:MANAGE';
export const PERM_COUNSEL_MANAGE = 'COUNSEL:MANAGE';

// Internal API Permissions
export const PERM_INTERNAL = 'INTERNAL';

/**
 * Permission groups for easier checking
 */
export const PERMISSION_GROUPS = {
  // Admin-related permissions
  ADMIN: [PERM_ADMIN],

  // User management permissions
  USER_MANAGEMENT: [
    PERM_USERS_VIEW,
    PERM_USERS_BAN,
    PERM_USERS_ROLE,
    PERM_USERS_BALANCE,
    PERM_USERS_WARN,
  ],

  // Content management permissions
  CONTENT_MANAGEMENT: [
    PERM_NEWS_MANAGE,
    PERM_COUNSEL_MANAGE,
  ],

  // Shop permissions
  SHOP: [
    PERM_SHOP_PURCHASE,
    PERM_SHOP_MANAGE,
  ],
};

/**
 * Helper to check if a user has access to admin panel
 */
export const canAccessAdminPanel = (permissions: string[]): boolean => {
  // Normalize permissions by removing PERM_ prefix if present
  const normalizedPermissions = permissions.map(p => p.replace(/^PERM_/, ''));

  return normalizedPermissions.some(p =>
    PERMISSION_GROUPS.ADMIN.includes(p) ||
    PERMISSION_GROUPS.USER_MANAGEMENT.includes(p)
  );
};

/**
 * Helper to check if a user can manage content (news, counsel, services)
 */
export const canManageContent = (permissions: string[]): boolean => {
  // Normalize permissions by removing PERM_ prefix if present
  const normalizedPermissions = permissions.map(p => p.replace(/^PERM_/, ''));

  return normalizedPermissions.some(p =>
    PERMISSION_GROUPS.CONTENT_MANAGEMENT.includes(p) ||
    p === PERM_SHOP_MANAGE
  );
};
