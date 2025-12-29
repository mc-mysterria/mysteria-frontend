<template>
  <div class="page-container">
    <HeaderItem/>

    <main class="profile-main">
      <div class="profile-container">
        <SectionTitle
            :eyebrow="t('myProfile')"
            :subtitle="t('personalInfo')"
            :title="displayedUser?.nickname || t('profileTitle')"
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
            <BeyonderStatus
                v-if="beyonderData && !beyonderLoading"
                :beyonder-data="beyonderData"
            />
            <VerificationPanel
                :displayed-user="displayedUser"
                :is-own-profile="isOwnProfile"
            />
            <TransactionHistory
                :displayed-user="displayedUser"
                :is-own-profile="isOwnProfile"
            />
          </div>
        </div>
      </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/auth";
import {useUserStore} from "@/stores/user";
import {useI18n} from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";
import PersonalInfo from "@/components/profile/PersonalInfo.vue";
import VerificationPanel from "@/components/profile/VerificationPanel.vue";
import TransactionHistory from "@/components/profile/TransactionHistory.vue";
import type {UserProfileDto} from "@/types/auth";
import type {BeyonderData, BeyonderResponse} from "@/types/users";
import BeyonderStatus from "@/components/profile/BeyonderStatus.vue";

const {t} = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
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
const beyonderData = ref<BeyonderData | null>(null);
const beyonderLoading = ref(false);

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

const fetchBeyonderData = async (nickname: string) => {
  beyonderLoading.value = true;
  try {
    const response = await fetch(`/catwalk/pathway/single/${nickname}`);
    const result: BeyonderResponse = await response.json();

    if (result.success && result.data.beyonder) {
      beyonderData.value = result.data;
    } else {
      beyonderData.value = null;
    }
  } catch (error) {
    console.error('Failed to fetch beyonder data:', error);
    beyonderData.value = null;
  } finally {
    beyonderLoading.value = false;
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
    // Fetch beyonder data if user is verified
    if (displayedUser.value.verified && displayedUser.value.nickname) {
      await fetchBeyonderData(displayedUser.value.nickname);
    }

    subscription.value = t('unavailable');

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
  } else {
    loading.value = false;
  }
};

onMounted(async () => {
  window.scrollTo({top: 0, behavior: 'smooth'});
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
.profile-grid :deep(.beyonder-status-container),
.profile-grid :deep(.verification-panel),
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
