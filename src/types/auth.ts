export interface UserProfileDto {
    id: string;
    discordId: number;
    minecraftUuid?: string;
    nickname?: string;
    email?: string;
    role: string;
    balance: number;
    lang: string;
    firstJoinAt?: string;
    createdAt: string;
    verified: boolean;
    avatarUrl?: string;
    permissions?: string[]; // User permissions from backend (e.g., ['NEWS:MANAGE', 'COUNSEL:MANAGE'])
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    role: string;
}

export interface DiscordCallbackRequest {
    code: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

