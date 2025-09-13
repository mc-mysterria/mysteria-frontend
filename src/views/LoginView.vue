<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-content">
        <div class="login-header">
          <h1>Login to Mysterria</h1>
          <p v-if="redirectMessage" class="redirect-message">{{ redirectMessage }}</p>
        </div>

        <div class="login-options">
          <div class="discord-login">
            <button @click="handleDiscordLogin" :disabled="authStore.isLoading" class="discord-button">
              <svg viewBox="0 0 24 24" class="discord-icon">
                <path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 2.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-2.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span v-if="authStore.isLoading">Authenticating...</span>
              <span v-else>Login with Discord</span>
            </button>
          </div>
        </div>

        <div class="login-info">
          <p>Use your Discord account to access Mysterria services</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();
const redirectMessage = ref("");

onMounted(() => {
  const redirect = route.query.redirect as string;

  if (redirect) {
    try {
      const redirectUrl = new URL(redirect);
      if (redirectUrl.hostname.includes("mysterria.net") || redirectUrl.hostname.includes("mysterria")) {
        redirectMessage.value = `You will be redirected back to ${redirectUrl.hostname} after login`;
      } else {
        redirectMessage.value = "You will be redirected after login";
      }
    } catch {
      redirectMessage.value = "You will be redirected after login";
    }
  }

  // If user is already authenticated, redirect immediately
  if (authStore.isAuthenticated && redirect) {
    const token = authStore.currentToken;
    if (token) {
      const finalRedirectUrl = `${redirect}&token=${encodeURIComponent(token)}`;
      window.location.href = finalRedirectUrl;
    }
  }
});

const handleDiscordLogin = async () => {
  const redirect = route.query.redirect as string;

  try {
    await authStore.openDiscordAuth(redirect);
  } catch (error) {
    console.error("Login error:", error);
  }
};
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d23 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #ffffff;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.redirect-message {
  color: #ee7828;
  font-size: 14px;
  margin: 0;
  padding: 12px;
  background: rgba(238, 120, 40, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(238, 120, 40, 0.3);
}

.login-options {
  margin-bottom: 30px;
}

.discord-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #5865F2;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.discord-button:hover:not(:disabled) {
  background: #4752C4;
  transform: translateY(-1px);
}

.discord-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.discord-icon {
  width: 20px;
  height: 20px;
}

.login-info {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.login-info p {
  margin: 0;
}

@media (max-width: 480px) {
  .login-content {
    padding: 30px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>