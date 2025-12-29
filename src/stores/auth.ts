import {defineStore} from "pinia";
import {useNotification} from "@/services/useNotification";
import {authAPI} from "@/utils/api/auth";
import type {AuthResponse, UserProfileDto} from "@/types/auth";
import {useI18n} from "@/composables/useI18n";

interface AuthState {
    user: UserProfileDto | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    token: string | null;
    lastUserFetch: number;
    userCacheTimeout: number;
}

export const useAuthStore = defineStore("auth", {
    state: (): AuthState => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
        token: null,
        lastUserFetch: 0,
        userCacheTimeout: 5 * 60 * 1000, // 5 minutes cache
    }),

    getters: {
        currentToken: (state) => state.accessToken || state.token, // Support both new and legacy
        currentUser: (state) => state.user,
        userRole: (state) => state.user?.role || "",
        userPermissions: (state) => state.user?.permissions || [],
        isAdmin: (state) => state.user?.role === "OWNER",
        isPrivilegedUser: (state) => {
            const role = state.user?.role?.toUpperCase();
            return role === "OWNER" || role === "LEADER";
        },
        isVerified: (state) => state.user?.verified || false,
        userBalance: (state) => state.user?.balance || 0,
        // Legacy getters for compatibility
        userRoles: (state) =>
            state.user?.role
                ? [
                    {
                        id: "1",
                        name: state.user.role,
                        display_name: state.user.role,
                        weight: 1,
                        permissions: state.user.permissions || [],
                        created_at: state.user.createdAt,
                        updated_at: state.user.createdAt,
                    },
                ]
                : [],
        isSuperuser: (state) => state.user?.role === "ADMIN",
    },

    actions: {
        async init() {
            this.isLoading = true;
            try {
                // Try to get tokens from localStorage (new JWT system)
                this.accessToken = localStorage.getItem("access_token");
                this.refreshToken = localStorage.getItem("refresh_token");

                // Legacy support: also check cookies
                if (!this.accessToken) {
                    this.accessToken = this.getCookie("access_token");
                    this.token = this.accessToken; // For legacy compatibility
                }

                if (this.accessToken) {
                    // Try to get current user profile
                    const user = await authAPI.getCurrentUser();
                    if (user) {
                        this.user = user;
                        this.isAuthenticated = true;
                    } else {
                        // Token might be expired, try to refresh
                        await this.tryRefreshToken();
                    }
                } else {
                    this.isAuthenticated = false;
                    this.user = null;
                }

                await this.checkAuthCode();
            } catch (error) {
                console.error("Auth init error:", error);
                this.isAuthenticated = false;
                this.user = null;
            } finally {
                this.isLoading = false;
            }
        },

        getCookie(name: string): string | null {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
            return null;
        },

        setTokens(authResponse: AuthResponse) {
            this.accessToken = authResponse.accessToken;
            this.refreshToken = authResponse.refreshToken;
            this.token = authResponse.accessToken; // Legacy compatibility

            // Store in localStorage for persistence
            localStorage.setItem("access_token", authResponse.accessToken);
            localStorage.setItem("refresh_token", authResponse.refreshToken);
            localStorage.setItem("user_id", authResponse.userId);
        },

        // Legacy method for compatibility
        clearTokens() {
            this.accessToken = null;
            this.refreshToken = null;
            this.token = null;

            // Clear from localStorage
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user_id");

            // Clear legacy cookie
            document.cookie =
                "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        },

        // Legacy method for compatibility
        async tryRefreshToken(): Promise<boolean> {
            if (!this.refreshToken) {
                return false;
            }

            try {
                const authResponse = await authAPI.refreshToken(this.refreshToken);
                this.setTokens(authResponse);

                // Get updated user profile
                const user = await authAPI.getCurrentUser();
                if (user) {
                    this.user = user;
                    this.isAuthenticated = true;
                    return true;
                }
            } catch (error) {
                console.error("Token refresh failed:", error);
                this.clearTokens();
                this.clearAuth();
            }

            return false;
        },

        async processDiscordCallback(code: string): Promise<void> {
            const {show} = useNotification();
            const {t} = useI18n();

            try {
                // Use new JWT-based Discord callback
                const authResponse = await authAPI.discordCallback(code);

                // Store the tokens
                this.setTokens(authResponse);

                // Get user profile
                const user = await authAPI.getCurrentUser();
                if (user) {
                    this.user = user;
                    this.isAuthenticated = true;

                    show(t("authCallback.authSuccess"), {
                        type: "info",
                        duration: 3000,
                    });
                }
            } catch (error) {
                console.error("Discord callback error:", error);
                show(t("authCallback.authenticationFailed"), {
                    type: "error",
                    duration: 5000,
                });
                throw error;
            }
        },

        async checkAuthCode() {
            // Only process auth code if we're not in the callback view
            // to avoid duplicate processing
            if (window.location.pathname === "/auth/callback") {
                return;
            }

            const currentUrl = window.location.href;
            if (currentUrl.includes("code=")) {
                const url = new URL(currentUrl);
                const code = url.searchParams.get("code");
                if (code) {
                    try {
                        await this.processDiscordCallback(code);

                        // Clean up URL
                        const newUrl = window.location.pathname + window.location.hash;
                        window.history.replaceState({}, document.title, newUrl);
                    } catch (error) {
                        console.error("Auth callback error:", error);
                    }
                }
            }
        },

        async refreshUser(forceRefresh: boolean = false) {
            // Check cache first unless force refresh is requested
            const now = Date.now();
            if (!forceRefresh && this.user && (now - this.lastUserFetch) < this.userCacheTimeout) {
                return; // Use cached data
            }

            try {
                const user = await authAPI.getCurrentUser();
                this.user = user;
                this.isAuthenticated = !!user;
                this.lastUserFetch = now;
            } catch (error) {
                console.error("Error refreshing user:", error);
                this.user = null;
                this.isAuthenticated = false;
                this.lastUserFetch = 0; // Reset cache on error
            }
        },

        clearAuth() {
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
            this.lastUserFetch = 0; // Reset cache timestamp
        },

        hasPermission(permission: string): boolean {
            if (!this.user) return false;

            // Normalize both the permission being checked and user's permissions
            // Backend may return with or without PERM_ prefix
            const normalizedPermission = permission.replace(/^PERM_/, '');
            const userPermissions = (this.user.permissions || []).map(p => p.replace(/^PERM_/, ''));

            return userPermissions.includes(normalizedPermission);
        },

        hasAnyPermission(permissions: string[]): boolean {
            return permissions.some((permission) => this.hasPermission(permission));
        },

        hasPermissions(permissions: string[]): boolean {
            return permissions.every((permission) => this.hasPermission(permission));
        },

        // Generate archive-specific permissions based on user role
        getArchivePermissions(): string[] {
            if (!this.user) return [];

            const role = this.user.role?.toUpperCase();

            switch (role) {
                case "ADMIN":
                case "OWNER":
                    return ["PERM_ARCHIVE:READ", "PERM_ARCHIVE:WRITE", "PERM_ARCHIVE:DELETE", "PERM_ARCHIVE:MODERATE"];
                case "MODERATOR":
                case "LEADER":
                    return ["PERM_ARCHIVE:READ", "PERM_ARCHIVE:WRITE", "PERM_ARCHIVE:MODERATE"];
                case "PLAYER":
                    return ["PERM_ARCHIVE:READ", "PERM_ARCHIVE:WRITE"];
                case "USER":
                default:
                    return ["PERM_ARCHIVE:READ"];
            }
        },

        // Get user information formatted for JWT token cross-domain sharing
        // Force refresh user data bypassing cache
        async openDiscordAuth(redirectUrl?: string) {
            const {show} = useNotification();
            const {t} = useI18n();
            this.isLoading = true;
            this.error = null;

            try {
                const url = await authAPI.getDiscordLoginUrl(redirectUrl);

                const isMobile =
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                        navigator.userAgent,
                    );

                if (isMobile) {
                    window.location.href = url;
                    return;
                }

                const authWindow = window.open(
                    url,
                    "Discord Login",
                    `width=600,height=700,top=${(window.screen.height - 700) / 2},left=${(window.screen.width - 600) / 2},scrollbars=yes`,
                );

                if (!authWindow) {
                    show(
                        t("popupBlocked"),
                        {
                            type: "error",
                            duration: 7000,
                        },
                    );
                    return;
                }

                const messageHandler = async (event: MessageEvent) => {
                    console.log(
                        "Received message:",
                        event.data,
                        "from origin:",
                        event.origin,
                    );

                    if (event.origin !== window.location.origin) {
                        console.log("Message from wrong origin, ignoring");
                        return;
                    }

                    if (event.data?.type === "AUTH_SUCCESS") {
                        console.log("Auth success message received, refreshing user...");
                        window.removeEventListener("message", messageHandler);
                        clearInterval(checkInterval);

                        await this.refreshUser();

                        console.log("User refreshed, authenticated:", this.isAuthenticated);

                        if (this.isAuthenticated) {
                            show(t("authCallback.authSuccess"), {
                                type: "info",
                                duration: 3000,
                            });
                        }
                    }
                };

                window.addEventListener("message", messageHandler);

                const checkInterval = setInterval(async () => {
                    try {
                        if (authWindow.closed) {
                            clearInterval(checkInterval);
                            window.removeEventListener("message", messageHandler);

                            setTimeout(async () => {
                                await this.refreshUser();

                                if (this.isAuthenticated) {
                                    show(t("authCallback.authSuccess"), {
                                        type: "info",
                                        duration: 3000,
                                    });
                                } else {
                                    show(t("authCallback.authCancelled"), {
                                        type: "warn",
                                        duration: 3000,
                                    });
                                }
                            }, 1000);
                            return;
                        }
                    } catch (error) {
                        console.error("Auth window check error:", error);
                    }
                }, 1000);

                setTimeout(() => {
                    window.removeEventListener("message", messageHandler);
                    clearInterval(checkInterval);
                    if (!authWindow.closed) {
                        authWindow.close();
                        show(t("authCallback.authTimeout"), {
                            type: "warn",
                            duration: 5000,
                        });
                    }
                }, 300000);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : t("unknownError");
                show(errorMessage, {
                    type: "error",
                    duration: 5000,
                });
                this.error = errorMessage;
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            const {show} = useNotification();
            const {t} = useI18n();
            this.isLoading = true;
            this.error = null;

            try {
                // Call the new logout endpoint if we have a token
                if (this.accessToken) {
                    await authAPI.logout();
                }

                this.clearAuth();
                this.clearTokens();

                show(t("authCallback.logoutSuccess"), {
                    type: "info",
                    duration: 3000,
                });
            } catch (error) {
                console.error("Logout error:", error);
                // Even if the API call fails, clear local tokens
                this.clearAuth();
                this.clearTokens();

                const errorMessage =
                    error instanceof Error ? error.message : t("unknownError");
                show(errorMessage, {
                    type: "error",
                    duration: 5000,
                });
                this.error = errorMessage;
            } finally {
                this.isLoading = false;
            }
        },
    },
});
