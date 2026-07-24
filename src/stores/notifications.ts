import {defineStore} from 'pinia';
import {watch} from 'vue';
import {useAuthStore} from '@/stores/auth';
import type {NotificationDto} from '@/types/notifications';
import type {Page} from '@/types/base';

const POLL_INTERVAL_MS = 45000;

interface AccountNotificationsState {
    items: NotificationDto[];
    unreadCount: number;
    page: number;
    totalPages: number;
    totalElements: number;
    isLoading: boolean;
}

export const useAccountNotificationsStore = defineStore('accountNotifications', {
    state: (): AccountNotificationsState => ({
        items: [],
        unreadCount: 0,
        page: 0,
        totalPages: 0,
        totalElements: 0,
        isLoading: false,
    }),

    actions: {
        async fetchUnreadCount() {
            const authStore = useAuthStore();
            if (!authStore.accessToken) return;

            try {
                const response = await fetch('/api/notifications/unread-count', {
                    headers: {Authorization: `Bearer ${authStore.accessToken}`},
                });
                if (!response.ok) return;
                this.unreadCount = await response.json();
            } catch {
                // silently fail – badge is non-critical
            }
        },

        async fetchPage(page = 0, size = 20) {
            const authStore = useAuthStore();
            if (!authStore.accessToken) return;

            this.isLoading = true;
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    size: size.toString(),
                    sort: 'createdAt,desc',
                });
                const response = await fetch(`/api/notifications?${params}`, {
                    headers: {Authorization: `Bearer ${authStore.accessToken}`},
                });
                if (!response.ok) return;
                const data: Page<NotificationDto> = await response.json();
                this.items = data.content;
                this.page = data.number;
                this.totalPages = data.totalPages;
                this.totalElements = data.totalElements;
            } catch {
                // silently fail
            } finally {
                this.isLoading = false;
            }
        },

        async markRead(id: string) {
            const authStore = useAuthStore();
            if (!authStore.accessToken) return;

            const item = this.items.find((n) => n.id === id);
            if (item?.read) return;

            try {
                const response = await fetch(`/api/notifications/${id}/read`, {
                    method: 'PATCH',
                    headers: {Authorization: `Bearer ${authStore.accessToken}`},
                });
                if (!response.ok) return;
                if (item) item.read = true;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
            } catch {
                // silently fail
            }
        },

        async markAllRead() {
            const authStore = useAuthStore();
            if (!authStore.accessToken) return;

            try {
                const response = await fetch('/api/notifications/read-all', {
                    method: 'POST',
                    headers: {Authorization: `Bearer ${authStore.accessToken}`},
                });
                if (!response.ok) return;
                this.items.forEach((n) => (n.read = true));
                this.unreadCount = 0;
            } catch {
                // silently fail
            }
        },

        reset() {
            this.items = [];
            this.unreadCount = 0;
            this.page = 0;
            this.totalPages = 0;
            this.totalElements = 0;
        },
    },
});

let pollIntervalId: ReturnType<typeof setInterval> | null = null;

export function useAccountNotificationsWatcher() {
    const notificationsStore = useAccountNotificationsStore();
    const authStore = useAuthStore();

    watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
            if (pollIntervalId) {
                clearInterval(pollIntervalId);
                pollIntervalId = null;
            }
            if (isAuthenticated) {
                notificationsStore.fetchUnreadCount();
                pollIntervalId = setInterval(() => {
                    notificationsStore.fetchUnreadCount();
                }, POLL_INTERVAL_MS);
            } else {
                notificationsStore.reset();
            }
        },
        {immediate: true},
    );
}
