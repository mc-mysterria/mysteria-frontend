import { BaseCRUD } from "./base";
import type {
  UserProfileDto,
  AuthResponse,
  DiscordCallbackRequest,
  RefreshTokenRequest,
  AuthUser,  // Legacy type for compatibility
  AuthStatus  // Legacy type for compatibility
} from "@/types/auth";

export class AuthAPI extends BaseCRUD<UserProfileDto, never, never, never> {
  constructor() {
    super("", false); // No prefix, we'll use full paths
  }

  // New JWT-based authentication methods
  async discordCallback(code: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "POST",
      "/api/auth/discord/callback",
      {
        body: { code } as DiscordCallbackRequest
      },
      ""
    );
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "POST",
      "/api/auth/refresh",
      {
        body: { refreshToken } as RefreshTokenRequest
      },
      ""
    );
    return response.data;
  }

  async logout(): Promise<void> {
    await this.request<void>("DELETE", "/api/auth/logout", {}, "");
  }

  async getCurrentUser(): Promise<UserProfileDto | null> {
    try {
      const response = await this.request<UserProfileDto>(
        "GET",
        "/api/user/profile",
        { suppressAuthRequired: true },
        ""
      );
      return response.data;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async updateUserProfile(data: { nickname?: string; lang?: string }): Promise<UserProfileDto> {
    const response = await this.request<UserProfileDto>(
      "PUT",
      "/api/user/profile",
      { body: data },
      ""
    );
    return response.data;
  }

  // Legacy method for compatibility during migration
  async getDiscordLoginUrl(): Promise<string> {
    // Get Discord Client ID from environment
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

    if (!clientId) {
      throw new Error("Discord Client ID not configured. Please set VITE_DISCORD_CLIENT_ID in your .env.local file.");
    }

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
    const scope = encodeURIComponent("identify email guilds");

    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  }

  // Legacy method for compatibility during migration
  async checkAuthStatus(): Promise<AuthStatus> {
    try {
      const user = await this.getCurrentUser();
      // Convert new UserProfileDto to legacy AuthUser format
      const legacyUser: AuthUser | undefined = user ? {
        id: user.id,
        discord_id: user.discordId.toString(),
        nickname: user.nickname,
        is_active: true,
        created_at: user.createdAt,
        updated_at: user.createdAt, // New API doesn't have updated_at
        roles: user.role ? [{
          id: '1',
          name: user.role,
          display_name: user.role,
          weight: 1,
          permissions: [],
          created_at: user.createdAt,
          updated_at: user.createdAt
        }] : undefined,
        permissions: {}
      } : undefined;

      return {
        authenticated: !!user,
        user: legacyUser,
      };
    } catch (error) {
      console.error("Error checking auth status:", error);
      return { authenticated: false };
    }
  }
}

export const authAPI = new AuthAPI();
