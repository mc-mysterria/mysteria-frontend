<template>
  <header class="main-header">
    <div class="header-content">
      <RouterLink to="/" @click="closeMobileNav" class="header-logo-link">
        <IconLogo />
        <span class="logo-text">Mysterria</span>
      </RouterLink>

      <nav class="navigation" ref="navigationRef">
        <component
          v-for="link in navigationLinks"
          :key="link.path"
          :is="link.external ? 'a' : 'RouterLink'"
          v-bind="getNavLinkProps(link)"
          :class="[
            'nav-link',
            { active: !link.external && route.path === link.path },
          ]"
          :data-path="link.path"
        >
          {{ link.title }}
        </component>

        <!-- Services Dropdown -->
        <div class="services-dropdown" @mouseenter="clearCloseServicesTimeout" @mouseleave="scheduleCloseServicesDropdown">
          <button
            @click="toggleServicesDropdown"
            @mouseenter="openServicesDropdown"
            :class="['nav-link', 'services-trigger', { 'active': isServicesOpen }]"
          >
            {{ t('navServices') }}
            <span v-if="showServicesDot" class="attention-dot" aria-hidden="true"></span>
            <svg
              class="dropdown-arrow"
              :class="{ 'rotate': isServicesOpen }"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          <Transition name="dropdown">
            <div v-if="isServicesOpen" class="services-dropdown-menu" @mouseenter="clearCloseServicesTimeout" @mouseleave="scheduleCloseServicesDropdown">
              <a
                v-for="service in servicesLinks"
                :key="service.url"
                :href="service.url"
                target="_blank"
                rel="noopener noreferrer"
                class="service-link"
                @click="closeServicesDropdown"
              >
                <component :is="service.icon" class="service-icon" />
                <div class="service-info">
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-description">{{ service.description }}</span>
                </div>
                <svg class="external-link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15,3 21,3 21,9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </Transition>
        </div>
      </nav>

      <div class="header-actions">
        <ThemeToggle />
        <LanguageSelector class="language-desktop" />
        <BalanceButton class="balance-desktop" />
        <AuthButton class="auth-desktop" />
        <button
          @click="toggleMobileNav"
          class="mobile-nav-toggle"
          :aria-expanded="isMobileNavOpen"
          aria-label="Toggle navigation"
        >
          <IconNavbar />
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
            <button
              @click="closeMobileNav"
              class="mobile-nav-close"
              aria-label="Close navigation"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="mobile-nav-content">
            <component
              v-for="link in navigationLinks"
              :key="link.path"
              :is="link.external ? 'a' : 'RouterLink'"
              v-bind="getNavLinkProps(link)"
              :class="[
                'mobile-nav-link',
                { active: !link.external && route.path === link.path },
              ]"
              @click="closeMobileNav"
            >
              {{ link.title }}
            </component>

            <!-- Mobile Services Links -->
            <div class="mobile-services-section">
              <div class="mobile-services-header">{{ t('navServices') }}
                              <span v-if="showServicesDot" class="attention-dot mobile" aria-hidden="true"></span>
                            </div>
              <a
                v-for="service in servicesLinks"
                :key="service.url"
                :href="service.url"
                target="_blank"
                rel="noopener noreferrer"
                class="mobile-service-link"
                @click="closeMobileNav"
              >
                <component :is="service.icon" class="mobile-service-icon" />
                <div class="mobile-service-info">
                  <span class="mobile-service-name">{{ service.name }}</span>
                  <span class="mobile-service-description">{{ service.description }}</span>
                </div>
              </a>
            </div>

            <div class="mobile-nav-auth">
              <div class="mobile-language-selector">
                <LanguageSelector />
              </div>
              <div class="mobile-balance-wrapper">
                <BalanceButton />
              </div>
              <AuthButton mobile-mode @mobile-action="closeMobileNav" />
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AuthButton from "@/components/ui/AuthButton.vue";
import BalanceButton from "@/components/ui/BalanceButton.vue";
import LanguageSelector from "@/components/ui/LanguageSelector.vue";
import ThemeToggle from "@/components/ui/ThemeToggle.vue";
import IconLogo from "@/assets/icons/IconLogo.vue";
import IconNavbar from "@/assets/icons/IconNavbar.vue";
import IconArchive from "@/assets/icons/IconArchive.vue";
import IconMap from "@/assets/icons/IconMap.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import { useI18n } from "@/composables/useI18n";

interface NavLink {
  path: string;
  title: string;
  external?: boolean;
  target?: string;
  rel?: string;
}

const route = useRoute();
const { t } = useI18n();
const isMobileNavOpen = ref(false);
const isServicesOpen = ref(false);
let closeDropdownTimeout: NodeJS.Timeout | null = null;

// Show a small attention dot on the Services trigger until user opens it once.
const showServicesDot = ref(true);
try {
  showServicesDot.value = !localStorage.getItem('servicesDotDismissed_v1');
} catch {
  // If localStorage is unavailable, default to showing the dot.
  showServicesDot.value = true;
}

const markServicesSeen = () => {
  if (showServicesDot.value) {
    showServicesDot.value = false;
    try {
      localStorage.setItem('servicesDotDismissed_v1', '1');
    } catch {
      // ignore storage errors
    }
  }
};

const navigationLinks = computed<NavLink[]>(() => [
  { path: "/", title: t("navHome") || "Home" },
  { path: "/guide", title: t("navGame") || "Guide" },
  { path: "/rules", title: t("navRules") || "Rules" },
  { path: "https://forum.mysterria.net", title: t("navForum") || "Forum", external: true, target: "_blank", rel: "noopener noreferrer" },
  { path: "/store", title: t("navShop") || "Shop" },
]);

const iconComponents = {
  IconArchive,
  IconMap,
  IconWiki,
  IconDiscord
};

const servicesLinks = computed(() => [
  {
    name: t("navWiki") || "Wiki",
    description: t("servicesWikiDesc") || "Knowledge base & guides",
    url: "https://wiki.mysterria.net/en",
    icon: iconComponents.IconWiki
  },
  {
    name: t("servicesDiscord") || "Discord",
    description: t("servicesDiscordDesc") || "Join our community",
    url: "https://discord.com/invite/jc7GSxBWgb",
    icon: iconComponents.IconDiscord
  },
  {
    name: t("servicesArchive") || "Archive",
    description: t("servicesArchiveDesc") || "Browse past content",
    url: "https://archive.mysterria.net/",
    icon: iconComponents.IconArchive
  },
  {
    name: t("servicesMap") || "Live Map",
    description: t("servicesMapDesc") || "Explore the world",
    url: "https://map.mysterria.net/",
    icon: iconComponents.IconMap
  }
]);

const getNavLinkProps = (link: NavLink) => {
  if (link.external) {
    return {
      href: link.path,
      target: link.target,
      rel: link.rel,
    };
  }
  return {
    to: link.path,
  };
};

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value;
};

const closeMobileNav = () => {
  isMobileNavOpen.value = false;
};

const toggleServicesDropdown = () => {
  if (!isServicesOpen.value) {
    markServicesSeen();
  }
  isServicesOpen.value = !isServicesOpen.value;
};

const clearCloseServicesTimeout = () => {
  if (closeDropdownTimeout) {
    clearTimeout(closeDropdownTimeout);
    closeDropdownTimeout = null;
  }
};

const scheduleCloseServicesDropdown = () => {
  clearCloseServicesTimeout();
  closeDropdownTimeout = setTimeout(() => {
    isServicesOpen.value = false;
    closeDropdownTimeout = null;
  }, 220);
};

const openServicesDropdown = () => {
  clearCloseServicesTimeout();
  markServicesSeen();
  isServicesOpen.value = true;
};

const closeServicesDropdown = () => {
  clearCloseServicesTimeout();
  isServicesOpen.value = false;
};

watch(isMobileNavOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
  clearCloseServicesTimeout();
});
</script>

<style scoped>
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 16px;
  gap: 24px;
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid color-mix(in srgb, white 15%, transparent);
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  gap: 24px;
}

.header-logo-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--myst-ink);
  transition: all 0.3s ease;
}

.header-logo-link:hover {
  color: var(--myst-gold);
}

.logo-text {
  font-family: "Inter", serif;
  font-size: 18px;
  font-weight: 600;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .navigation {
    display: none;
  }
}

.nav-link {
  padding: 10px 16px;
  border-radius: 6px;
  color: #a1a1aa;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 60px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.nav-link:hover {
  color: var(--myst-ink-strong);
}

.nav-link.active {
  color: var(--myst-ink-strong);
  background: color-mix(in srgb, white 5%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.mobile-nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  color: var(--myst-ink);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

:root[data-theme="parchment"] .mobile-nav-toggle {
  background: var(--myst-bg-2);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.mobile-nav-toggle:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

:root[data-theme="parchment"] .mobile-nav-toggle:hover {
  background: var(--myst-bg);
  border-color: var(--myst-ink-muted);
}

@media (max-width: 768px) {
  .mobile-nav-toggle {
    display: flex;
  }

  .auth-desktop,
  .balance-desktop,
  .language-desktop {
    display: none;
  }
}

.mobile-nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
}

.mobile-nav-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.mobile-nav {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 100vh;
  background: var(--myst-bg);
  border-right: 1px solid color-mix(in srgb, white 10%, transparent);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  color: var(--myst-ink);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-nav-close:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.mobile-nav-content {
  flex: 1;
  padding: 32px 0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 18px 28px;
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
  letter-spacing: 0.025em;
}

.mobile-nav-link:hover {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.1), transparent);
  border-left-color: #10b981;
  transform: translateX(6px);
}

.mobile-nav-link.active {
  color: #ffffff;
  background: linear-gradient(
    90deg,
    rgba(16, 185, 129, 0.2),
    rgba(34, 197, 94, 0.1)
  );
  border-left-color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.1) inset;
}

.mobile-nav-auth {
  margin-top: 32px;
  padding: 0 28px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.5);
}

.mobile-language-selector {
  margin: 24px 0 16px 0;
}

.mobile-balance-wrapper {
  margin-bottom: 16px;
}

.mobile-balance-wrapper :deep(.dollar) {
  width: 100%;
  justify-content: center;
  padding: 12px 20px;
  font-size: 1rem;
}

:root[data-theme="parchment"] .mobile-balance-wrapper :deep(.dollar) {
  background: var(--myst-bg-2);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

:root[data-theme="parchment"] .mobile-balance-wrapper :deep(.dollar):hover {
  background: var(--myst-bg);
  border-color: var(--myst-ink-muted);
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .mobile-nav {
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mobile-nav-backdrop {
    transition: opacity 0.4s ease;
  }
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;

  .mobile-nav {
    transform: translateX(-100%);
  }

  .mobile-nav-backdrop {
    opacity: 0;
  }
}

/* Services Dropdown Styles */
.services-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.services-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  background: none;
  border: none;
}

.dropdown-arrow {
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotate {
  transform: rotate(180deg);
}

.services-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  min-width: 280px;
  background: color-mix(in srgb, var(--myst-bg) 95%, transparent);
  backdrop-filter: blur(20px);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
}

.service-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: var(--myst-ink);
  transition: all 0.2s ease;
  border-bottom: 1px solid color-mix(in srgb, white 8%, transparent);
}

.service-link:last-child {
  border-bottom: none;
}

.service-link:hover {
  background: color-mix(in srgb, var(--myst-gold) 8%, transparent);
  color: var(--myst-ink-strong);
}

.service-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--myst-gold);
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.service-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.service-description {
  font-size: 12px;
  color: #a1a1aa;
}

.external-link-icon {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.service-link:hover .external-link-icon {
  opacity: 1;
}

/* Dropdown animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}

/* Mobile responsive adjustments for dropdown */
@media (max-width: 768px) {
  .services-dropdown {
    display: none;
  }
}

/* Mobile Services Section */
.mobile-services-section {
  margin-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-top: 20px;
}

.mobile-services-header {
  padding: 0 28px 12px;
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.mobile-service-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
}

.mobile-service-link:hover {
  color: #ffffff;
  background: linear-gradient(90deg, rgba(200, 178, 115, 0.1), transparent);
  border-left-color: var(--myst-gold);
  transform: translateX(6px);
}

.mobile-service-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--myst-gold);
}

.mobile-service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mobile-service-name {
  font-size: 14px;
  font-weight: 500;
}

.mobile-service-description {
  font-size: 11px;
  color: #a1a1aa;
}

/* Attention dot styles for Services */
.services-trigger {
  position: relative;
}

.attention-dot {
  position: absolute;
  top: 6px;
  right: 10px;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--myst-gold);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--myst-bg) 85%, transparent);
}

/* Mobile variant inside header label */
.mobile-services-header {
  position: relative;
}
.attention-dot.mobile {
  position: absolute;
  top: 8px;
  left: calc(100% + 6px);
}
</style>
