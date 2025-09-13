<template>
  <div class="auth-callback">
    <div class="callback-content">
      <div v-if="isProcessing" class="processing">
        <div class="spinner"></div>
        <h2>Processing authentication...</h2>
      </div>
      <div v-else-if="error" class="error">
        <h2>Authentication Error</h2>
        <p>{{ error }}</p>
        <button @click="closeWindow">Close</button>
      </div>
      <div v-else class="success">
        <h2>Authentication Successful!</h2>
        <p>You can close this window</p>
        <button @click="closeWindow">Close</button>
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
const isProcessing = ref(true);
const error = ref("");

onMounted(async () => {
  console.log("AuthCallback mounted, query params:", route.query);

  try {
    const code = route.query.code as string;
    const state = route.query.state as string;

    console.log("Auth code:", code);
    console.log("State:", state);

    // Parse redirect URL from state parameter
    let redirectUrl = "";
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        redirectUrl = stateData.redirect;
        console.log("Redirect URL from state:", redirectUrl);
      } catch (e) {
        console.warn("Failed to parse state parameter:", e);
      }
    }

    if (!code) {
      throw new Error("Authorization code not received");
    }

    console.log("Processing auth code with new JWT system...");

    // Process the Discord callback directly without calling checkAuthCode
    // which would cause a duplicate call
    await authStore.processDiscordCallback(code);

    if (authStore.isAuthenticated) {
      isProcessing.value = false;

      // Check if this is a cross-domain authentication request
      if (redirectUrl) {
        console.log("Cross-domain authentication detected, redirecting with token...");

        // Get the current access token to pass to the archive
        const token = authStore.currentToken;

        if (token) {
          // Construct redirect URL with token
          const finalRedirectUrl = `${redirectUrl}&token=${encodeURIComponent(token)}`;
          console.log("Redirecting to:", finalRedirectUrl);

          // Redirect to the archive with the token
          window.location.href = finalRedirectUrl;
          return;
        } else {
          throw new Error("Failed to get authentication token");
        }
      }

      // Normal authentication flow (popup window)
      console.log("Sending message to opener...");
      if (window.opener) {
        window.opener.postMessage(
          { type: "AUTH_SUCCESS" },
          window.location.origin,
        );
        console.log("Message sent to opener");
      } else {
        console.log("No opener window found - redirecting to home");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      setTimeout(() => {
        console.log("Closing window...");
        closeWindow();
      }, 2000);
    } else {
      throw new Error("Authentication failed");
    }
  } catch (err) {
    console.error("Auth callback error:", err);
    error.value = err instanceof Error ? err.message : "Unknown error";
    isProcessing.value = false;
  }
});

const closeWindow = () => {
  if (window.opener) {
    window.close();
  } else {
    window.location.href = "/";
  }
};
</script>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d23 100%);
  color: #ffffff;
  font-family: inherit;
}

.callback-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ee7828;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing h2,
.error h2,
.success h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
}

.processing p,
.error p,
.success p {
  margin: 0 0 24px 0;
  color: rgba(255, 255, 255, 0.8);
}

button {
  background: #ee7828;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

button:hover {
  background: #f48a3f;
}

.error {
  color: #ff6b6b;
}

.success {
  color: #51cf66;
}
</style>
