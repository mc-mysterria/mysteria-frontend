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

    async getDiscordLoginUrl(redirectUrl?: string): Promise<string> {
        const params = new URLSearchParams();
        if (redirectUrl) params.set("redirect", redirectUrl);
        const query = params.size ? `?${params}` : "";

        const response = await this.request<{ url: string }>(
            "GET",
            `/api/auth/discord/login${query}`,
            {suppressAuthRequired: true},
            "",
        );
        return response.data.url;
    }
}

export const authAPI = new AuthAPI();
