<template>
  <header>
    <div class="headerContainer">
      <div class="logoSection">
        <RouterLink to="/" class="logoLink">
          <IconLogo />
          <span class="logoText">Mysterria</span>
        </RouterLink>
      </div>

      <div class="searchSection">
        <!-- User search temporarily disabled - needs new API endpoint -->
      </div>

      <div class="actionsSection">
        <div class="actionButtons">
          <a
            target="_blank"
            :href="mapURL"
            rel="noopener noreferrer"
            class="actionButton mapButton"
            title="Карта сервера"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
          </a>

          <NotificationBell />

          <div class="userProfile" @click="goToProfile">
            <div class="userAvatarContainer">
              <img
                v-if="userStore.currentUser?.discordId"
                :src="`/anaya/member/avatar?discord_id=${userStore.currentUser.discordId}`"
                :alt="
                  userStore.currentUser?.nickname || 'User avatar'
                "
                @error="handleImageError"
              />
              <div v-else class="avatarPlaceholder">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <span class="userName">{{
              userStore.currentUser?.nickname || "Гість"
            }}</span>
            <svg
              class="profileArrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </div>
        </div>

        <button
          class="mobileMenuButton"
          @click="toggleMobileSidebar"
          type="button"
        >
          <span class="menuLine"></span>
          <span class="menuLine"></span>
          <span class="menuLine"></span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import NotificationBell from "@/components/ui/NotificationBell.vue";
import IconLogo from "@/assets/icons/IconLogo.vue";
const mapURL = import.meta.env.VITE_MAP_URL;
const router = useRouter();
const userStore = useUserStore();

const profileLink = computed(() => {
  const user = userStore.currentUser;
  if (!user) return "/";
  return `/profile/${user.nickname || user.id}`;
});

const goToProfile = () => {
  if (userStore.currentUser) {
    router.push(profileLink.value);
  }
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = "/logo.webp";
};

const toggleMobileSidebar = () => {
  console.log("toggleMobileSidebar clicked");
  window.dispatchEvent(new CustomEvent("mobile-sidebar-toggle"));
};
</script>

<style scoped>
header {
  width: 100%;
  background: linear-gradient(135deg, #1a1d23 0%, #23262c 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.headerContainer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  gap: 32px;
}

.logoSection {
  flex-shrink: 0;
}

.logoLink {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 20px;
  transition: all 0.2s ease;
}

.logoLink:hover {
  transform: translateY(-1px);
}

.logoImage {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.mobileMenuButton {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  margin-left: 12px;
  transition: all 0.3s ease;
}

.menuLine {
  width: 24px;
  height: 2px;
  background: #ffffff;
  display: block;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 1px;
}

.logoText {
  background: linear-gradient(135deg, #6c5dd3 0%, #8b7eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.searchSection {
  flex: 1;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b8b8b;
  font-style: italic;
}

.actionsSection {
  display: flex;
  align-items: center;
  gap: 16px;
}

.actionButtons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.actionButton {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.actionButton:hover {
  background: rgba(108, 93, 211, 0.2);
  border-color: rgba(108, 93, 211, 0.3);
  transform: translateY(-1px);
}

.userProfile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ffffff;
}

.userProfile:hover {
  background: rgba(108, 93, 211, 0.1);
  border-color: rgba(108, 93, 211, 0.3);
}

.userAvatarContainer {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.userAvatarContainer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.userName {
  font-weight: 500;
  font-size: 14px;
}

.profileArrow {
  color: #8b8b8b;
  transition: transform 0.2s ease;
}

.userProfile:hover .profileArrow {
  transform: translateY(1px);
}

.mobileNav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: none;
}

.mobileNavContent {
  width: 90%;
  max-width: 400px;
  height: 100vh;
  background: linear-gradient(135deg, #1a1d23 0%, #23262c 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.mobileNavHeader {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobileUserInfo {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobileUserAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobileUserAvatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobileUserName {
  font-weight: 600;
  color: #ffffff;
  font-size: 16px;
}

.mobileUserRole {
  font-size: 14px;
  color: #8b8b8b;
}

.closeButton {
  background: none;
  border: none;
  color: #8b8b8b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.closeButton:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.mobileNavLinks {
  flex: 1;
  padding: 24px 0;
  display: flex;
  flex-direction: column;
}

.navLink {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  color: #ffffff;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.navLink:hover {
  background: rgba(108, 93, 211, 0.1);
  color: #6c5dd3;
}

.navLink.router-link-active {
  background: rgba(108, 93, 211, 0.2);
  color: #6c5dd3;
  border-right: 3px solid #6c5dd3;
}

.logoutButton {
  margin-top: auto;
  color: #ff6b6b;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logoutButton:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.mobileNavFooter {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}


.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: all 0.3s ease;
}

.mobile-nav-enter-from {
  opacity: 0;
}

.mobile-nav-leave-to {
  opacity: 0;
}

.mobile-nav-enter-active .mobileNavContent,
.mobile-nav-leave-active .mobileNavContent {
  transition: transform 0.3s ease;
}

.mobile-nav-enter-from .mobileNavContent {
  transform: translateX(-100%);
}

.mobile-nav-leave-to .mobileNavContent {
  transform: translateX(-100%);
}


@media (max-width: 1200px) {
  .headerContainer {
    padding: 0 20px;
    gap: 24px;
  }

  .searchSection {
    max-width: 400px;
  }

  .userProfile .userName {
    display: none;
  }
}

@media (max-width: 768px) {
  .headerContainer {
    padding: 0 16px;
    height: 70px;
    gap: 16px;
  }

  .logoText {
    display: none;
  }

  .logoImage {
    width: 36px;
    height: 36px;
  }

  .searchSection {
    max-width: none;
    flex: 1;
  }

  .actionButtons {
    display: none;
  }

  .mobileMenuButton {
    display: flex;
  }

  .mobileNav {
    display: block;
  }
}

@media (max-width: 480px) {
  .headerContainer {
    padding: 0 12px;
    gap: 12px;
  }

}
</style>
