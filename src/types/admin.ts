export interface ChangeUserRoleRequest {
    roleName: string;
}

export interface AdjustBalanceRequest {
    amount: number;
    reason: string;
}

export interface TransactionDto {
    id: string;
    userId: string;
    amount: number;
    type: string;
    description: string;
    timestamp: string;
    balanceAfter: number;
}

export interface ChangeUserRoleResponse {
    userId: string;
    previousRole: string;
    newRole: string;
    changedAt: string;
}

// User management types

export type UserRole = 'USER' | 'PLAYER' | 'MODERATOR' | 'LEADER' | 'ADMIN' | 'OWNER';

export const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
    {value: 'USER', label: 'User', description: 'Basic user with limited permissions'},
    {value: 'PLAYER', label: 'Player', description: 'Verified player with game access'},
    {value: 'MODERATOR', label: 'Moderator', description: 'Can moderate users and content'},
    {value: 'LEADER', label: 'Leader', description: 'Team leader with elevated permissions'},
    {value: 'ADMIN', label: 'Admin', description: 'Administrator with full permissions'},
    {value: 'OWNER', label: 'Owner', description: 'Server owner with all permissions'},
];
