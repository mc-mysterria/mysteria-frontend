<template>
  <ProfileHeader />
  <Sidebar ref="sidebarRef" />
  <div class="main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <div class="profile-container">
      <div v-if="loading" class="loadingSpinner"></div>
      <div v-else>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useCatwalkStore } from "@/stores/catwalk";
import { useRoleStore } from "@/stores/roles";
import ProfileHeader from "@/components/profile/ProfileHeader.vue";
import PersonalInfo from "@/components/profile/PersonalInfo.vue";
import VerificationPanel from "@/components/profile/VerificationPanel.vue";
import TransactionHistory from "@/components/profile/TransactionHistory.vue";
import ServerInfo from "@/components/profile/ServerInfo.vue";
import ModerationPanel from "@/components/profile/ModerationPanel.vue";
import Sidebar from "@/components/layout/SidebarItem.vue";
import type { UserProfileDto } from "@/types/auth";
import { catwalkAPI } from "@/utils/api/catwalk";
import { punishmentsAPI } from "@/utils/api/punishments";

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
const sidebarCollapsed = ref(false);

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
    subscription.value = "Відсутня"; // Remove access field reference as it doesn't exist in current API

    serverProfile.value = {
      playtime: "Завантаження...",
      magic_path: "Завантаження...",
      residence: "Завантаження...",
      magic_level: 0,
      experience_level: 0,
      warnings: "Завантаження...",
      criminal_records: 0,
      server_role: "Завантаження...",
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

    let playtime = "Невідомо";
    if (playerStats?.playtime) {
      const totalSeconds = Math.floor(playerStats.playtime / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days > 0) {
        playtime = `${days} днів ${remainingHours} годин`;
      } else {
        playtime = `${hours}г ${minutes}хв`;
      }
    }

    const experienceLevel = playerStats?.level || 0;

    let residence = "Невідомо";
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

    let serverRole = "Гравець";
    if (displayedUser.value?.role) {
      serverRole = roleStore.getRoleDisplayName(displayedUser.value.role);
    }

    serverProfile.value = {
      playtime,
      magic_path: catwalkStore.magic.translatedPathway || "Невідомо",
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
      playtime: "Невідомо",
      magic_path: catwalkStore.magic.translatedPathway || "Невідомо",
      residence: "Невідомо",
      magic_level: catwalkStore.magic.sequence || 0,
      experience_level: 0,
      warnings: "0 / 8",
      criminal_records: 0,
      server_role: "Невідомо",
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

const updateSidebarState = () => {
  const collapsed = localStorage.getItem("sidebarCollapsed");
  sidebarCollapsed.value = collapsed === "true";
};

const handleStorageChange = () => {
  updateSidebarState();
};

onMounted(async () => {
  await loadProfile();
  updateSidebarState();
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("sidebar-toggle", updateSidebarState);
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("sidebar-toggle", updateSidebarState);
});
</script>

<style scoped>
.main {
  margin-left: 280px;
  padding: 40px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d23 100%);
  color: #ffffff;
  transition: margin-left 0.3s ease;
}

.main.sidebar-collapsed {
  margin-left: 90px;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.loadingSpinner {
  width: 50px;
  height: 50px;
  border: 5px solid #b4bbc5;
  border-top: 5px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 100px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .main {
    margin-left: 240px;
  }

  .main.sidebar-collapsed {
    margin-left: 70px;
  }
}

@media (max-width: 576px) {
  .main {
    margin-left: 0;
    padding: 20px 15px 120px 15px;
  }

  .main.sidebar-collapsed {
    margin-left: 0;
  }

  .profile-container {
    max-width: 100%;
    padding: 0;
  }
}
</style>
