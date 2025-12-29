import {defineStore} from "pinia";
import type {UserProfileDto} from "@/types/auth";
import type {UserUpdateRequest} from "@/types/users";
import {useAuthStore} from "./auth";
import {watch} from "vue";
import {useNotification} from "@/services/useNotification";
import {debounce} from "lodash-es";

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
                const authStore = useAuthStore();
                this.user = authStore.currentUser;
            } catch (error) {
                const {useI18n} = await import("@/composables/useI18n");
                const {t} = useI18n();
                this.error =
                    error instanceof Error
                        ? error.message
                        : t("errorFetchingUserData");
            } finally {
                this.isLoading = false;
            }
        },

        reset() {
            this.user = null;
            this.isLoading = false;
            this.error = null;
        },


    },
});

export function useUserWatcher() {
    const userStore = useUserStore();
    const authStore = useAuthStore();

    const debouncedFetchUser = debounce(() => {
        if (authStore.isAuthenticated) {
            userStore.fetchUser();
        }
    }, 300);

    watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
            if (isAuthenticated) {
                debouncedFetchUser();
            } else {
                debouncedFetchUser.cancel();
                userStore.reset();
            }
        },
        {immediate: true},
    );
}
