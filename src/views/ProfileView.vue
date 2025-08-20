<template>
  <div class="page-container">
    <HeaderItem />
    
    <main class="profile-main">
      <div class="profile-container">
        <SectionTitle
          :eyebrow="t('myProfile')"
          :title="displayedUser?.nickname || t('profileTitle')"
          :subtitle="t('personalInfo')"
        />

        <!-- Loading state -->
        <div v-if="loading" class="profile-loading">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">{{ t('loading') }}</p>
        </div>

        <!-- Profile content -->
        <div v-else class="profile-content">
          <div class="profile-grid">
            <PersonalInfo
              :displayed-user="displayedUser"
              :subscription="subscription"
            />
            <VerificationPanel
              :displayed-user="displayedUser"
              :is-own-profile="isOwnProfile"
            />
            <TransactionHistory
              :displayed-user="displayedUser"
              :is-own-profile="isOwnProfile"
            />
            <ServerInfo :server-profile="serverProfile" :loading="catwalkLoading" />
            <ModerationPanel :target-user="displayedUser" />
          </div>
        </div>
      </div>
    </main>

    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useCatwalkStore } from "@/stores/catwalk";
import { useRoleStore } from "@/stores/roles";
import { useI18n } from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";
import PersonalInfo from "@/components/profile/PersonalInfo.vue";
import VerificationPanel from "@/components/profile/VerificationPanel.vue";
import TransactionHistory from "@/components/profile/TransactionHistory.vue";
import ServerInfo from "@/components/profile/ServerInfo.vue";
import ModerationPanel from "@/components/profile/ModerationPanel.vue";
import type { UserProfileDto } from "@/types/auth";
import { catwalkAPI } from "@/utils/api/catwalk";
import { punishmentsAPI } from "@/utils/api/punishments";

const { t } = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
const catwalkStore = useCatwalkStore();
const roleStore = useRoleStore();
const displayedUser = ref<UserProfileDto | null>(null);
const serverProfile = ref<{
  playtime?: string;
  magic_path?: string;
  residence?: string;
  magic_level?: number;
  experience_level?: number;
  warnings?: string;
  criminal_records?: number;
  server_role?: string;
} | null>(null);
const subscription = ref("");
const loading = ref(true);
const catwalkLoading = ref(false);

const isOwnProfile = computed(() => {
  const currentUser = authStore.currentUser;
  if (!currentUser || !displayedUser.value) return false;

  return currentUser.id === displayedUser.value.id;
});

const fetchUserProfile = async () => {
  // Ensure auth store has user data loaded
  if (
    !authStore.currentUser &&
    authStore.isAuthenticated &&
    !authStore.isLoading
  ) {
    await authStore.refreshUser();
  }

  // Use auth store as the primary source of user data
  displayedUser.value = authStore.currentUser;

  // Sync user store with auth store if needed
  if (authStore.currentUser && !userStore.currentUser) {
    userStore.user = authStore.currentUser;
  }
};

const loadProfile = async () => {
  loading.value = true;

  // Wait for auth store to finish loading if it's still initializing
  if (authStore.isLoading) {
    let attempts = 0;
    while (authStore.isLoading && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  await fetchUserProfile();

  if (displayedUser.value) {
    subscription.value = t('unavailable'); // Remove access field reference as it doesn't exist in current API

    serverProfile.value = {
      playtime: t('loading'),
      magic_path: t('loading'),
      residence: t('loading'),
      magic_level: 0,
      experience_level: 0,
      warnings: t('loading'),
      criminal_records: 0,
      server_role: t('loading'),
    };

    loading.value = false;

    if (displayedUser.value.nickname) {
      catwalkLoading.value = true;
      loadCatwalkData(displayedUser.value.nickname).finally(() => {
        catwalkLoading.value = false;
      });
    }
  } else {
    loading.value = false;
  }
};

const loadCatwalkData = async (minecraftNickname: string) => {
  try {
    await catwalkStore.fetchMagic(minecraftNickname);

    const [playerStats, punishments, townyData] = await Promise.all([
      catwalkAPI.getPlayerStats(),
      loadUserPunishments(),
      catwalkAPI.getTownyResident(minecraftNickname),
    ]);

    let playtime = t('unknown');
    if (playerStats?.playtime) {
      const totalSeconds = Math.floor(playerStats.playtime / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days > 0) {
        playtime = `${days}d ${remainingHours}h`;
      } else {
        playtime = `${hours}h ${minutes}m`;
      }
    }

    const experienceLevel = playerStats?.level || 0;

    let residence = t('unknown');
    if (townyData?.success && townyData.data?.townId) {
      try {
        const townData = await catwalkAPI.getTownyTown(townyData.data.townId);
        if (townData?.success && townData.data?.name) {
          residence = townData.data.name;
        }
      } catch (error) {
        console.error("Error fetching town name:", error);
      }
    }

    let serverRole = t('unknown');
    if (displayedUser.value?.role) {
      serverRole = roleStore.getRoleDisplayName(displayedUser.value.role);
    }

    serverProfile.value = {
      playtime,
      magic_path: catwalkStore.magic.translatedPathway || t('unknown'),
      residence,
      magic_level: catwalkStore.magic.sequence || 0,
      experience_level: experienceLevel,
      warnings: punishments.warnings || "0 / 8",
      criminal_records: punishments.criminal_records || 0,
      server_role: serverRole,
    };
  } catch (error) {
    console.error("Помилка при завантаженні даних Catwalk:", error);
    serverProfile.value = {
      playtime: t('unknown'),
      magic_path: catwalkStore.magic.translatedPathway || t('unknown'),
      residence: t('unknown'),
      magic_level: catwalkStore.magic.sequence || 0,
      experience_level: 0,
      warnings: "0 / 8",
      criminal_records: 0,
      server_role: t('unknown'),
    };
  }
};

const loadUserPunishments = async () => {
  try {
    if (!displayedUser.value) return { warnings: "0 / 8", criminal_records: 0 };

    // Use the current API endpoint for punishments
    const punishmentData = await punishmentsAPI.getList("", {
      filters: { user_id: displayedUser.value.id },
      params: { page: 0, size: 100 },
    });

    const warningCount = punishmentData.data.filter(
      (p) => p.type === "warn",
    ).length;
    const warnings = `${warningCount} / 8`;

    // Remove court system - no more criminal records from claims
    const criminal_records = 0;

    return {
      warnings,
      criminal_records,
    };
  } catch (error) {
    console.error("Error loading punishments:", error);
    return { warnings: "0 / 8", criminal_records: 0 };
  }
};

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await loadProfile();
});
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  position: relative;
}

/* Profile Main */
.profile-main {
  background: var(--myst-bg);
  padding: 80px 0;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Loading state styles */
.profile-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top: 3px solid var(--myst-gold);
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--myst-ink-strong);
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

/* Profile Content */
.profile-content {
  margin-top: 48px;
}

.profile-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .profile-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Profile sections should span full width for some components */
.profile-grid :deep(.personal-info-card),
.profile-grid :deep(.server-info-card),
.profile-grid :deep(.verification-panel-card),
.profile-grid :deep(.transaction-history),
.profile-grid :deep(.moderation-panel) {
  grid-column: 1 / -1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .profile-main {
    padding: 40px 0;
  }
  
  .profile-container {
    padding: 0 16px;
  }
  
  .profile-content {
    margin-top: 32px;
  }
  
  .profile-grid {
    gap: 16px;
  }
}
</style>
