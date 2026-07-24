import { defineStore } from 'pinia';
import { watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBalanceStore } from '@/stores/balance';

interface DailyBonusStatus {
    available: boolean;
    nextAvailableAt: string | null;
    pointsReward: number;
}

interface DailyBonusClaimResult {
    success: boolean;
    alreadyClaimed: boolean;
    pointsAwarded: number;
    nextAvailableAt: string | null;
    message: string;
}

interface DailyBonusState {
    status: DailyBonusStatus | null;
    isLoading: boolean;
    randomPage: string | null;
}

const PAGES = ['home', 'shop', 'rules', 'profile'];

export const useDailyBonusStore = defineStore('dailyBonus', {
    state: (): DailyBonusState => ({
        status: null,
        isLoading: false,
        randomPage: null,
    }),

    getters: {
        isAvailable: (state) => state.status?.available ?? false,
    },

    actions: {
        async fetchStatus() {
            const authStore = useAuthStore();
            if (!authStore.accessToken) return;

            this.isLoading = true;
            try {
                const response = await fetch('/api/bonus/daily/status', {
                    headers: { Authorization: `Bearer ${authStore.accessToken}` },
                });
                if (!response.ok) return;
                const data: DailyBonusStatus = await response.json();
                this.status = data;
                if (data.available) {
                    this.randomPage = PAGES[Math.floor(Math.random() * PAGES.length)];
                } else {
                    this.randomPage = null;
                }
            } catch {
                // silently fail – bonus is non-critical
            } finally {
                this.isLoading = false;
            }
        },

        async claim(): Promise<DailyBonusClaimResult> {
            const authStore = useAuthStore();
            if (!authStore.accessToken) {
                return { success: false, alreadyClaimed: false, pointsAwarded: 0, nextAvailableAt: null, message: '' };
            }

            try {
                const response = await fetch('/api/bonus/daily/claim', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${authStore.accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data: DailyBonusClaimResult = await response.json();

                if (data.success) {
                    if (this.status) this.status.available = false;
                    this.randomPage = null;
                    const balanceStore = useBalanceStore();
                    await balanceStore.fetchBalance();
                }

                return data;
            } catch {
                return { success: false, alreadyClaimed: false, pointsAwarded: 0, nextAvailableAt: null, message: '' };
            }
        },

        reset() {
            this.status = null;
            this.randomPage = null;
        },
    },
});

export function useDailyBonusWatcher() {
    const bonusStore = useDailyBonusStore();
    const authStore = useAuthStore();

    watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
            if (isAuthenticated) {
                bonusStore.fetchStatus();
            } else {
                bonusStore.reset();
            }
        },
        { immediate: true },
    );
}
