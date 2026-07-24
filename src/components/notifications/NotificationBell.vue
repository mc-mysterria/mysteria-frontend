<template>
  <div v-if="authStore.isAuthenticated" ref="dropdownRef" class="notif-ritual-wrapper">
    <button
        :class="{ active: isOpen }"
        :title="t('notifications.title')"
        class="notif-ritual-trigger"
        @click.stop="toggle"
    >
      <i class="fa-solid fa-bell"></i>
      <span v-if="unreadCount > 0" class="notif-badge">{{ badgeLabel }}</span>
    </button>

    <Transition name="ritual-dropdown">
      <div v-if="isOpen" class="notif-ritual-menu">
        <div class="notif-menu-header">
          <span class="notif-menu-title">{{ t('notifications.title') }}</span>
          <button v-if="unreadCount > 0" class="notif-mark-all" @click="handleMarkAllRead">
            {{ t('notifications.markAllRead') }}
          </button>
        </div>

        <div v-if="store.isLoading && items.length === 0" class="notif-loading">
          <div class="notif-spinner"></div>
        </div>

        <div v-else-if="items.length === 0" class="notif-empty">
          {{ t('notifications.empty') }}
        </div>

        <div v-else class="notif-list">
          <div
              v-for="item in items"
              :key="item.id"
              :class="{ unread: !item.read }"
              class="notif-item"
              @click="handleItemClick(item)"
          >
            <i :class="notificationIcon(item.type)" class="notif-item-icon"></i>
            <div class="notif-item-body">
              <p class="notif-item-text">{{ buildNotificationText(item, t) }}</p>
              <span class="notif-item-date">{{ formatNotificationDate(item.createdAt, locale) }}</span>
              <button v-if="item.actionable" class="notif-item-cta" @click.stop="handleAction(item)">
                {{ notificationCtaLabel(item, t) }}
              </button>
            </div>
          </div>
        </div>

        <RouterLink class="notif-view-all" to="/notifications" @click="isOpen = false">
          {{ t('notifications.viewAll') }}
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth';
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
const authStore = useAuthStore();
const store = useAccountNotificationsStore();
const {t, currentLanguage} = useI18n();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const items = computed(() => store.items);
const unreadCount = computed(() => store.unreadCount);
const badgeLabel = computed(() => (unreadCount.value > 9 ? '9+' : String(unreadCount.value)));
const locale = computed(() => (currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US'));

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    store.fetchPage(0, 8);
  }
};

const handleMarkAllRead = () => store.markAllRead();

const handleItemClick = (item: NotificationDto) => {
  if (!item.read) store.markRead(item.id);
};

const handleAction = async (item: NotificationDto) => {
  await store.markRead(item.id);
  const target = notificationTargetRoute(item);
  if (target) {
    router.push(target);
  }
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (isOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notif-ritual-wrapper {
  position: relative;
}

.notif-ritual-trigger {
  position: relative;
  color: var(--myst-gold);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
}

.notif-ritual-trigger:hover,
.notif-ritual-trigger.active {
  background: var(--myst-gold);
  color: #05070a;
}

.notif-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ff5252;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  border: 1px solid #080a14;
}

.notif-ritual-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: -12px;
  width: 340px;
  max-width: calc(100vw - 32px);
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.notif-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.notif-menu-title {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.notif-mark-all {
  background: none;
  border: none;
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.notif-mark-all:hover {
  opacity: 1;
}

.notif-loading,
.notif-empty {
  padding: 32px 16px;
  text-align: center;
  color: #666;
  font-size: 12px;
}

.notif-spinner {
  width: 20px;
  height: 20px;
  margin: 0 auto;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.notif-list {
  max-height: 380px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: background 0.2s;
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.notif-item.unread {
  background: rgba(200, 178, 115, 0.04);
}

.notif-item-icon {
  width: 16px;
  padding-top: 2px;
  font-size: 13px;
  color: var(--myst-gold);
  opacity: 0.8;
  text-align: center;
  flex-shrink: 0;
}

.notif-item-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.notif-item-text {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: #ddd;
}

.notif-item-date {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notif-item-cta {
  align-self: flex-start;
  margin-top: 4px;
  padding: 5px 12px;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.notif-item-cta:hover {
  background: var(--myst-gold);
  color: #05070a;
}

.notif-view-all {
  display: block;
  padding: 12px 16px;
  text-align: center;
  color: #888;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: color 0.2s;
}

.notif-view-all:hover {
  color: var(--myst-gold);
}

.ritual-dropdown-enter-active,
.ritual-dropdown-leave-active {
  transition: all 0.3s ease;
}

.ritual-dropdown-enter-from,
.ritual-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
