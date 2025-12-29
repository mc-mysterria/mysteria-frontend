<template>
  <div class="personalInfoContainer personal-info-card">
    <UserAvatar :user="displayedUser" class="profile-avatar" size="large"/>
    <div class="personalInfo">
      <p class="white">{{ t("personalInfo") }}:</p>
      <div class="NameRole">
        <div :title="t('nickname')" class="NameRoleBlock">
          <p>{{ t("nickname") }}</p>
          <div>
            {{
              displayedUser?.nickname ||
              displayedUser?.discord_id ||
              t("unknown")
            }}
          </div>
        </div>
        <div :title="t('role')" class="NameRoleBlock">
          <p>{{ t("role") }}</p>
          <div :class="getRoleClass()">
            {{ displayRole }}
          </div>
        </div>
      </div>
      <div :title="t('subscription')" class="subscription-section">
        <p>{{ t("subscription") }}</p>
        <div class="email">{{ subscription }}</div>
      </div>
      <div :title="t('verification')" class="verification-section">
        <p>{{ t("verification") }}</p>
        <div
            :class="{
            verified: displayedUser?.verified,
            unverified: !displayedUser?.verified,
          }"
            class="verification-status"
        >
          {{ displayedUser?.verified ? t("verified") : t("notVerified") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import type {UserResponse} from "@/types/users";
import {useRoleStore} from "@/stores/roles";
import {useI18n} from "@/composables/useI18n";
import UserAvatar from "@/components/ui/UserAvatar.vue";

const props = defineProps<{
  displayedUser: UserResponse | null;
  subscription: string;
}>();

const {t} = useI18n();
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
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  display: flex;
  gap: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.personalInfoContainer:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.profile-avatar {
  width: 200px !important;
  height: 200px !important;
  border-radius: 12px !important;
  flex-shrink: 0;
}

.profile-avatar:hover {
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
  color: var(--myst-ink-strong);
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
  color: var(--myst-ink-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.NameRoleBlock div,
.email {
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  padding: 1rem 1.25rem;
  border-radius: 6px;
  color: var(--myst-ink);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  word-break: break-word;
}

.NameRoleBlock div:hover,
.email:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
}

.subscription-section,
.verification-section {
  margin-top: auto;
}

.subscription-section > p,
.verification-section > p {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--myst-ink-muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.verification-status {
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  padding: 1rem 1.25rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
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
  border-color: rgba(34, 197, 94, 0.6) !important;
  background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.15),
      rgba(255, 255, 255, 0.1)
  ) !important;
  color: #22c55e !important;
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

  .profile-avatar {
    width: 150px !important;
    height: 150px !important;
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

  .profile-avatar {
    width: 120px !important;
    height: 120px !important;
  }

  .personalInfo > p {
    font-size: 1.25rem;
  }
}
</style>
