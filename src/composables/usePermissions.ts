import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import {
  PERM_NEWS_MANAGE,
  PERM_COUNSEL_MANAGE,
  PERM_SHOP_MANAGE,
  PERM_ADMIN,
  PERM_USERS_VIEW,
  canAccessAdminPanel,
  canManageContent,
} from '@/constants/permissions';

/**
 * Composable for checking user permissions
 * Uses the permissions from the backend API
 */
export function usePermissions() {
  const authStore = useAuthStore();

  // Get user permissions from auth store
  const permissions = computed(() => authStore.userPermissions);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return authStore.hasAnyPermission(permissionList);
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return authStore.hasPermissions(permissionList);
  };

  // Specific permission checks for common use cases
  const canManageNews = computed(() => hasPermission(PERM_NEWS_MANAGE));
  const canManageCounsel = computed(() => hasPermission(PERM_COUNSEL_MANAGE));
  const canManageShop = computed(() => hasPermission(PERM_SHOP_MANAGE));

  // Admin panel access - must match route requirements
  const canAccessAdmin = computed(() =>
    hasPermission(PERM_ADMIN) || hasPermission(PERM_USERS_VIEW)
  );

  // Helper for checking if user can manage any content
  const canEditAnyContent = computed(() =>
    canManageContent(permissions.value)
  );

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageNews,
    canManageCounsel,
    canManageShop,
    canAccessAdmin,
    canEditAnyContent,
  };
}
