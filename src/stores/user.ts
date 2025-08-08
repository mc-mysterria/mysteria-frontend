import { defineStore } from "pinia";
import type { UserProfileDto } from "@/types/auth";
import type { UserUpdateRequest } from "@/types/users";
import { useAuthStore } from "./auth";
import { watch } from "vue";
import { useNotification } from "@/services/useNotification";

interface UserState {
  user: UserProfileDto | null;
  isLoading: boolean;
  error: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isUserLoading: (state) => state.isLoading,
    userError: (state) => state.error,
    currentDiscordUser: (state) => state.user,
  },

  actions: {
    async fetchUser() {
      this.isLoading = true;
      this.error = null;

      try {
        // Use auth store instead of legacy user API since the new API uses /api/user/profile
        const authStore = useAuthStore();
        const userResponse = await authStore.refreshUser();
        this.user = authStore.currentUser;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Помилка при отриманні даних користувача";
      } finally {
        this.isLoading = false;
      }
    },

    reset() {
      this.user = null;
      this.isLoading = false;
      this.error = null;
    },

    async updateProfile(data: UserUpdateRequest) {
      try {
        if (!this.user?.id) throw new Error("Користувач не знайдений");

        // Use auth API instead of legacy user API since new API uses /api/user/profile
        const { authAPI } = await import("@/utils/api/auth");
        const updateData = {
          nickname: data.nickname,
          lang: data.lang || "uk",
        };

        const updatedUser = await authAPI.updateUserProfile(updateData);

        // Update local user data
        if (this.user) {
          this.user = { ...this.user, ...updatedUser };
        }
      } catch (error: unknown) {
        const { show } = useNotification();

        if (error instanceof Error && error.message.includes("400")) {
          show("Дані профілю некоректні", { type: "error" });
        } else if (error instanceof Error && error.message.includes("403")) {
          show("Недостатньо прав для оновлення профілю", { type: "error" });
        } else if (error instanceof Error && error.message.includes("404")) {
          show("Користувач не знайдений", { type: "error" });
        } else {
          show("Помилка при оновленні профілю", { type: "error" });
        }
        throw error;
      }
    },

    async updateNickname(nickname: string) {
      return this.updateProfile({ nickname });
    },

    // Biography feature removed - not supported by new API
  },
});

export function useUserWatcher() {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        userStore.fetchUser();
      } else {
        userStore.reset();
      }
    },
    { immediate: true },
  );
}
