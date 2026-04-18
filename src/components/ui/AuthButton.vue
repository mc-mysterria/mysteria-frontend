<template>
  <div class="auth-ritual-container">
    <template v-if="isLoading">
      <div class="ritual-loading">
        <div class="ritual-spinner"></div>
      </div>
    </template>

    <template v-else-if="user">
      <div class="user-ritual-group">
        <RouterLink class="profile-ritual-link" to="/profile">
          <UserAvatar :nickname="user.nickname" :src="user.avatarUrl" size="sm" glow/>
          <div class="profile-info">
            <span class="profile-nickname">{{ user.nickname }}</span>
            <span class="profile-marks">{{ formattedBalance }}</span>
          </div>
        </RouterLink>

        <!-- Admin Registry Dropdown -->
        <div v-if="canEditAnyContent" ref="dropdownRef" class="admin-ritual-dropdown">
          <button 
              class="admin-ritual-trigger" 
              @click.stop="isDropdownOpen = !isDropdownOpen"
              :class="{ active: isDropdownOpen }"
          >
            <i class="fa-solid fa-eye-evil fa-eye"></i>
          </button>
          
          <Transition name="ritual-dropdown">
            <div v-if="isDropdownOpen" class="admin-ritual-menu">
              <div class="menu-ritual-header">Registry</div>
              
              <RouterLink v-if="canManageNews" class="menu-ritual-item" to="/edit/news" @click="isDropdownOpen = false">
                <i class="fa-solid fa-pen-nib"></i>
                <div class="item-meta">
                  <span class="item-title">Archives</span>
                  <span class="item-desc">Edit News & Lore</span>
                </div>
              </RouterLink>

              <RouterLink v-if="canManageCounsel" class="menu-ritual-item" to="/edit/counsel" @click="isDropdownOpen = false">
                <i class="fa-solid fa-gavel"></i>
                <div class="item-meta">
                  <span class="item-title">Counsel</span>
                  <span class="item-desc">Moderate Suggestions</span>
                </div>
              </RouterLink>

              <RouterLink v-if="canManageShop" class="menu-ritual-item" to="/edit/services" @click="isDropdownOpen = false">
                <i class="fa-solid fa-gem"></i>
                <div class="item-meta">
                  <span class="item-title">Reliquary</span>
                  <span class="item-desc">Manage Services</span>
                </div>
              </RouterLink>

              <div class="menu-ritual-divider"></div>

              <RouterLink class="menu-ritual-item admin-primary" to="/admin" @click="isDropdownOpen = false">
                <i class="fa-solid fa-scroll"></i>
                <div class="item-meta">
                  <span class="item-title">Full Registry</span>
                  <span class="item-desc">Admin Dashboard</span>
                </div>
              </RouterLink>
            </div>
          </Transition>
        </div>

        <button class="logout-ritual-btn" @click="handleLogout" :title="t('logout')">
          <i class="fa-solid fa-sign-out-alt"></i>
        </button>
      </div>
    </template>

    <template v-else>
      <button class="btn-ritual-auth" @click="handleLogin">
        <i class="fa-brands fa-discord"></i>
        <span>{{ t('login') }}</span>
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useUserStore} from "@/stores/user";
import {useAuthStore} from "@/stores/auth";
import {useBalanceStore} from "@/stores/balance";
import {useI18n} from "@/composables/useI18n";
import {usePermissions} from "@/composables/usePermissions";
import {useCurrency} from "@/composables/useCurrency";
import UserAvatar from "@/components/ui/UserAvatar.vue";

const userStore = useUserStore();
const authStore = useAuthStore();
const balanceStore = useBalanceStore();
const {t} = useI18n();
const {formatCurrency, currentCurrency} = useCurrency();
const {canEditAnyContent, canManageNews, canManageCounsel, canManageShop} = usePermissions();

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const user = computed(() => userStore.currentUser);
const isLoading = computed(() => userStore.isLoading || authStore.isLoading);
const balance = computed(() => balanceStore.currentBalance?.amount || 0);

const formattedBalance = computed(() => {
  if (currentCurrency.value === 'POINTS') {
    return `${balance.value} ${t('marks')}`;
  }
  return formatCurrency(balance.value);
});

const handleLogin = () => authStore.openDiscordAuth();
const handleLogout = () => authStore.logout();

const handleClickOutside = (event: MouseEvent) => {
  if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
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
.auth-ritual-container {
  display: flex;
  align-items: center;
}

.btn-ritual-auth {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 24px;
  background: transparent;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ritual-auth:hover {
  background: rgba(200, 178, 115, 0.1);
  box-shadow: 0 0 15px rgba(200, 178, 115, 0.2);
}

.user-ritual-group {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px 4px 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  position: relative;
}

.profile-ritual-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.profile-nickname {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.profile-marks {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Admin Dropdown */
.admin-ritual-dropdown {
  position: relative;
}

.admin-ritual-trigger {
  color: var(--myst-gold);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.admin-ritual-trigger:hover, .admin-ritual-trigger.active {
  background: var(--myst-gold);
  color: #05070a;
}

.admin-ritual-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: -40px;
  width: 260px;
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 4px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  z-index: 100;
  padding: 8px;
}

.menu-ritual-header {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #444;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.menu-ritual-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 2px;
}

.menu-ritual-item i {
  width: 16px;
  font-size: 14px;
  color: var(--myst-gold);
  opacity: 0.8;
  text-align: center;
}

.item-meta {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.item-desc {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.menu-ritual-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.menu-ritual-item.admin-primary {
  background: rgba(200, 178, 115, 0.03);
}

.menu-ritual-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 8px 0;
}

.logout-ritual-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #444;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-ritual-btn:hover {
  color: #ff5252;
  border-color: rgba(255, 82, 82, 0.2);
}

/* Transitions */
.ritual-dropdown-enter-active, .ritual-dropdown-leave-active { transition: all 0.3s ease; }
.ritual-dropdown-enter-from, .ritual-dropdown-leave-to { opacity: 0; transform: translateY(-10px); }

.ritual-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
