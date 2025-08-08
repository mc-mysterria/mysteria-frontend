import { defineStore } from "pinia";
import { ref } from "vue";

// Simplified role store for basic role management
// Current API only supports role as a string field in user profiles
export const useRoleStore = defineStore("role", () => {
  const isLoading = ref(false);

  // Basic role hierarchy for display purposes
  const roleHierarchy = [
    { name: "owner", displayName: "Owner", weight: 100 },
    { name: "admin", displayName: "Administrator", weight: 90 },
    { name: "moderator", displayName: "Moderator", weight: 80 },
    { name: "helper", displayName: "Helper", weight: 70 },
    { name: "vip", displayName: "VIP", weight: 60 },
    { name: "premium", displayName: "Premium", weight: 50 },
    { name: "player", displayName: "Player", weight: 10 },
    { name: "default", displayName: "Default", weight: 0 },
  ];

  const getRoleDisplayName = (roleName: string): string => {
    const role = roleHierarchy.find((r) => r.name === roleName);
    return role?.displayName || roleName;
  };

  const getRoleWeight = (roleName: string): number => {
    const role = roleHierarchy.find((r) => r.name === roleName);
    return role?.weight || 0;
  };

  const canModerate = (userRole: string, targetRole: string): boolean => {
    return getRoleWeight(userRole) > getRoleWeight(targetRole);
  };

  return {
    // State
    isLoading,
    roleHierarchy,

    // Actions
    getRoleDisplayName,
    getRoleWeight,
    canModerate,
  };
});
