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
    <div class="containerMargin">
      <RouterLink to="/" class="logo-link">
        <div class="containerLogo">
          <IconLogo />
          <span v-show="!isCollapsed" class="logo-text">UAProject</span>
        </div>
      </RouterLink>
    </div>
    <div class="containerpoints">
      <div class="sidenavContainer">
        <RouterLink
          :to="profileLink"
          :class="{
            activeLink: $route.path.startsWith('/profile'),
          }"
          :title="isCollapsed ? t('myProfile') : ''"
        >
          <IconUser />
          <span v-show="!isCollapsed" class="link-text">{{ t('myProfile') }}</span>
        </RouterLink>
      </div>
      <div class="sidenavContainer bottom-container">
        <a
          href="#"
          @click.prevent="handleLogout"
          :title="isCollapsed ? t('logout') : ''"
          class="logout-link"
        >
          <IconSignOut />
          <span v-show="!isCollapsed" class="link-text">{{ t('logout') }}</span>
        </a>

        <button
          @click="toggleSidebar"
          class="toggle-btn"
          :title="isCollapsed ? 'Розгорнути' : 'Згорнути'"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M15 18l-6-6 6-6" v-if="!isCollapsed" />
            <path d="M9 18l6-6-6-6" v-else />
          </svg>
        </button>
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
@font-face {
  font-family: "MontserratSemiBold";
  src: url("@/assets/fonts/Montserrat-SemiBold.ttf");
}

.sidenav {
  height: 100vh;
  width: 260px;
  padding: 20px 30px 0 30px;
  position: fixed;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, #1a1d23 0%, #23262c 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  overflow-y: auto;
  overflow-x: hidden;
  backdrop-filter: blur(10px);
  z-index: 50;
}

.sidenav.collapsed {
  width: 80px;
  padding: 20px 15px 0 15px;
}

.sidenav::-webkit-scrollbar {
  width: 6px;
}

.sidenav::-webkit-scrollbar-track {
  background: transparent;
}

.sidenav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidenav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.containerpoints {
  min-height: calc(100vh - 85px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 20px;
}

.sidenavContainer a {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 8px 0;
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 12px;
  justify-content: flex-start;
  border: 1px solid transparent;
}

.collapsed .sidenavContainer a {
  justify-content: center;
  padding: 10px;
}

.sidenavContainer a:hover {
  background: rgba(108, 93, 211, 0.1);
  border-color: rgba(108, 93, 211, 0.3);
  transform: translateX(4px);
}

.collapsed .sidenavContainer a:hover {
  transform: scale(1.1);
  background: rgba(108, 93, 211, 0.2);
}

.containerMargin {
  height: 60px;
  position: relative;
}

.containerLogo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 24px;
  font-family: "MontserratSemiBold";
  gap: 12px;
}

.logo-text {
  transition: opacity 0.3s ease;
}

.bottom-container {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.collapsed .bottom-container {
  flex-direction: column;
  gap: 8px;
  transform: translateY(-30px);
}

.logout-link {
  flex: 1;
}

.toggle-btn {
  background: #6c5dd3;
  border: 2px solid #8b7eff;
  border-radius: 8px;
  color: #fff;
  width: 36px;
  height: 36px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(108, 93, 211, 0.4);
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: #8b7eff;
  border-color: #a394ff;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(108, 93, 211, 0.6);
}

.link-text {
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.activeLink {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  border-color: rgba(108, 93, 211, 0.5);
}

.containerLogo img {
  height: 40px;
  width: auto;
}

.sidenavContainer svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.viewed-profile-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid rgba(108, 93, 211, 0.4);
  background: linear-gradient(
    135deg,
    rgba(108, 93, 211, 0.15),
    rgba(139, 126, 255, 0.1)
  );
  border-radius: 8px;
  margin: 8px 0;
  margin-bottom: 12px !important;
  color: inherit;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 12px;
  justify-content: flex-start;
  backdrop-filter: blur(5px);
}

.collapsed .viewed-profile-link {
  justify-content: center;
  padding: 10px;
  gap: 0;
}

.viewed-profile-link:hover {
  background: linear-gradient(
    135deg,
    rgba(108, 93, 211, 0.25),
    rgba(139, 126, 255, 0.2)
  );
  border-color: rgba(108, 93, 211, 0.6);
  transform: translateX(4px);
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
