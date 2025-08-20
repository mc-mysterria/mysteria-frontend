<template>
  <div class="auth-container">
    <div v-if="authStore.isAuthenticated" class="user-menu">
      <DropdownSelect
        v-model="selectedAction"
        :options="userMenuOptions"
        @change="handleMenuAction"
        :placeholder="userDisplayText"
        :disabled="authStore.isLoading"
        class="user-dropdown"
      >
        <template #selected="{ placeholder }">
          <div class="user-button-content">
            <img
              v-if="userStore.currentUser?.discordId"
              :src="`/anaya/member/avatar?discord_id=${userStore.currentUser.discordId}`"
              :alt="userStore.currentUser?.nickname || 'User avatar'"
              class="avatar-image"
              @error="handleImageError"
            />
            <i v-else class="fa-brands fa-discord discord-icon"></i>
            <span class="username">{{ placeholder }}</span>
          </div>
        </template>

        <template #option="{ option }">
          <div class="menu-option">
            <i :class="option.icon"></i>
            <span>{{ option.label }}</span>
          </div>
        </template>
      </DropdownSelect>
    </div>

    <button
      v-else
      :class="buttonClasses"
      @click="handleLogin"
      :disabled="authStore.isLoading"
    >
      <div class="button-content">
        <i class="fa-brands fa-discord discord-icon"></i>
        <span class="login-text">
          {{
            authStore.isLoading ? t("loading") + "..." : t("loginWithDiscord")
          }}
        </span>
      </div>
      <div v-if="authStore.isLoading" class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useNotification } from "@/services/useNotification";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "@/composables/useI18n";
import DropdownSelect from "@/components/ui/DropdownSelect.vue";

export interface ComponentProps {
  mobileMode?: boolean;
}

const props = withDefaults(defineProps<ComponentProps>(), {
  mobileMode: false,
});

const emit = defineEmits<{
  mobileAction: [];
}>();

const authStore = useAuthStore();
const userStore = useUserStore();
const { show } = useNotification();
const router = useRouter();
const { t } = useI18n();

const selectedAction = ref("");

const userDisplayText = computed(() => {
  return userStore.currentUser?.nickname || t("profile");
});

const profileUrl = computed(() => {
  return authStore.isAuthenticated && userStore.currentUser
    ? `/profile` // /${userStore.currentUser.nickname || userStore.currentUser.id}
    : "";
});

const userMenuOptions = computed(() => {
  const options = [
    {
      label: t("profile"),
      value: "profile",
      icon: "fa-solid fa-user",
    },
  ];

  // Add admin options for privileged users
  if (authStore.isPrivilegedUser) {
    options.push(
      {
        label: "Edit News",
        value: "edit-news",
        icon: "fa-solid fa-newspaper",
      },
      {
        label: "Admin Panel",
        value: "admin",
        icon: "fa-solid fa-cog",
      }
    );
  }

  options.push({
    label: authStore.isLoading ? t("loading") + "..." : t("logout"),
    value: "logout",
    icon: "fa-solid fa-right-from-bracket",
  });

  return options;
});

const buttonClasses = computed(() => ({
  "auth-login-button": true,
  "auth-login-button--loading": authStore.isLoading,
  "auth-login-button--mobile": props.mobileMode,
}));

const handleMenuAction = (value: string | number | string[]) => {
  selectedAction.value = "";

  if (value === "profile") {
    router.push(profileUrl.value);
  } else if (value === "edit-news") {
    router.push("/edit/news");
  } else if (value === "admin") {
    router.push("/admin");
  } else if (value === "logout") {
    handleLogout();
  }

  if (props.mobileMode) {
    emit("mobileAction");
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
};

const handleLogin = () => {
  if (!authStore.isAuthenticated && !authStore.isLoading) {
    if (props.mobileMode) {
      emit("mobileAction");
    }
    authStore.openDiscordAuth();
  }
};

const handleLogout = async () => {
  try {
    if (props.mobileMode) {
      emit("mobileAction");
    }
    await authStore.logout();
  } catch {
    show(t("error"), { type: "error" });
  }
};
</script>

<style scoped>
.auth-container {
  position: relative;
  display: inline-block;
}

.user-menu {
  position: relative;
}

.user-dropdown {
  min-width: 200px;
}

.user-dropdown :deep(.dropdown-trigger) {
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  padding: 8px 16px;
  border-radius: 6px;
  height: 40px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.user-dropdown :deep(.dropdown-trigger):hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.user-dropdown :deep(.dropdown-trigger.is-open) {
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.user-button-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid color-mix(in srgb, white 20%, transparent);
  transition: all 0.3s ease;
}

.avatar-image:hover {
  border-color: var(--myst-gold);
}

.discord-icon {
  font-size: 16px;
  color: var(--myst-ink);
}

.username {
  font-weight: 500;
  color: var(--myst-ink);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.auth-login-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 40px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  color: var(--myst-ink);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.auth-login-button:hover:not(.auth-login-button--loading) {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.auth-login-button:active {
  transform: translateY(0);
}

.auth-login-button--loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.auth-login-button--mobile {
  width: 100%;
  justify-content: center;
  padding: 16px 24px;
  font-size: 1.1rem;
  border-radius: 16px;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-text {
  font-weight: 600;
  padding: 5px 25px 5px 0;
}

.loading-spinner {
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
}

@media (max-width: 1200px) {
  .user-dropdown {
    min-width: 180px;
  }

  .auth-login-button {
    padding: 10px 18px;
    font-size: 0.9rem;
  }

  .avatar-image {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 992px) {
  .user-dropdown {
    min-width: 160px;
  }

  .auth-login-button {
    padding: 9px 16px;
    font-size: 0.85rem;
  }

  .avatar-image {
    width: 34px;
    height: 34px;
  }

  .username {
    max-width: 130px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .user-dropdown {
    min-width: 150px;
  }

  .avatar-image {
    width: 32px;
    height: 32px;
  }

  .username {
    max-width: 110px;
    font-size: 0.85rem;
  }

  .auth-login-button {
    padding: 8px 14px;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .user-dropdown {
    min-width: 140px;
  }

  .avatar-image {
    width: 28px;
    height: 28px;
  }

  .username {
    max-width: 100px;
    font-size: 0.8rem;
  }

  .auth-login-button {
    padding: 7px 12px;
    font-size: 0.75rem;
  }

  .user-button-content {
    gap: 8px;
  }

  .button-content {
    gap: 8px;
  }
}
</style>
