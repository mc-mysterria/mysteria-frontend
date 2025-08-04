// New auth types based on api-docs.json
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

export interface VerificationCodeDto {
  code: string;
  expiresAt: string;
}

export interface UpdateProfileDto {
  nickname?: string;
  lang?: string;
}

// Legacy interface for compatibility (will be removed in cleanup)
export interface AuthUser {
  id: string;
  discord_id: string;
  nickname?: string; // New API property
  minecraftUuid?: string; // New API property
  is_active: boolean;
  role?: string; // New API property
  verified?: boolean; // New API property
  balance?: number; // New API property
  lang?: string; // New API property
  email?: string; // New API property
  created_at: string;
  updated_at: string;
  roles?: AuthRole[];
  biography?: string;
  permissions?: { [key: string]: boolean };
}

export interface AuthRole {
  id: string;
  name: string;
  display_name?: string;
  weight: number;
  permissions: Array<{ [key: string]: boolean }>;
  created_at: string;
  updated_at: string;
}

export interface DiscordLoginResponse {
  url: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: AuthUser;
}
