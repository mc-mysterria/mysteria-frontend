import {BaseCRUD} from "./base";
import type {AuthResponse, DiscordCallbackRequest, RefreshTokenRequest, UserProfileDto} from "@/types/auth";

export class AuthAPI extends BaseCRUD<UserProfileDto, never, never, never> {
    constructor() {
        super("", false); // No prefix, we'll use full paths
    }

    async discordCallback(code: string): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>(
            "POST",
            "/api/auth/discord/callback",
            {
                body: {code} as DiscordCallbackRequest,
            },
            "",
        );
        return response.data;
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>(
            "POST",
            "/api/auth/refresh",
            {
                body: {refreshToken} as RefreshTokenRequest,
            },
            "",
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
                {suppressAuthRequired: true},
                "",
            );
            return response.data;
        } catch (error) {
            console.error("Error getting current user:", error);
            return null;
        }
    }

    async updateUserProfile(data: {
        nickname?: string;
        lang?: string;
    }): Promise<UserProfileDto> {
        const response = await this.request<UserProfileDto>(
            "PUT",
            "/api/user/profile",
            {body: data},
            "",
        );
        return response.data;
    }

    // Legacy method for compatibility during migration
    async getDiscordLoginUrl(redirectUrl?: string): Promise<string> {
        // Get Discord Client ID from environment
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

        if (!clientId) {
            throw new Error(
                "Discord Client ID not configured. Please set VITE_DISCORD_CLIENT_ID in your .env.local file.",
            );
        }

        // Use exact registered redirect URI without query parameters
        const callbackUrl = `${window.location.origin}/auth/callback`;
        const redirectUri = encodeURIComponent(callbackUrl);
        const scope = encodeURIComponent("identify email guilds");

        // Use Discord's state parameter to pass redirect URL
        let authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

        if (redirectUrl) {
            const state = encodeURIComponent(JSON.stringify({redirect: redirectUrl}));
            authUrl += `&state=${state}`;
        }

        return authUrl;
    }
}

export const authAPI = new AuthAPI();
