<template>
  <div :class="['auth-cluster', { mobile: mobileMode }]">
    <template v-if="isLoading">
      <div class="auth-skeleton" aria-hidden="true"></div>
    </template>

    <template v-else-if="user">
      <RouterLink class="profile-chip" to="/profile" @click="emitMobileAction">
        <span class="profile-nickname">{{ user.nickname || t('profileTitle') }}</span>
        <UserAvatar :nickname="user.nickname" :src="user.avatarUrl" class="profile-avatar" size="xs"/>
      </RouterLink>

      <!-- Staff-only registry menu -->
      <div
          v-if="canEditAnyContent || canTuneBalance || canManageCommissions"
          ref="dropdownRef"
          class="registry"
      >
        <button
            :aria-expanded="isDropdownOpen"
            :class="['icon-button', { active: isDropdownOpen }]"
            :title="t('navServices')"
            @click.stop="isDropdownOpen = !isDropdownOpen"
        >
          <i class="fa-solid fa-eye"></i>
        </button>

        <Transition name="registry-menu">
          <div v-if="isDropdownOpen" class="registry-menu">
            <p class="registry-heading">Registry</p>

            <RouterLink v-if="canManageNews" class="registry-item" to="/edit/news" @click="closeDropdown">
              <i class="fa-solid fa-pen-nib"></i>
              <span><strong>Archives</strong><small>Edit news &amp; lore</small></span>
            </RouterLink>

            <RouterLink v-if="canManageShop" class="registry-item" to="/edit/services" @click="closeDropdown">
              <i class="fa-solid fa-gem"></i>
              <span><strong>Reliquary</strong><small>Manage services</small></span>
            </RouterLink>

            <RouterLink v-if="canTuneBalance" class="registry-item" to="/tools/balance" @click="closeDropdown">
              <i class="fa-solid fa-scale-balanced"></i>
              <span><strong>Observatory</strong><small>Balance tuning</small></span>
            </RouterLink>

            <RouterLink v-if="canManageCommissions" class="registry-item" to="/admin/commissions"
                        @click="closeDropdown">
              <i class="fa-solid fa-scroll"></i>
              <span><strong>Commissions</strong><small>Review requests</small></span>
            </RouterLink>

            <template v-if="canAccessAdmin">
              <div class="registry-divider" aria-hidden="true"></div>
              <RouterLink class="registry-item" to="/admin" @click="closeDropdown">
                <i class="fa-solid fa-shield-halved"></i>
                <span><strong>Full registry</strong><small>Admin dashboard</small></span>
              </RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <button class="icon-button" :title="t('logout')" @click="handleLogout">
        <i class="fa-solid fa-arrow-right-from-bracket"></i>
      </button>
    </template>

    <template v-else>
      <button class="login-button" @click="handleLogin">
        <IconDiscord aria-hidden="true"/>
        <span>{{ t('login') }}</span>
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref} from "vue";
import {useUserStore} from "@/stores/user";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "@/composables/useI18n";
import {usePermissions} from "@/composables/usePermissions";
import UserAvatar from "@/components/ui/UserAvatar.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";

withDefaults(defineProps<{ mobileMode?: boolean }>(), {mobileMode: false});
const emit = defineEmits<{ (e: "mobile-action"): void }>();

const userStore = useUserStore();
const authStore = useAuthStore();
const {t} = useI18n();
const {
  canEditAnyContent,
  canManageNews,
  canManageShop,
  canTuneBalance,
  canManageCommissions,
  canAccessAdmin
} = usePermissions();

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const user = computed(() => userStore.currentUser);
const isLoading = computed(() => userStore.isLoading || authStore.isLoading);

const handleLogin = () => authStore.openDiscordAuth();
const handleLogout = () => authStore.logout();
const closeDropdown = () => (isDropdownOpen.value = false);
const emitMobileAction = () => emit("mobile-action");

const handleClickOutside = (event: MouseEvent) => {
  if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => window.addEventListener("click", handleClickOutside));
onUnmounted(() => window.removeEventListener("click", handleClickOutside));
</script>

<style scoped>
.auth-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-skeleton {
  width: 96px;
  height: 34px;
  border: 1px solid var(--myst-line-14);
  background: rgba(200, 178, 115, 0.04);
}

/* Logged out */
.login-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 22px;
  background: var(--myst-gold);
  border: none;
  border-radius: 2px;
  color: var(--myst-on-gold);
  font-family: var(--myst-font-mono);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.25s ease;
}

.login-button:hover {
  background: var(--myst-offwhite);
  color: var(--myst-on-gold);
}

/* Logged in */
.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px 6px 16px;
  border: 1px solid var(--myst-line-28);
  border-radius: 2px;
  color: var(--myst-offwhite);
  font-family: var(--myst-font-mono);
  font-size: 11.5px;
  max-width: 220px;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.profile-chip:hover {
  border-color: var(--myst-gold);
  background: var(--myst-wash);
  color: var(--myst-offwhite);
}

.profile-nickname {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-avatar {
  flex-shrink: 0;
}

.profile-avatar :deep(.avatar-ritual-frame),
.profile-avatar :deep(img) {
  border-radius: 2px;
}

.icon-button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: var(--myst-wash);
  border: 1px solid var(--myst-line-20);
  border-radius: 2px;
  color: var(--myst-gold);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.icon-button:hover,
.icon-button.active {
  background: var(--myst-gold);
  border-color: var(--myst-gold);
  color: var(--myst-on-gold);
}

/* Registry menu */
.registry {
  position: relative;
  display: flex;
}

.registry-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 280px;
  padding: 8px;
  background: var(--myst-bg-deep);
  border: 1px solid var(--myst-line-20);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.7);
  z-index: 120;
}

.registry-heading {
  margin: 6px 10px 10px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.registry-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 12px;
  border: 1px solid transparent;
  color: inherit;
  transition: all 0.25s ease;
}

.registry-item:hover {
  background: rgba(200, 178, 115, 0.05);
  border-color: var(--myst-line-12);
  color: inherit;
}

.registry-item i {
  width: 18px;
  color: var(--myst-gold);
  font-size: 13px;
  text-align: center;
}

.registry-item span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.registry-item strong {
  color: var(--myst-offwhite);
  font-size: 14px;
  font-weight: 600;
}

.registry-item small {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.registry-divider {
  height: 1px;
  margin: 8px 12px;
  background: var(--myst-line-12);
}

.registry-menu-enter-active,
.registry-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.registry-menu-enter-from,
.registry-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Mobile drawer variant */
.auth-cluster.mobile {
  width: 100%;
  flex-wrap: wrap;
}

.auth-cluster.mobile .login-button,
.auth-cluster.mobile .profile-chip {
  flex: 1;
  justify-content: center;
  min-height: 46px;
  max-width: none;
}
</style>
