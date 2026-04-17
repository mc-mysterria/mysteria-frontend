<template>
  <!-- Mobile overlay -->
  <div
      v-if="isMobileOpen"
      class="mobile-ritual-overlay"
      @click="closeMobileSidebar"
  ></div>

  <div
      :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }"
      class="ritual-sidenav"
  >
    <div class="sidebar-ritual-content">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <RouterLink class="logo-ritual-link" to="/" @click="closeMobileSidebar">
          <div class="logo-ritual-container">
            <IconLogo class="ritual-logo-icon"/>
            <div v-show="!isCollapsed" class="logo-ritual-text">
              <span class="logo-main">Mysterria</span>
              <span class="logo-sub">Ledger</span>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Navigation Points -->
      <div class="ritual-nav-area">
        <div class="nav-ritual-section">
          <div v-show="!isCollapsed" class="nav-ritual-label">{{ t('navigation') || 'Covenants' }}</div>
          
          <RouterLink
              :class="{ active: $route.path.startsWith('/profile') }"
              class="nav-ritual-item"
              to="/profile"
              @click="closeMobileSidebar"
          >
            <div class="nav-ritual-icon"><i class="fa-solid fa-user-scroll"></i></div>
            <span v-show="!isCollapsed" class="nav-ritual-text">{{ t("myProfile") }}</span>
          </RouterLink>

          <RouterLink
              :class="{ active: $route.path === '/' }"
              class="nav-ritual-item"
              to="/"
              @click="closeMobileSidebar"
          >
            <div class="nav-ritual-icon"><i class="fa-solid fa-house-chimney-window"></i></div>
            <span v-show="!isCollapsed" class="nav-ritual-text">{{ t("navHome") }}</span>
          </RouterLink>
        </div>

        <!-- Admin Section -->
        <div v-if="canEditAnyContent" class="nav-ritual-section">
          <div v-show="!isCollapsed" class="nav-ritual-label">Registry</div>
          
          <RouterLink
              v-if="canManageNews"
              :class="{ active: $route.path.startsWith('/edit/news') }"
              class="nav-ritual-item admin"
              to="/edit/news"
              @click="closeMobileSidebar"
          >
            <div class="nav-ritual-icon"><i class="fa-solid fa-pen-nib"></i></div>
            <span v-show="!isCollapsed" class="nav-ritual-text">Edit News</span>
          </RouterLink>

          <RouterLink
              v-if="canManageCounsel"
              :class="{ active: $route.path.startsWith('/edit/counsel') }"
              class="nav-ritual-item admin"
              to="/edit/counsel"
              @click="closeMobileSidebar"
          >
            <div class="nav-ritual-icon"><i class="fa-solid fa-gavel"></i></div>
            <span v-show="!isCollapsed" class="nav-ritual-text">Edit Counsel</span>
          </RouterLink>
        </div>

        <!-- Bottom System Area -->
        <div class="nav-ritual-section bottom">
          <a class="nav-ritual-item logout" href="#" @click.prevent="handleLogout">
            <div class="nav-ritual-icon"><i class="fa-solid fa-door-open"></i></div>
            <span v-show="!isCollapsed" class="nav-ritual-text">{{ t("logout") }}</span>
          </a>

          <button class="ritual-toggle-btn" @click="toggleSidebar">
            <i :class="isCollapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useNotification} from "@/services/useNotification";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "@/composables/useI18n";
import {usePermissions} from "@/composables/usePermissions";
import IconLogo from "@/assets/icons/IconLogo.vue";

const router = useRouter();
const {show} = useNotification();
const authStore = useAuthStore();
const {t} = useI18n();
const {canManageNews, canManageCounsel, canEditAnyContent} = usePermissions();

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const toggleSidebar = () => {
  if (window.innerWidth <= 768) {
    isMobileOpen.value = !isMobileOpen.value;
    document.body.style.overflow = isMobileOpen.value ? "hidden" : "";
    return;
  }
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem("sidebarCollapsed", isCollapsed.value.toString());
  window.dispatchEvent(new CustomEvent("sidebar-toggle", {detail: isCollapsed.value}));
};

const closeMobileSidebar = () => {
  isMobileOpen.value = false;
  document.body.style.overflow = "";
};

const handleMobileSidebarToggle = () => toggleSidebar();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push("/");
    closeMobileSidebar();
  } catch {
    show(t("errorLogout"), {type: "error"});
  }
};

onMounted(() => {
  const collapsed = localStorage.getItem("sidebarCollapsed");
  if (collapsed) isCollapsed.value = collapsed === "true";
  window.addEventListener("mobile-sidebar-toggle", handleMobileSidebarToggle);
});

onBeforeUnmount(() => {
  window.removeEventListener("mobile-sidebar-toggle", handleMobileSidebarToggle);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.ritual-sidenav {
  height: calc(100vh - 80px);
  width: 280px;
  position: fixed;
  top: 80px;
  left: 0;
  background: #080a14;
  border-right: 1px solid rgba(200, 178, 115, 0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.ritual-sidenav.collapsed { width: 80px; }

.sidebar-ritual-content {
  flex: 1;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-ritual-content::-webkit-scrollbar { display: none; }

.sidebar-header { margin-bottom: 48px; }

.logo-ritual-link { text-decoration: none; }

.logo-ritual-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.ritual-logo-icon { width: 32px; height: 32px; color: var(--myst-gold); }

.logo-ritual-text { display: flex; flex-direction: column; }
.logo-main { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #fff; }
.logo-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--myst-gold); text-transform: uppercase; letter-spacing: 2px; }

.ritual-nav-area { flex: 1; display: flex; flex-direction: column; gap: 40px; }

.nav-ritual-section { display: flex; flex-direction: column; gap: 8px; }
.nav-ritual-section.bottom { margin-top: auto; padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); }

.nav-ritual-label {
  font-family: 'Playfair Display', serif;
  font-size: 12px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.nav-ritual-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  color: #888;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-ritual-icon { width: 20px; font-size: 16px; display: flex; justify-content: center; }

.nav-ritual-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-ritual-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.05);
}

.nav-ritual-item.active {
  background: rgba(200, 178, 115, 0.05);
  color: var(--myst-gold);
  border-color: rgba(200, 178, 115, 0.2);
}

.nav-ritual-item.logout:hover { color: #ff5252; background: rgba(255, 82, 82, 0.05); }

.ritual-toggle-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #444;
  width: 40px; height: 40px;
  border-radius: 50%;
  cursor: pointer;
  align-self: center;
  margin-top: 16px;
  transition: all 0.3s;
}

.ritual-toggle-btn:hover { color: var(--myst-gold); border-color: var(--myst-gold); }

.mobile-ritual-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 45;
}

@media (max-width: 768px) {
  .ritual-sidenav {
    transform: translateX(-100%);
    top: 0; height: 100vh;
  }
  .ritual-sidenav.mobile-open { transform: translateX(0); }
  .nav-ritual-section.bottom { padding-bottom: 40px; }
}

.collapsed .nav-ritual-item { justify-content: center; padding: 12px 0; }
</style>
