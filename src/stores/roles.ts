import {defineStore} from "pinia";
import {ref} from "vue";

export const useRoleStore = defineStore("role", () => {
    const isLoading = ref(false);

    // Basic role hierarchy for display purposes
    const roleHierarchy = [
        {name: "admin", displayName: "Owner", weight: 100},
        {name: "leader", displayName: "Leader", weight: 90},
        {name: "moderator", displayName: "Moderator", weight: 80},
        {name: "shepherd", displayName: "Shepherd", weight: 60},
        {name: "radiant", displayName: "Radiant", weight: 50},
        {name: "player", displayName: "Player", weight: 10},
        {name: "member", displayName: "Default", weight: 0},
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
