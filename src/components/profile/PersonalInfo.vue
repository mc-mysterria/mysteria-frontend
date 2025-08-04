<template>
  <div class="personalInfoContainer">
    <img :src="currentAvatar" alt="User Avatar" @load="handleImageLoad" />
    <div class="personalInfo">
      <p class="white">{{ t('personalInfo') }}:</p>
      <div class="NameRole">
        <div
          class="NameRoleBlock"
          :title="t('nickname')"
        >
          <p>{{ t('nickname') }}</p>
          <div>
            {{
              displayedUser?.nickname ||
              displayedUser?.discord_id ||
              t('unknown')
            }}
          </div>
        </div>
        <div class="NameRoleBlock" :title="t('role')">
          <p>{{ t('role') }}</p>
          <div :class="getRoleClass()">
            {{ displayRole }}
          </div>
        </div>
      </div>
      <div class="subscription-section" :title="t('subscription')">
        <p>{{ t('subscription') }}</p>
        <div class="email">{{ subscription }}</div>
      </div>
      <div class="verification-section" :title="t('verification')">
        <p>{{ t('verification') }}</p>
        <div class="verification-status" :class="{
          'verified': displayedUser?.verified,
          'unverified': !displayedUser?.verified
        }">
          {{ displayedUser?.verified ? t('verified') : t('notVerified') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { UserResponse } from "@/types/users";
import { useRoleStore } from "@/stores/roles";
import { useI18n } from "@/composables/useI18n";
import logoUrl from "@/assets/icons/sources/IconLogo.webp";

const props = defineProps<{
  displayedUser: UserResponse | null;
  subscription: string;
}>();

const { t } = useI18n();

const userAvatarUrl = computed(() => {
  if (props.displayedUser?.discord_id) {
    return `/anaya/member/avatar?discord_id=${props.displayedUser.discord_id}`;
  }
  return null;
});

const currentAvatar = ref<string>(logoUrl);

watch(
  () => props.displayedUser?.discord_id,
  () => {
    currentAvatar.value = logoUrl;
  },
);

const handleImageLoad = (event: Event) => {
  if (userAvatarUrl.value && currentAvatar.value === logoUrl) {
    const img = event.target as HTMLImageElement;
    if (img.src.endsWith(userAvatarUrl.value)) return;
    currentAvatar.value = userAvatarUrl.value;
  }
};

const roleStore = useRoleStore();

const displayRole = computed(() => {
  // Check new API role property first
  if (props.displayedUser?.role) {
    return props.displayedUser.role;
  }
  
  // Use the current role field from the API
  if (!props.displayedUser?.role) {
    return "Гравець";
  }

  return roleStore.getRoleDisplayName(props.displayedUser.role) || "Гравець";
});

const getRoleClass = () => {
  if (!props.displayedUser?.role) {
    return "role-default";
  }

  const roleName = props.displayedUser.role;

  // High-level admin roles (red)
  if (["technical_admin", "owner"].includes(roleName)) {
    return "role-admin";
  }

  // High management roles (purple)
  if (["warden", "deputy", "manager"].includes(roleName)) {
    return "role-high";
  }

  // Medium roles (green)
  if (["controller", "mi9", "advisor", "judge"].includes(roleName)) {
    return "role-medium";
  }

  // Content creator roles (blue)
  if (["twitch_author", "youtube_author"].includes(roleName)) {
    return "role-creator";
  }

  // Community roles (orange)
  if (
    [
      "nitro_booster",
      "wealth_sponsor",
      "message_leader",
      "voice_leader",
    ].includes(roleName)
  ) {
    return "role-community";
  }

  return "role-default";
};
</script>

<style scoped>
.personalInfoContainer {
  width: 100%;
  margin: 0 auto 3rem auto;
  display: flex;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease-out;
  box-sizing: border-box;
}

.personalInfoContainer:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(108, 93, 211, 0.2);
}

.personalInfoContainer img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid rgba(108, 93, 211, 0.3);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.personalInfoContainer img:hover {
  border-color: #6c5dd3;
  transform: scale(1.02);
}

.personalInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

.personalInfo > p {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.NameRole {
  display: flex;
  gap: 1rem;
}

.NameRoleBlock {
  flex: 1;
  min-width: 0;
}

.NameRoleBlock > p {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cccccc;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.NameRoleBlock div,
.email {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 1.25rem;
  border-radius: 10px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  word-break: break-word;
}

.NameRoleBlock div:hover,
.email:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(108, 93, 211, 0.5);
  transform: translateY(-1px);
}

.subscription-section,
.verification-section {
  margin-top: auto;
}

.subscription-section > p,
.verification-section > p {
  font-size: 0.9rem;
  font-weight: 600;
  color: #cccccc;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.verification-status {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 1.25rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  word-break: break-word;
}

.verification-status.verified {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.6);
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(255, 255, 255, 0.1)
  );
}

.verification-status.unverified {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.6);
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.15),
    rgba(255, 255, 255, 0.1)
  );
}

/* Role-based styling */
.role-admin {
  border-color: rgba(255, 107, 107, 0.6) !important;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 107, 0.15),
    rgba(255, 255, 255, 0.1)
  ) !important;
  color: #ff6b6b !important;
}

.role-high {
  border-color: rgba(168, 85, 247, 0.6) !important;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.15),
    rgba(255, 255, 255, 0.1)
  ) !important;
  color: #a855f7 !important;
}

.role-medium {
  border-color: rgba(34, 197, 94, 0.6) !important;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.15),
    rgba(255, 255, 255, 0.1)
  ) !important;
  color: #22c55e !important;
}

.role-creator {
  border-color: rgba(14, 165, 233, 0.6) !important;
  background: linear-gradient(
    135deg,
    rgba(14, 165, 233, 0.15),
    rgba(255, 255, 255, 0.1)
  ) !important;
  color: #0ea5e9 !important;
}

.role-community {
  border-color: rgba(249, 115, 22, 0.6) !important;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.15),
    rgba(255, 255, 255, 0.1)
  ) !important;
  color: #f97316 !important;
}

.role-default {
  color: #ffffff;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .personalInfoContainer {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .personalInfoContainer img {
    width: 150px;
    height: 150px;
    align-self: center;
  }

  .NameRole {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .personalInfoContainer {
    padding: 1rem;
  }

  .personalInfoContainer img {
    width: 120px;
    height: 120px;
  }

  .personalInfo > p {
    font-size: 1.25rem;
  }
}
</style>
