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
  height: 80px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  gap: 30px;
  transition: height 0.3s ease;
  z-index: 1000;
}

.header-logo-link {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.navigation {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.nav-links-container {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}

.nav-link {
  position: relative;
  display: block;
  padding: 12px 20px;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.nav-link:focus-visible {
  box-shadow: 0 0 0 2px #ee7828;
}

.nav-link:hover {
  color: #ee7828;
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-link.active {
  color: #ee7828;
}

.nav-underline {
  position: absolute;
  bottom: -2px;
  height: 3px;
  background: linear-gradient(90deg, #ee7828, #ff8c42);
  border-radius: 2px;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(238, 120, 40, 0.4);
  pointer-events: none;
  will-change: left, opacity;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.mobile-nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.mobile-nav-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
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
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.mobile-nav {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 100vh;
  background: linear-gradient(135deg, #1a1d24 0%, #242830 100%);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.mobile-nav-header {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-nav-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-nav-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.mobile-nav-content {
  flex: 1;
  padding: 20px 0;
}

.mobile-nav-link {
  display: block;
  padding: 16px 24px;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: #ee7828;
  background: rgba(238, 120, 40, 0.1);
  border-left-color: #ee7828;
}

.mobile-nav-auth {
  margin-top: 24px;
  padding: 0 24px;
}

.mobile-language-selector {
  margin-bottom: 16px;
}

.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  .mobile-nav {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .mobile-nav-backdrop {
    transition: opacity 0.3s ease;
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
  .nav-links-container {
    gap: 4px;
  }

  .nav-link {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .main-header {
    height: 64px;
    padding: 0 16px;
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

  .nav-link {
    padding: 12px 14px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .mobile-nav {
    max-width: 280px;
  }

  .mobile-nav-link {
    padding: 14px 20px;
    font-size: 1rem;
  }
}
</style>
