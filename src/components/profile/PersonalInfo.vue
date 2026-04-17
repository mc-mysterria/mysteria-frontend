<template>
  <div class="journal-entry personal-info-card">
    <div class="journal-frame" aria-hidden="true"></div>
    
    <div class="journal-content">
      <!-- Profile Header / Avatar Section -->
      <div class="profile-header">
        <div class="avatar-seal">
          <UserAvatar :nickname="displayedUser?.nickname" :src="displayedUser?.avatarUrl" class="profile-avatar" size="full"/>
          <div class="seal-glow" :class="getRoleClass()"></div>
          <div class="seal-rings"></div>
        </div>
        
        <div class="profile-identity">
          <span class="entry-label">{{ t("personalInfo") }}</span>
          <h2 class="profile-name">
            {{ displayedUser?.nickname || displayedUser?.discord_id || t("unknown") }}
          </h2>
          <div class="identity-meta">
            <div class="meta-item">
              <span class="meta-label">ID:</span>
              <span class="meta-val">{{ displayedUser?.discord_id || '---' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Attributes Grid -->
      <div class="attributes-grid">
        <!-- Role Attribute -->
        <div class="attr-block" :class="getRoleClass()">
          <div class="attr-header">
            <span class="attr-label">{{ t("role") }}</span>
            <div class="attr-line"></div>
          </div>
          <div class="attr-value role-value">
            <i class="fa-solid fa-scroll role-icon"></i>
            {{ displayRole }}
          </div>
        </div>

        <!-- Subscription Attribute -->
        <div class="attr-block">
          <div class="attr-header">
            <span class="attr-label">{{ t("subscription") }}</span>
            <div class="attr-line"></div>
          </div>
          <div class="attr-value">
            <i class="fa-solid fa-star-of-life meta-icon"></i>
            {{ subscription }}
          </div>
        </div>

        <!-- Verification Attribute -->
        <div class="attr-block" :class="{ 'is-verified': displayedUser?.verified }">
          <div class="attr-header">
            <span class="attr-label">{{ t("verification") }}</span>
            <div class="attr-line"></div>
          </div>
          <div class="attr-value verification-val">
            <i :class="displayedUser?.verified ? 'fa-solid fa-shield-check' : 'fa-solid fa-shield-slash'"></i>
            {{ displayedUser?.verified ? t("verified") : t("notVerified") }}
          </div>
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
  if (props.displayedUser?.role) return props.displayedUser.role;
  return "Гравець";
});

const getRoleClass = () => {
  if (!props.displayedUser?.role) return "role-default";
  const roleName = props.displayedUser.role;
  if (["technical_admin", "owner"].includes(roleName)) return "role-admin";
  if (["warden", "deputy", "manager"].includes(roleName)) return "role-high";
  if (["controller", "mi9", "advisor", "judge"].includes(roleName)) return "role-medium";
  if (["twitch_author", "youtube_author"].includes(roleName)) return "role-creator";
  if (["nitro_booster", "wealth_sponsor", "message_leader", "voice_leader"].includes(roleName)) return "role-community";
  return "role-default";
};
</script>

<style scoped>
/* BEYONDER'S JOURNAL AESTHETIC */

.journal-entry {
  position: relative;
  background: rgba(13, 16, 30, 0.4);
  backdrop-filter: blur(10px);
  padding: 40px;
  min-height: 300px;
  overflow: hidden;
  transition: all 0.4s ease;
}

.journal-frame {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  pointer-events: none;
}

.journal-frame::before {
  content: '';
  position: absolute;
  top: 10px; left: 10px; bottom: 10px; right: 10px;
  border: 1px solid rgba(200, 178, 115, 0.1);
}

.journal-entry:hover .journal-frame {
  border-color: rgba(200, 178, 115, 0.3);
}

/* Header Layout */
.profile-header {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 32px;
}

/* Avatar Seal */
.avatar-seal {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  border: 4px solid #080a14;
  position: relative;
  z-index: 5;
  filter: grayscale(0.2) contrast(1.1);
  transition: all 0.5s ease;
}

.journal-entry:hover .profile-avatar {
  filter: grayscale(0) contrast(1.2);
  transform: scale(1.05) rotate(2deg);
}

.seal-glow {
  position: absolute;
  inset: -15px;
  background: radial-gradient(circle, rgba(200, 178, 115, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  opacity: 0.5;
  transition: all 0.5s ease;
}

.journal-entry:hover .seal-glow {
  opacity: 1;
  transform: scale(1.2);
}

.seal-rings {
  position: absolute;
  inset: -8px;
  border: 1px dashed rgba(200, 178, 115, 0.3);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Identity Text */
.entry-label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.7;
}

.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 42px;
  color: var(--myst-offwhite);
  margin: 0 0 12px;
  font-weight: 800;
  line-height: 1;
}

.identity-meta {
  display: flex;
  gap: 20px;
}

.meta-label {
  font-size: 11px;
  color: #555;
  text-transform: uppercase;
  margin-right: 8px;
}

.meta-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #888;
}

/* Attributes Grid */
.attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.attr-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attr-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.attr-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 2px;
  white-space: nowrap;
}

.attr-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(200, 178, 115, 0.2), transparent);
}

.attr-value {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.role-icon, .meta-icon {
  font-size: 14px;
  color: var(--myst-gold);
  opacity: 0.5;
}

/* Role Specific Values */
.role-admin .attr-value { color: #ff6b6b; text-shadow: 0 0 15px rgba(255, 107, 107, 0.3); }
.role-high .attr-value { color: #a78bfa; }
.role-medium .attr-value { color: #6bcf7f; }
.role-creator .attr-value { color: #4ecdc4; }
.role-community .attr-value { color: #f59e42; }

/* Verification Value */
.is-verified .verification-val {
  color: #6bcf7f;
}

.is-verified .attr-line {
  background: linear-gradient(90deg, rgba(107, 207, 127, 0.3), transparent);
}

/* Role Seal Glows */
.role-admin .seal-glow { background: radial-gradient(circle, rgba(255, 107, 107, 0.25) 0%, transparent 70%); }
.role-high .seal-glow { background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%); }
.role-medium .seal-glow { background: radial-gradient(circle, rgba(107, 207, 127, 0.2) 0%, transparent 70%); }

/* Responsive */
@media (max-width: 1024px) {
  .attributes-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 32px;
  }
  
  .identity-meta {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .journal-entry {
    padding: 32px 24px;
  }
  
  .profile-name {
    font-size: 32px;
  }
  
  .avatar-seal {
    width: 120px;
    height: 120px;
  }
}
</style>
