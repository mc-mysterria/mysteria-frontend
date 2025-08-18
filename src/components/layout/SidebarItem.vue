<template>
  <!-- Mobile overlay -->
  <div
    class="mobile-overlay"
    v-if="isMobileOpen"
    @click="closeMobileSidebar"
  ></div>

  <div
    class="sidenav"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
  >
    <div class="sidebar-glow"></div>
    <div class="sidebar-content">
      <div class="containerMargin">
        <RouterLink to="/" class="logo-link">
          <div class="containerLogo">
            <div class="logo-orbit">
              <div class="orbit-ring"></div>
              <IconLogo />
            </div>
            <div class="logo-text-container" v-show="!isCollapsed">
              <span class="logo-text">Mysterria</span>
              <span class="logo-subtitle">Portal</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <div class="containerpoints">
        <div class="sidenavContainer">
          <div class="nav-section-title" v-show="!isCollapsed">Navigation</div>
          <RouterLink
            :to="profileLink"
            :class="{
              activeLink: $route.path.startsWith('/profile'),
            }"
            :title="isCollapsed ? t('myProfile') : ''"
            class="nav-item"
          >
            <div class="nav-item-background"></div>
            <div class="nav-item-content">
              <div class="nav-icon-container">
                <IconUser />
              </div>
              <span v-show="!isCollapsed" class="link-text">{{
                t("myProfile")
              }}</span>
            </div>
            <div class="nav-item-indicator"></div>
          </RouterLink>
        </div>

        <div class="sidenavContainer" v-if="authStore.isPrivilegedUser">
          <div class="nav-section-title" v-show="!isCollapsed">Admin</div>
          <RouterLink
            to="/edit/news"
            :class="{
              activeLink: $route.path.startsWith('/edit/news'),
            }"
            :title="isCollapsed ? 'Edit News' : ''"
            class="nav-item"
          >
            <div class="nav-item-background"></div>
            <div class="nav-item-content">
              <div class="nav-icon-container">
                <!-- Add an icon for news editing -->
              </div>
              <span v-show="!isCollapsed" class="link-text">Edit News</span>
            </div>
            <div class="nav-item-indicator"></div>
          </RouterLink>
        </div>

        <div class="sidenavContainer bottom-container">
          <div class="nav-section-title" v-show="!isCollapsed">System</div>
          <a
            href="#"
            @click.prevent="handleLogout"
            :title="isCollapsed ? t('logout') : ''"
            class="logout-link nav-item"
          >
            <div class="nav-item-background logout-bg"></div>
            <div class="nav-item-content">
              <div class="nav-icon-container">
                <IconSignOut />
              </div>
              <span v-show="!isCollapsed" class="link-text">{{
                t("logout")
              }}</span>
            </div>
            <div class="nav-item-indicator logout-indicator"></div>
          </a>

          <button
            @click="toggleSidebar"
            class="toggle-btn"
            :title="isCollapsed ? 'Expand' : 'Collapse'"
          >
            <div class="toggle-btn-bg"></div>
            <div class="toggle-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M15 18l-6-6 6-6" v-if="!isCollapsed" />
                <path d="M9 18l6-6-6-6" v-else />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useNotification } from "@/services/useNotification";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "@/composables/useI18n";
import IconLogo from "@/assets/icons/IconLogo.vue";
import IconUser from "@/assets/icons/IconUser.vue";
import IconSignOut from "@/assets/icons/IconSignOut.vue";

const router = useRouter();
const { show } = useNotification();
const authStore = useAuthStore();
const { t } = useI18n();

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const toggleSidebar = () => {
  if (window.innerWidth <= 576) {
    isMobileOpen.value = !isMobileOpen.value;
    if (isMobileOpen.value) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return;
  }

  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem("sidebarCollapsed", isCollapsed.value.toString());

  window.dispatchEvent(
    new CustomEvent("sidebar-toggle", { detail: isCollapsed.value }),
  );
};

const closeMobileSidebar = () => {
  isMobileOpen.value = false;
  document.body.style.overflow = "";
};

const handleMobileSidebarToggle = () => {
  console.log("handleMobileSidebarToggle called");
  toggleSidebar();
};

// Removed permission computeds for deleted features

const profileLink = computed(() => {
  return "/profile";
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/");
  } catch {
    show("Помилка при виході з системи", { type: "error" });
  }
};

let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
};

const handleTouchEnd = (e: TouchEvent) => {
  if (!e.changedTouches.length) return;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndTime = Date.now();
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const deltaTime = touchEndTime - touchStartTime;

  if (deltaTime < 500 && Math.abs(deltaX) > 80 && Math.abs(deltaY) < 120) {
    if (deltaX > 80 && !isMobileOpen.value) {
      isMobileOpen.value = true;
      document.body.style.overflow = "hidden";
    } else if (deltaX < -80 && isMobileOpen.value) {
      closeMobileSidebar();
    }
  }
};

onMounted(() => {
  const collapsed = localStorage.getItem("sidebarCollapsed");
  if (collapsed) {
    isCollapsed.value = collapsed === "true";
  }

  window.addEventListener("mobile-sidebar-toggle", handleMobileSidebarToggle);
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "mobile-sidebar-toggle",
    handleMobileSidebarToggle,
  );
  document.removeEventListener("touchstart", handleTouchStart);
  document.removeEventListener("touchend", handleTouchEnd);
  document.body.style.overflow = "";
});
</script>

<script lang="ts">
export default {};
</script>

<style scoped>

.sidenav {
  height: calc(100vh - 80px);
  width: 280px;
  padding: 0;
  position: fixed;
  top: 80px;
  left: 0;
  background:
    linear-gradient(
      180deg,
      rgba(2, 6, 23, 0.98) 0%,
      rgba(15, 23, 42, 0.95) 100%
    ),
    /* Subtle vertical lines pattern */
      linear-gradient(
        90deg,
        transparent 49%,
        rgba(16, 185, 129, 0.02) 50%,
        transparent 51%
      ),
    linear-gradient(
      0deg,
      transparent 49%,
      rgba(34, 197, 94, 0.015) 50%,
      transparent 51%
    );
  background-size:
    100% 100%,
    80px 80px,
    120px 120px;
  border-right: 2px solid transparent;
  border-image: linear-gradient(
      180deg,
      rgba(16, 185, 129, 0.2),
      rgba(34, 197, 94, 0.2),
      transparent
    )
    1;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  backdrop-filter: blur(20px);
  z-index: 50;
  box-shadow:
    4px 0 30px rgba(0, 0, 0, 0.3),
    inset -1px 0 0 rgba(148, 163, 184, 0.1);
}

.sidebar-glow {
  display: none;
}

.sidebar-content {
  position: relative;
  height: 100%;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.sidenav.collapsed {
  width: 90px;
}

.sidenav.collapsed .sidebar-content {
  padding: 24px 20px;
}

.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: linear-gradient(
    180deg,
    rgba(16, 185, 129, 0.4),
    rgba(34, 197, 94, 0.4)
  );
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(
    180deg,
    rgba(16, 185, 129, 0.6),
    rgba(34, 197, 94, 0.6)
  );
}

.containerpoints {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  min-height: 0;
}

.nav-section-title {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 16px 0 12px 16px;
  opacity: 0.8;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 16px;
  margin: 8px 0;
  color: #e2e8f0;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(10px);
}

.nav-item-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.8),
    rgba(30, 41, 59, 0.6)
  );
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.nav-item-content {
  position: relative;
  display: flex;
  align-items: center;
  padding: 14px 20px;
  gap: 16px;
  width: 100%;
  z-index: 2;
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  position: relative;
}

.nav-item-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(180deg, #10b981, #22c55e);
  border-radius: 0 2px 2px 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.collapsed .nav-item .nav-item-content {
  justify-content: center;
  padding: 14px 12px;
}

.collapsed .nav-section-title {
  display: none;
}

.nav-item:hover {
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateX(6px);
  box-shadow:
    0 4px 20px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.nav-item:hover .nav-item-background {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(34, 197, 94, 0.1)
  );
}

.nav-item:hover .nav-item-indicator {
  height: 60%;
}

.collapsed .nav-item:hover {
  transform: scale(1.05);
}

.collapsed .nav-item:hover .nav-item-indicator {
  height: 40%;
  width: 3px;
}

.containerMargin {
  margin-bottom: 32px;
  position: relative;
}

.containerLogo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.logo-orbit {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border: 2px solid transparent;
  border-top-color: #10b981;
  border-right-color: #22c55e;
  border-radius: 50%;
  animation: orbit 3s linear infinite;
}

@keyframes orbit {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.logo-text-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 20px;
  font-family: "Inter";
  font-weight: 700;
  background: linear-gradient(135deg, #e2e8f0, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.4s ease;
  letter-spacing: -0.025em;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: all 0.4s ease;
}

.logo-link {
  text-decoration: none;
  display: block;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-link:hover .containerLogo {
  transform: translateY(-2px);
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow:
    0 6px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.logo-link:hover .logo-text {
  background: linear-gradient(135deg, #10b981, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-link:hover .logo-subtitle {
  color: #94a3b8;
}

.bottom-container {
  display: flex !important;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.collapsed .bottom-container {
  align-items: center;
  gap: 12px;
}

.logout-link {
  width: 100%;
}

.logout-bg {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1),
    rgba(220, 38, 38, 0.1)
  ) !important;
}

.logout-link:hover {
  border-color: rgba(239, 68, 68, 0.4) !important;
}

.logout-link:hover .logout-bg {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2),
    rgba(220, 38, 38, 0.15)
  ) !important;
}

.logout-indicator {
  background: linear-gradient(180deg, #ef4444, #dc2626) !important;
}

.toggle-btn {
  position: relative;
  background: transparent;
  border: none;
  border-radius: 16px;
  color: #e2e8f0;
  width: 48px;
  height: 48px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  align-self: center;
}

.toggle-btn-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.1),
    rgba(34, 197, 94, 0.1)
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon {
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.toggle-btn:hover .toggle-btn-bg {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.2),
    rgba(34, 197, 94, 0.2)
  );
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow:
    0 4px 20px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.toggle-btn:hover .toggle-icon {
  color: #ffffff;
}

.link-text {
  transition: all 0.4s ease;
  white-space: nowrap;
  font-weight: 500;
  letter-spacing: 0.025em;
}

.activeLink {
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow:
    0 4px 20px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.activeLink .nav-item-background {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.2),
    rgba(34, 197, 94, 0.15)
  ) !important;
}

.activeLink .nav-item-indicator {
  height: 70% !important;
}

.activeLink .link-text {
  color: #ffffff;
}

.containerLogo .icon-logo {
  height: 32px;
  width: 32px;
  position: relative;
  z-index: 1;
}

.nav-icon-container svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item:hover .nav-icon-container svg {
  transform: scale(1.05);
}

.activeLink .nav-icon-container svg {
  transform: scale(1.05);
}

.viewed-profile-link {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(34, 197, 94, 0.1)
  );
  border-radius: 16px;
  margin: 8px 0 16px 0;
  color: inherit;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow:
    0 2px 12px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.collapsed .viewed-profile-link .nav-item-content {
  justify-content: center;
  padding: 14px 12px;
}

.viewed-profile-link:hover {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.25),
    rgba(34, 197, 94, 0.2)
  );
  border-color: rgba(16, 185, 129, 0.6);
  transform: translateX(6px);
  box-shadow:
    0 4px 20px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.profile-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.profile-avatar img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.avatar-placeholder {
  color: #8b8b8b;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.profile-slide-enter-active,
.profile-slide-leave-active {
  transition: all 0.4s ease;
}

.profile-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
  margin: 0;
  padding: 0;
  border-width: 0;
}

.profile-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
  margin: 0;
  padding: 0;
  border-width: 0;
}

.profile-slide-enter-to,
.profile-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 60px;
}

@media (max-width: 1024px) {
  .toggle-btn {
    top: 20px;
    right: 10px;
  }
}

@media (max-width: 768px) {
  .sidenav {
    width: 240px;
  }

  .sidenav.collapsed {
    width: 70px;
  }

  .containerLogo {
    font-size: 20px;
  }

  .sidenavContainer a {
    padding: 8px 12px;
    margin: 0px 0;
  }

  .collapsed .sidenavContainer a {
    padding: 8px;
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 576px) {
  .mobile-overlay {
    display: block;
  }

  .sidenav {
    transform: translateX(-100%);
    z-index: 1000;
    position: fixed;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    padding: 20px 30px 0 30px;
    box-sizing: border-box;
  }

  .sidenav.mobile-open {
    transform: translateX(0);
  }

  .containerMargin {
    flex-shrink: 0;
  }

  .containerpoints {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .sidenavContainer:first-child {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .sidenavContainer.bottom-container {
    flex-shrink: 0;
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }
}
</style>
