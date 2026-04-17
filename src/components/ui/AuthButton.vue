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
            <span class="profile-marks">{{ balance }} {{ t('marks') }}</span>
          </div>
        </RouterLink>
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
import {computed} from "vue";
import {useUserStore} from "@/stores/user";
import {useAuthStore} from "@/stores/auth";
import {useBalanceStore} from "@/stores/balance";
import {useI18n} from "@/composables/useI18n";
import UserAvatar from "@/components/ui/UserAvatar.vue";

const userStore = useUserStore();
const authStore = useAuthStore();
const balanceStore = useBalanceStore();
const {t} = useI18n();

const user = computed(() => userStore.currentUser);
const isLoading = computed(() => userStore.isLoading || authStore.isLoading);
const balance = computed(() => balanceStore.currentBalance?.amount || 0);

const handleLogin = () => authStore.openDiscordAuth();
const handleLogout = () => authStore.logout();
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
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px 4px 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
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
