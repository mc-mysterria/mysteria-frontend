<template>
  <div class="profile-page">
    <HeaderItem/>

    <main class="dossier myst-shell">
      <!-- Loading -->
      <div v-if="loading" class="dossier-loading">
        <div class="dossier-spinner" aria-hidden="true"></div>
        <p>{{ t('loading') }}</p>
      </div>

      <template v-else>
        <header class="dossier-head">
          <div>
            <p class="myst-eyebrow">{{ t('profilePage.eyebrow') }}</p>
            <h1 class="dossier-name">{{ displayedUser?.nickname || t('profileTitle') }}</h1>
            <div class="dossier-meta">
              <span :class="['meta-verified', { unverified: !displayedUser?.verified }]">
                <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
                {{ displayedUser?.verified ? t('profilePage.verified') : t('profilePage.unverified') }}
              </span>
              <span class="meta-divider" aria-hidden="true">†</span>
              <span class="meta-item">{{ t('profilePage.role') }}: {{ displayRole }}</span>
              <template v-if="subscription">
                <span class="meta-divider" aria-hidden="true">†</span>
                <span class="meta-item">{{ subscription }}</span>
              </template>
            </div>
          </div>

          <button class="myst-btn-outline logout" type="button" @click="handleLogout">
            <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
            {{ t('profilePage.logOut') }}
          </button>
        </header>

        <div class="dossier-grid">
          <aside class="dossier-left">
            <BeyonderStatus v-if="beyonderData && !beyonderLoading" :beyonder-data="beyonderData"/>
            <div v-else-if="!beyonderLoading" class="no-beyonder myst-panel">
              <i class="fa-solid fa-flask" aria-hidden="true"></i>
              <p>{{ t('profilePage.noBeyonder') }}</p>
            </div>

            <CommissionsCard :is-own-profile="isOwnProfile"/>
          </aside>

          <div class="dossier-right">
            <section class="stat-cards">
              <div class="stat-card myst-panel">
                <span class="myst-micro">{{ t('profilePage.balance') }}</span>
                <div class="stat-primary">
                  <IconMark class="stat-mark"/>
                  {{ formattedBalance }}
                </div>
                <RouterLink class="stat-link" to="/store">{{ t('profilePage.topUp') }} →</RouterLink>
              </div>

              <div class="stat-card myst-panel">
                <span class="myst-micro">{{ t('profilePage.subscription') }}</span>
                <div class="stat-secondary">{{ subscription || t('unavailable') }}</div>
              </div>

              <div class="stat-card myst-panel">
                <span class="myst-micro">{{ t('profilePage.account') }}</span>
                <div :class="['stat-secondary', displayedUser?.verified ? 'is-verified' : 'is-unverified']">
                  <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
                  {{ displayedUser?.verified ? t('profilePage.verified') : t('profilePage.unverified') }}
                </div>
                <span v-if="displayedUser?.discordId" class="stat-note">
                  {{ t('profilePage.discordId') }} {{ maskedDiscordId }}
                </span>
              </div>
            </section>

            <VerificationPanel
                :displayed-user="displayedUser"
                :is-own-profile="isOwnProfile"
            />

            <TransactionHistory
                :displayed-user="displayedUser"
                :is-own-profile="isOwnProfile"
            />

            <section class="cross-links">
              <RouterLink class="cross-card myst-panel" to="/guide">
                <span class="cross-icon"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span>
                <span>
                  <strong>{{ t('profilePage.crossGuideTitle') }}</strong>
                  <small>{{ t('profilePage.crossGuideBody') }}</small>
                </span>
              </RouterLink>

              <RouterLink class="cross-card myst-panel" :to="pathwayLink">
                <span class="cross-icon"><i class="fa-solid fa-layer-group" aria-hidden="true"></i></span>
                <span>
                  <strong>{{ t('profilePage.crossPathwayTitle') }}</strong>
                  <small>{{ t('profilePage.crossPathwayBody') }}</small>
                </span>
              </RouterLink>
            </section>
          </div>
        </div>
      </template>
    </main>

    <FooterItem/>
    <DailyBonusCat page="profile"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/auth";
import {useUserStore} from "@/stores/user";
import {useBalanceStore} from "@/stores/balance";
import {useI18n} from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import DailyBonusCat from "@/components/ui/DailyBonusCat.vue";
import BeyonderStatus from "@/components/profile/BeyonderStatus.vue";
import VerificationPanel from "@/components/profile/VerificationPanel.vue";
import TransactionHistory from "@/components/profile/TransactionHistory.vue";
import CommissionsCard from "@/components/profile/CommissionsCard.vue";
import IconMark from "@/assets/icons/IconMark.vue";
import {useSeo} from "@/composables/useSeo";
import type {UserProfileDto} from "@/types/auth";
import type {BeyonderData, BeyonderResponse} from "@/types/users";

const {t, currentLanguage} = useI18n();
const authStore = useAuthStore();
const userStore = useUserStore();
const balanceStore = useBalanceStore();

// Per-account content: useful to the reader, never to the index.
useSeo(() => ({
  title: t("profilePage.eyebrow"),
  description: "Your Mysterria Beyonder dossier: pathway, Sequence, balance and verification.",
  path: "/profile",
  noindex: true,
}));

const displayedUser = ref<UserProfileDto | null>(null);
const subscription = ref("");
const loading = ref(true);
const beyonderData = ref<BeyonderData | null>(null);
const beyonderLoading = ref(false);

const isOwnProfile = computed(() => {
  const currentUser = authStore.currentUser;
  if (!currentUser || !displayedUser.value) return false;
  return currentUser.id === displayedUser.value.id;
});

const displayRole = computed(() => displayedUser.value?.role || t('unknown'));

const formattedBalance = computed(() => {
  const amount = balanceStore.currentBalance?.amount;
  if (amount === undefined || amount === null) return "—";
  return Number(amount).toLocaleString(currentLanguage.value === "uk" ? "uk-UA" : "en-US");
});

/** Discord IDs are long; show only the ends, as the dossier design does. */
const maskedDiscordId = computed(() => {
  const id = String(displayedUser.value?.discordId ?? "");
  return id.length > 9 ? `${id.slice(0, 6)}…${id.slice(-3)}` : id;
});

const pathwayLink = computed(() =>
    beyonderData.value?.pathway ? `/pathways/${beyonderData.value.pathway.toLowerCase()}` : "/pathways",
);

const handleLogout = () => authStore.logout();

const fetchUserProfile = async () => {
  if (!authStore.currentUser && authStore.isAuthenticated && !authStore.isLoading) {
    await authStore.refreshUser();
  }

  displayedUser.value = authStore.currentUser;

  if (authStore.currentUser && !userStore.currentUser) {
    userStore.user = authStore.currentUser;
  }
};

const fetchBeyonderData = async () => {
  const authToken = authStore.currentToken;
  if (!authToken) {
    beyonderData.value = null;
    return;
  }

  beyonderLoading.value = true;
  try {
    // The nickname is resolved server-side from this token, never sent by the
    // client, so this can only ever return the logged-in player's own data.
    const response = await fetch('/api/beyonder-self', {
      headers: {Authorization: `Bearer ${authToken}`},
    });
    const result: BeyonderResponse = await response.json();
    beyonderData.value = result.success && result.data.beyonder ? result.data : null;
  } catch (error) {
    console.error('Failed to fetch beyonder data:', error);
    beyonderData.value = null;
  } finally {
    beyonderLoading.value = false;
  }
};

const loadProfile = async () => {
  loading.value = true;

  if (authStore.isLoading) {
    let attempts = 0;
    while (authStore.isLoading && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  await fetchUserProfile();

  if (displayedUser.value) {
    if (displayedUser.value.verified && displayedUser.value.nickname) {
      await fetchBeyonderData();
    }
    if (!balanceStore.balance) {
      await balanceStore.fetchBalance().catch(() => undefined);
    }
  }

  loading.value = false;
};

onMounted(loadProfile);
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.dossier {
  flex: 1 0 auto;
  width: 100%;
  padding: 64px 24px 90px;
}

/* Head */
.dossier-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 44px;
}

.dossier-name {
  margin: 12px 0 0;
  font-family: var(--myst-font-display);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 800;
  line-height: 1.05;
  color: var(--myst-offwhite);
  overflow-wrap: anywhere;
}

.dossier-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.meta-verified,
.meta-item {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.meta-verified {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-green-soft);
}

.meta-verified.unverified {
  color: var(--myst-amber);
}

.meta-item {
  color: var(--myst-ink-muted);
}

.meta-divider {
  color: var(--myst-line-35);
}

.logout {
  padding: 12px 24px;
  font-size: 11px;
  border-color: var(--myst-line-35);
}

/* Grid */
.dossier-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 28px;
  align-items: start;
}

.dossier-left,
.dossier-right {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.no-beyonder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 30px;
  text-align: center;
  color: var(--myst-ink-muted);
}

.no-beyonder i {
  color: rgba(200, 178, 115, 0.45);
  font-size: 28px;
}

.no-beyonder p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

/* Stat cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  padding: 24px 26px;
}

.stat-card .myst-micro {
  display: block;
  margin-bottom: 10px;
}

.stat-primary {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: var(--myst-font-mono);
  font-size: 26px;
  font-weight: 800;
  color: var(--myst-gold);
}

.stat-mark {
  font-size: 22px;
  opacity: 0.85;
}

.stat-secondary {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 600;
  color: var(--myst-offwhite);
}

.stat-secondary.is-verified {
  color: var(--myst-green-soft);
}

.stat-secondary.is-unverified {
  color: var(--myst-amber);
}

.stat-secondary i {
  font-size: 13px;
}

.stat-link,
.stat-note {
  display: inline-block;
  margin-top: 14px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.stat-link:hover {
  color: var(--myst-gold);
}

/* Cross links */
.cross-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.cross-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
  color: inherit;
  transition: border-color 0.3s ease;
}

.cross-card:hover {
  border-color: var(--myst-line-55);
  color: inherit;
}

.cross-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: rgba(200, 178, 115, 0.08);
  border: 1px solid var(--myst-line-20);
  color: var(--myst-gold);
}

.cross-card strong {
  display: block;
  margin-bottom: 3px;
  color: var(--myst-offwhite);
  font-size: 15px;
}

.cross-card small {
  color: var(--myst-ink-muted);
  font-size: 12.5px;
}

/* Loading */
.dossier-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 50vh;
  color: var(--myst-ink-muted);
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.dossier-spinner {
  width: 34px;
  height: 34px;
  border: 2px solid var(--myst-line-20);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: dossierSpin 0.9s linear infinite;
}

@keyframes dossierSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1080px) {
  .dossier-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .dossier {
    padding: 40px 20px 70px;
  }

  .stat-cards,
  .cross-links {
    grid-template-columns: 1fr;
  }
}
</style>
