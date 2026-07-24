<template>
  <div class="page-container">
    <HeaderItem/>

    <main class="notifications-main">
    <div class="notifications-view">
    <div class="page-header">
      <button class="back-button" @click="router.push('/profile')">
        <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        {{ t('back') || 'Back' }}
      </button>
      <div class="title-block">
        <span class="eyebrow">{{ t('notifications.title') }}</span>
        <h1 class="page-title">{{ t('notifications.title') }}</h1>
      </div>
      <button v-if="store.unreadCount > 0" class="mark-all-btn" @click="store.markAllRead()">
        {{ t('notifications.markAllRead') }}
      </button>
    </div>

    <div v-if="store.isLoading && items.length === 0" class="state-block">
      <div class="loading-sigil"></div>
    </div>

    <div v-else-if="items.length === 0" class="state-block empty">
      <i class="fa-solid fa-bell-slash empty-icon"></i>
      <p>{{ t('notifications.empty') }}</p>
    </div>

    <div v-else class="notif-entries">
      <div
          v-for="item in items"
          :key="item.id"
          :class="{ unread: !item.read }"
          class="notif-entry"
          @click="handleItemClick(item)"
      >
        <div class="entry-indicator"></div>
        <i :class="notificationIcon(item.type)" class="entry-icon"></i>
        <div class="entry-body">
          <p class="entry-text">{{ buildNotificationText(item, t) }}</p>
          <span class="entry-date">{{ formatNotificationDate(item.createdAt, locale) }}</span>
        </div>
        <button v-if="item.actionable" class="entry-cta" @click.stop="handleAction(item)">
          {{ notificationCtaLabel(item, t) }}
        </button>
      </div>
    </div>

    <div v-if="store.totalPages > 1" class="pagination">
      <button
          :disabled="store.page === 0 || store.isLoading"
          class="pagination-btn"
          @click="goToPage(store.page - 1)"
      >
        <svg fill="none" height="14" stroke="currentColor" viewBox="0 0 24 24" width="14">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        {{ t('previous') || 'Previous' }}
      </button>

      <div class="pagination-info">
        {{ t('page') || 'Page' }} {{ store.page + 1 }} / {{ store.totalPages }}
        <span class="total-count">({{ store.totalElements }} {{ t('total') || 'total' }})</span>
      </div>

      <button
          :disabled="store.page >= store.totalPages - 1 || store.isLoading"
          class="pagination-btn"
          @click="goToPage(store.page + 1)"
      >
        {{ t('next') || 'Next' }}
        <svg fill="none" height="14" stroke="currentColor" viewBox="0 0 24 24" width="14">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
    </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useAccountNotificationsStore} from '@/stores/notifications';
import {useI18n} from '@/composables/useI18n';
import {
  buildNotificationText,
  formatNotificationDate,
  notificationCtaLabel,
  notificationIcon,
  notificationTargetRoute,
} from '@/utils/notifications';
import type {NotificationDto} from '@/types/notifications';

const router = useRouter();
const store = useAccountNotificationsStore();
const {t, currentLanguage} = useI18n();

const items = computed(() => store.items);
const locale = computed(() => (currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US'));

const goToPage = (page: number) => {
  if (page >= 0 && page < store.totalPages) {
    store.fetchPage(page, 20);
  }
};

const handleItemClick = (item: NotificationDto) => {
  if (!item.read) store.markRead(item.id);
};

const handleAction = async (item: NotificationDto) => {
  await store.markRead(item.id);
  const target = notificationTargetRoute(item);
  if (target) {
    router.push(target);
  }
};

onMounted(() => {
  store.fetchPage(0, 20);
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.notifications-main {
  flex: 1 0 auto;
  background: var(--myst-bg);
  padding: 100px 0 60px;
}

.notifications-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: var(--myst-gold);
  border-color: rgba(200, 178, 115, 0.3);
}

.title-block {
  flex: 1;
}

.eyebrow {
  display: none;
}

.page-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  color: var(--myst-offwhite);
}

.mark-all-btn {
  padding: 8px 16px;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-all-btn:hover {
  background: var(--myst-gold);
  color: #05070a;
}

.state-block {
  padding: 80px 0;
  text-align: center;
  color: #666;
}

.state-block.empty .empty-icon {
  font-size: 32px;
  color: #444;
  margin-bottom: 16px;
  display: block;
}

.loading-sigil {
  width: 36px;
  height: 36px;
  margin: 0 auto;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notif-entries {
  display: grid;
  gap: 12px;
}

.notif-entry {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px 18px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-entry:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(200, 178, 115, 0.2);
}

.notif-entry.unread {
  background: rgba(200, 178, 115, 0.04);
}

.entry-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: #333;
}

.notif-entry.unread .entry-indicator {
  background: var(--myst-gold);
}

.entry-icon {
  padding-top: 3px;
  font-size: 15px;
  color: var(--myst-gold);
  opacity: 0.8;
}

.entry-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.entry-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #ddd;
}

.entry-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.entry-cta {
  flex-shrink: 0;
  padding: 8px 16px;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.entry-cta:hover {
  background: var(--myst-gold);
  color: #05070a;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: var(--myst-gold);
  color: #05070a;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
}

.pagination-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: #666;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 13px;
  font-weight: 600;
  color: #ccc;
  text-align: center;
}

.total-count {
  display: block;
  font-size: 11px;
  font-weight: 400;
  color: #666;
}

@media (max-width: 600px) {
  .notifications-main {
    padding: 90px 0 40px;
  }

  .notifications-view {
    padding: 0 16px;
  }

  .notif-entry {
    flex-direction: column;
  }

  .entry-cta {
    align-self: flex-start;
  }
}
</style>
