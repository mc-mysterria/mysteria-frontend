<template>
  <!-- Season announcement, shown above the header on the pages that ask for it -->
  <div v-if="showAnnouncement && announcement && !announcementDismissed" class="season-bar">
    <span class="season-headline">{{ announcement.headline }}</span>
    <span class="season-divider" aria-hidden="true">†</span>
    <RouterLink v-if="announcement.to" class="season-link" :to="announcement.to">
      {{ announcement.linkLabel }} →
    </RouterLink>
    <button :aria-label="t('header.closeNav')" class="season-dismiss" @click="dismissAnnouncement">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>

  <header class="site-header">
    <div class="header-grid">
      <RouterLink class="brand" to="/" @click="closeMobileNav">
        <img :src="logo" alt="Mysterria" class="brand-mark" width="38" height="38">
        <span class="brand-words">
          <span class="brand-name">Mysterria</span>
          <span class="brand-tagline">{{ t('header.tagline') }}</span>
        </span>
      </RouterLink>

      <nav ref="navigationRef" class="primary-nav" :aria-label="t('header.navLabel')">
        <RouterLink
            v-for="link in navigationLinks"
            :key="link.path"
            :class="['nav-link', { active: isActive(link) }]"
            :to="link.path"
        >
          {{ link.title }}
          <span v-if="isActive(link)" class="nav-underline" aria-hidden="true"></span>
        </RouterLink>
      </nav>

      <div class="header-actions">
        <BalanceButton v-if="isAuthenticated" class="header-chip"/>
        <ServerStatusChip v-else class="header-chip"/>

        <LanguageSelector class="desktop-only"/>
        <NotificationBell v-if="isAuthenticated" class="desktop-only"/>
        <AuthButton class="desktop-only"/>

        <button
            :aria-expanded="isMobileNavOpen"
            :aria-label="t('header.toggleNav')"
            class="mobile-nav-toggle"
            @click="toggleMobileNav"
        >
          <IconNavbar/>
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="mobile-nav">
      <div v-if="isMobileNavOpen" class="mobile-nav-overlay">
        <div class="mobile-nav-backdrop" @click="closeMobileNav"></div>
        <nav class="mobile-nav">
          <div class="mobile-nav-header">
            <RouterLink class="brand compact" to="/" @click="closeMobileNav">
              <img :src="logo" alt="" class="brand-mark" width="30" height="30">
              <span class="brand-name">Mysterria</span>
            </RouterLink>
            <button :aria-label="t('header.closeNav')" class="mobile-nav-close" @click="closeMobileNav">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mobile-nav-content">
            <RouterLink
                v-for="link in navigationLinks"
                :key="link.path"
                :class="['mobile-nav-link', { active: isActive(link) }]"
                :to="link.path"
                @click="closeMobileNav"
            >
              {{ link.title }}
            </RouterLink>

            <div class="mobile-services">
              <p class="mobile-section-label">{{ t('navServices') }}</p>
              <a
                  v-for="service in servicesLinks"
                  :key="service.url"
                  :href="service.url"
                  class="mobile-service-link"
                  rel="noopener noreferrer"
                  target="_blank"
                  @click="closeMobileNav"
              >
                <component :is="service.icon" class="mobile-service-icon"/>
                <span>
                  <strong>{{ service.name }}</strong>
                  <small>{{ service.description }}</small>
                </span>
              </a>
            </div>

            <div class="mobile-nav-footer">
              <ServerStatusChip class="mobile-ip"/>
              <LanguageSelector/>
              <NotificationBell v-if="isAuthenticated"/>
              <AuthButton mobile-mode @mobile-action="closeMobileNav"/>
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {computed, onUnmounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import AuthButton from "@/components/ui/AuthButton.vue";
import BalanceButton from "@/components/ui/BalanceButton.vue";
import NotificationBell from "@/components/notifications/NotificationBell.vue";
import LanguageSelector from "@/components/ui/LanguageSelector.vue";
import ServerStatusChip from "@/components/ui/ServerStatusChip.vue";
import IconNavbar from "@/assets/icons/IconNavbar.vue";
import IconMap from "@/assets/icons/IconMap.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import {useI18n} from "@/composables/useI18n";
import {SEASON_ANNOUNCEMENT_SLUG} from "@/constants/season";
import {useAuthStore} from "@/stores/auth";
import logo from "@/assets/icons/sources/IconLogo.webp";

interface NavLink {
  path: string;
  title: string;
  /** Extra path prefixes that should light this link up. */
  matches?: string[];
}

withDefaults(defineProps<{ showAnnouncement?: boolean }>(), {showAnnouncement: false});

const route = useRoute();
const {t} = useI18n();
const authStore = useAuthStore();
const isMobileNavOpen = ref(false);
const navigationRef = ref<HTMLElement | null>(null);

const isAuthenticated = computed(() => authStore.isAuthenticated);

const navigationLinks = computed<NavLink[]>(() => [
  {path: "/", title: t("navHome")},
  {path: "/guide", title: t("navGame")},
  {path: "/pathways", title: t("navPathways")},
  {path: "/store", title: t("navShop"), matches: ["/services"]},
  {path: "/rules", title: t("navRules")},
  {path: "/news", title: t("navNews")},
]);

const announcement = computed(() => {
  const headline = t("header.seasonHeadline");
  if (!headline || headline === "header.seasonHeadline") return null;
  return {
    headline,
    linkLabel: t("header.seasonLink"),
    to: SEASON_ANNOUNCEMENT_SLUG ? `/news/${SEASON_ANNOUNCEMENT_SLUG}` : "/news",
  };
});

/* The bar is copy-driven; dismissal is keyed to the copy so a new announcement
   shows again for people who dismissed the previous one. */
const ANNOUNCEMENT_KEY = "myst-season-bar-dismissed";
const announcementDismissed = ref(false);

const announcementId = computed(() => announcement.value?.headline ?? "");

try {
  announcementDismissed.value = localStorage.getItem(ANNOUNCEMENT_KEY) === announcementId.value;
} catch {
  announcementDismissed.value = false;
}

const dismissAnnouncement = () => {
  announcementDismissed.value = true;
  try {
    localStorage.setItem(ANNOUNCEMENT_KEY, announcementId.value);
  } catch {
    // Storage unavailable — the bar simply returns on the next visit.
  }
};

const servicesLinks = computed(() => [
  {
    name: t("navWiki"),
    description: t("servicesWikiDesc"),
    url: "https://wiki.mysterria.net/",
    icon: IconWiki,
  },
  {
    name: t("servicesDiscord"),
    description: t("servicesDiscordDesc"),
    url: "https://discord.com/invite/jc7GSxBWgb",
    icon: IconDiscord,
  },
  {
    name: t("servicesMap"),
    description: t("servicesMapDesc"),
    url: "https://map.mysterria.net/",
    icon: IconMap,
  },
]);

const isActive = (link: NavLink) => {
  if (link.path === "/") return route.path === "/";
  if (route.path.startsWith(link.path)) return true;
  return (link.matches ?? []).some(prefix => route.path.startsWith(prefix));
};

const toggleMobileNav = () => (isMobileNavOpen.value = !isMobileNavOpen.value);
const closeMobileNav = () => (isMobileNavOpen.value = false);

watch(isMobileNavOpen, isOpen => {
  document.body.style.overflow = isOpen ? "hidden" : "";
});

watch(() => route.path, closeMobileNav);

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* ---- Season announcement ---- */
.season-bar {
  position: relative;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  flex-wrap: wrap;
  padding: 9px 16px;
  background: linear-gradient(90deg, rgba(200, 178, 115, 0), rgba(200, 178, 115, 0.12), rgba(200, 178, 115, 0));
  border-bottom: 1px solid var(--myst-line-18);
}

.season-headline,
.season-link {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.season-headline {
  letter-spacing: 0.28em;
  color: var(--myst-gold);
}

.season-divider {
  color: var(--myst-line-40);
  font-size: 10px;
}

.season-link {
  letter-spacing: 0.2em;
  color: var(--myst-ink-muted);
}

.season-link:hover {
  color: var(--myst-gold);
}

.season-dismiss {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--myst-line-40);
  font-size: 12px;
  transition: color 0.25s ease;
}

.season-dismiss:hover {
  color: var(--myst-gold);
}

@media (max-width: 560px) {
  .season-bar {
    padding-right: 40px;
  }
}

/* ---- Header shell ---- */
.site-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: color-mix(in srgb, var(--myst-bg) 78%, transparent);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--myst-line-14);
}

.header-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: var(--myst-header-height);
  gap: 18px;
}

/* ---- Brand ---- */
.brand {
  display: flex;
  align-items: center;
  gap: 13px;
  justify-self: start;
  color: inherit;
}

.brand:hover {
  color: inherit;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: block;
  filter: drop-shadow(0 0 8px rgba(200, 178, 115, 0.35));
}

.brand-words {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-name {
  font-family: var(--myst-font-display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--myst-offwhite);
}

.brand-tagline {
  margin-top: 4px;
  font-family: var(--myst-font-mono);
  font-size: 8.5px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.brand.compact .brand-mark {
  width: 30px;
  height: 30px;
}

/* ---- Nav ---- */
.primary-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-self: center;
  min-width: 0;
}

.nav-link {
  position: relative;
  padding: 10px 12px;
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  white-space: nowrap;
  transition: color 0.25s ease;
}

.nav-link:hover,
.nav-link.active {
  color: var(--myst-gold);
}

.nav-underline {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 2px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
}

/* ---- Actions ---- */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
}

.mobile-nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 36px;
  background: var(--myst-wash);
  border: 1px solid var(--myst-line-28);
  border-radius: 2px;
  color: var(--myst-gold);
  cursor: pointer;
  transition: all 0.25s ease;
}

.mobile-nav-toggle:hover {
  border-color: var(--myst-gold);
  background: var(--myst-wash-strong);
}

/* ---- Responsive ladder from the handoff ---- */
@media (max-width: 1220px) {
  .header-actions :deep(.lang-ritual-selector) {
    display: none;
  }
}

@media (max-width: 1140px) {
  .header-chip {
    display: none;
  }
}

@media (max-width: 960px) {
  .brand-tagline {
    display: none;
  }

  .nav-link {
    padding: 8px 8px;
    letter-spacing: 0.06em;
    font-size: 10.5px;
  }
}

@media (max-width: 800px) {
  .primary-nav {
    display: none;
  }

  .desktop-only {
    display: none;
  }

  .mobile-nav-toggle {
    display: flex;
  }

  .header-grid {
    padding: 0 16px;
  }
}

/* ---- Mobile drawer ---- */
.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
}

.mobile-nav-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.mobile-nav {
  position: relative;
  width: 100%;
  max-width: 330px;
  height: 100dvh;
  background: var(--myst-bg-deep);
  border-right: 1px solid var(--myst-line-16);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--myst-line-14);
}

.mobile-nav-close {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 1px solid var(--myst-line-20);
  border-radius: 2px;
  color: var(--myst-gold);
  cursor: pointer;
}

.mobile-nav-content {
  flex: 1;
  padding: 20px 0 32px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 15px 24px;
  border-left: 2px solid transparent;
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  transition: all 0.25s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: var(--myst-gold);
  border-left-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.06);
}

.mobile-services {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--myst-line-12);
}

.mobile-section-label {
  margin: 0 0 8px;
  padding: 0 24px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.mobile-service-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 24px;
  color: inherit;
}

.mobile-service-link:hover {
  background: rgba(200, 178, 115, 0.05);
  color: inherit;
}

.mobile-service-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--myst-gold);
}

.mobile-service-link span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-service-link strong {
  color: var(--myst-offwhite);
  font-size: 14px;
  font-weight: 600;
}

.mobile-service-link small {
  color: var(--myst-ink-muted);
  font-size: 11px;
}

.mobile-nav-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 20px 24px 0;
  border-top: 1px solid var(--myst-line-12);
}

.mobile-ip {
  width: 100%;
  justify-content: center;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.3s ease;
}

.mobile-nav-enter-active .mobile-nav,
.mobile-nav-leave-active .mobile-nav {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}

.mobile-nav-enter-from .mobile-nav,
.mobile-nav-leave-to .mobile-nav {
  transform: translateX(-100%);
}
</style>
