import { defineStore } from "pinia";
import { useNotification } from "@/services/useNotification";
import { authAPI } from "@/utils/api/auth";
import type { UserProfileDto, AuthResponse, AuthUser } from "@/types/auth";

interface AuthState {
  user: UserProfileDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  // Legacy fields for compatibility during migration
  token: string | null;
  userPermissions: Record<string, boolean>[];
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    // Legacy fields for compatibility
    token: null,
    userPermissions: [],
  }),

  getters: {
    currentToken: (state) => state.accessToken || state.token, // Support both new and legacy
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || '',
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isVerified: (state) => state.user?.verified || false,
    userBalance: (state) => state.user?.balance || 0,
    // Legacy getters for compatibility
    userRoles: (state) => state.user?.role ? [{ 
      id: '1', 
      name: state.user.role, 
      display_name: state.user.role, 
      weight: 1, 
      permissions: [], 
      created_at: state.user.createdAt, 
      updated_at: state.user.createdAt 
    }] : [],
    isSuperuser: (state) => state.user?.role === 'ADMIN',
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

        this.checkAuthCode();
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
    setToken(token: string) {
      this.accessToken = token;
      this.token = token;
      localStorage.setItem("access_token", token);
      // Also keep cookie for backward compatibility during migration
      document.cookie = `access_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}`;
    },

    clearTokens() {
      this.accessToken = null;
      this.refreshToken = null;
      this.token = null;
      
      // Clear from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_id");
      
      // Clear legacy cookie
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    },

    // Legacy method for compatibility
    clearToken() {
      this.clearTokens();
    },

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
      const { show } = useNotification();

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
          
          show("Successful authentication!", {
            type: "info",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Discord callback error:", error);
        show("Authentication error. Please try again.", {
          type: "error",
          duration: 5000,
        });
        throw error;
      }
    },

    async checkAuthCode() {
      // Only process auth code if we're not in the callback view
      // to avoid duplicate processing
      if (window.location.pathname === '/auth/callback') {
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

    async refreshUser() {
      try {
        const user = await authAPI.getCurrentUser();
        this.user = user;
        this.isAuthenticated = !!user;

        // Note: User permissions are now part of the role system in the new API
        // Will be handled in the admin/user management system update
      } catch (error) {
        console.error("Error refreshing user:", error);
        this.user = null;
        this.isAuthenticated = false;
        this.userPermissions = [];
      }
    },

    clearAuth() {
      this.user = null;
      this.isAuthenticated = false;
      this.error = null;
      this.userPermissions = [];
    },

    hasPermission(permission: string): boolean {
      // Admin has all permissions in the new system
      if (this.user?.role === 'ADMIN') return true;

      // For now, we'll implement basic role-based permissions
      // This can be expanded based on the specific role system you implement
      const rolePermissions: Record<string, string[]> = {
        'ADMIN': ['*'], // All permissions
        'MODERATOR': ['user.ban', 'user.mute', 'user.kick', 'user.warn'],
        'USER': ['profile.edit', 'shop.purchase'],
      };

      const userPermissions = rolePermissions[this.user?.role || 'USER'] || [];
      return userPermissions.includes('*') || userPermissions.includes(permission);
    },

    hasAnyPermission(permissions: string[]): boolean {
      return permissions.some((permission) => this.hasPermission(permission));
    },

    hasPermissions(permissions: string[]): boolean {
      return permissions.every((permission) => this.hasPermission(permission));
    },

    async openDiscordAuth() {
      const { show } = useNotification();
      this.isLoading = true;
      this.error = null;

      try {
        const url = await authAPI.getDiscordLoginUrl();

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
            "Спливаюче вікно заблоковано. Будь ласка, дозвольте спливаючі вікна для цього сайту.",
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
              show("Успішна авторизація!", {
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
                  show("Успішна авторизація!", {
                    type: "info",
                    duration: 3000,
                  });
                } else {
                  show("Авторизація була скасована", {
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
            show("Час очікування авторизації вийшов. Спробуйте ще раз.", {
              type: "warn",
              duration: 5000,
            });
          }
        }, 300000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Невідома помилка";
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
      const { show } = useNotification();
      this.isLoading = true;
      this.error = null;

      try {
        // Call the new logout endpoint if we have a token
        if (this.accessToken) {
          await authAPI.logout();
        }
        
        this.clearAuth();
        this.clearTokens();
        
        show("Successfully logged out", {
          type: "info",
          duration: 3000,
        });
      } catch (error) {
        console.error("Logout error:", error);
        // Even if the API call fails, clear local tokens
        this.clearAuth();
        this.clearTokens();
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
