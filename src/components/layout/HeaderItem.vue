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
      </nav>

      <div class="header-actions">
        <ThemeToggle />
        <LanguageSelector />
        <BalanceButton />
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

            <div class="mobile-nav-auth">
              <div class="mobile-language-selector">
                <LanguageSelector />
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

const navigationLinks = computed<NavLink[]>(() => [
  { path: "/", title: t("navHome") || "Home" },
  { path: "/guide", title: t("navGame") || "Guide" },
  { path: "/rules", title: t("navRules") || "Rules" },
  { path: "/store", title: t("navShop") || "Shop" },
  { path: "/wiki", title: t("navWiki") || "Wiki" },
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

watch(isMobileNavOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
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

.mobile-nav-toggle:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

@media (max-width: 768px) {
  .mobile-nav-toggle {
    display: flex;
  }

  .auth-desktop {
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
  margin: 24px 0 20px 0;
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

/* Remove old styles - they're replaced by simpler modern approach */
</style>
