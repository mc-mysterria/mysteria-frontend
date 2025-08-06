<template>
  <header class="main-header">
    <RouterLink to="/" @click="closeMobileNav" class="header-logo-link">
      <IconLogo />
    </RouterLink>

    <nav class="navigation" ref="navigationRef">
      <div class="nav-links-container">
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
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          {{ link.title }}
        </component>
      </div>
      <div class="nav-underline" ref="underlineRef"></div>
    </nav>

    <div class="header-actions">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import AuthButton from "@/components/ui/AuthButton.vue";
import BalanceButton from "@/components/ui/BalanceButton.vue";
import LanguageSelector from "@/components/ui/LanguageSelector.vue";
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
const navigationRef = ref<HTMLElement>();
const underlineRef = ref<HTMLElement>();
const isMobileNavOpen = ref(false);

let activeElement: HTMLElement | null = null;
let resizeObserver: ResizeObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const wikiURL = import.meta.env.VITE_WIKI_URL;

const navigationLinks = computed<NavLink[]>(() => [
  { path: "/", title: t('navHome') || 'Home' },
  { path: "/game", title: t('navGame') || 'Game' },
  { path: "/shop", title: t('navShop') || 'Shop' },
  { path: "/rules", title: t('navRules') || 'Rules' },
  {
    path: wikiURL || "#",
    title: t('navWiki') || 'Wiki',
    external: true,
    target: "_blank",
    rel: "noopener noreferrer",
  },
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

const findActiveElement = (): HTMLElement | null => {
  if (!navigationRef.value) return null;

  const activeLink = navigationRef.value.querySelector(
    `.nav-link[data-path="${route.path}"]`,
  ) as HTMLElement;

  return activeLink || null;
};

const updateUnderline = (
  targetElement: HTMLElement | null,
  immediate = false,
) => {
  if (!underlineRef.value || !navigationRef.value) return;

  const underline = underlineRef.value;

  if (immediate) {
    underline.style.transition = "none";
  }

  if (targetElement) {
    const navRect = navigationRef.value.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const width = targetElement.offsetWidth;
    const left = targetRect.left - navRect.left;

    underline.style.width = `${width}px`;
    underline.style.left = `${left}px`;
    underline.style.opacity = "1";
  } else {
    underline.style.opacity = "0";
  }

  if (immediate) {
    requestAnimationFrame(() => {
      underline.style.transition = "";
    });
  }
};

const setActiveUnderline = (immediate = false) => {
  activeElement = findActiveElement();
  updateUnderline(activeElement, immediate);
};

const handleMouseEnter = (event: MouseEvent) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  const target = event.currentTarget as HTMLElement;
  updateUnderline(target);
};

const handleMouseLeave = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateUnderline(activeElement);
  }, 100);
};

const toggleMobileNav = () => {
  isMobileNavOpen.value = !isMobileNavOpen.value;
};

const closeMobileNav = () => {
  isMobileNavOpen.value = false;
};

watch(
  () => route.path,
  () => {
    nextTick(() => setActiveUnderline());
  },
  { immediate: true },
);

watch(isMobileNavOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

onMounted(() => {
  nextTick(() => setActiveUnderline(true));

  if (navigationRef.value) {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => setActiveUnderline(true));
    });
    resizeObserver.observe(navigationRef.value);
  }
});

onUnmounted(() => {
  document.body.style.overflow = "";
  resizeObserver?.disconnect();
});
</script>

<style scoped>
.main-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90px;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 32px;
  gap: 40px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  z-index: 1000;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 24px;
  margin-top: 12px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.header-logo-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-logo-link:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2));
}

.navigation {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 20px;
  padding: 8px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.nav-links-container {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  letter-spacing: 0.025em;
  background: transparent;
  border: 1px solid transparent;
}

.nav-link:focus-visible {
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.6);
}

.nav-link:hover {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(34, 197, 94, 0.1));
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.nav-link.active {
  color: #ffffff;
  background: linear-gradient(135deg, #10b981, #22c55e);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow:
    0 2px 8px rgba(16, 185, 129, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.nav-underline {
  position: absolute;
  bottom: -6px;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #22c55e);
  border-radius: 1px;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  will-change: left, opacity;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.6);
  padding: 8px 12px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.mobile-nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #e2e8f0;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav-toggle:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.2));
  transform: scale(1.02);
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
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.mobile-nav {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 100vh;
  background: linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  box-shadow: 20px 0 40px rgba(0, 0, 0, 0.3);
}

.mobile-nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.8);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  color: #f87171;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-nav-close:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
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
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1));
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

@media (max-width: 992px) {
  .main-header {
    height: 78px;
    padding: 0 24px;
    margin-top: 8px;
  }

  .nav-links-container {
    gap: 2px;
  }

  .nav-link {
    padding: 12px 18px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .main-header {
    height: 70px;
    padding: 0 20px;
    border-radius: 20px;
  }

  .navigation {
    display: none;
  }

  .auth-desktop {
    display: none;
  }

  .mobile-nav-toggle {
    display: flex;
  }

  .header-actions {
    padding: 6px 8px;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .main-header {
    padding: 0 16px;
    gap: 20px;
    margin-top: 6px;
  }

  .mobile-nav {
    max-width: 320px;
  }

  .mobile-nav-header {
    padding: 20px 24px;
  }

  .mobile-nav-link {
    padding: 16px 24px;
    font-size: 1rem;
  }

  .mobile-nav-auth {
    padding: 0 24px;
  }
}
</style>
