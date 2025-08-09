<template>
  <div v-if="!profile">
    <div class="unauthorized-container">
      <div class="unauthorized-message">
        <div class="unauthorized-icon">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h2 class="unauthorized-title">
          {{ title || t("authenticationRequired") }}
        </h2>
        <p class="unauthorized-text">{{ message }}</p>
        <div class="unauthorized-features">
          <div class="feature-item" v-if="showFeatures">
            <i class="fa-solid fa-shopping-cart"></i>
            <span>{{ t("accessExclusiveItems") }}</span>
          </div>
          <div class="feature-item" v-if="showFeatures">
            <i class="fa-solid fa-coins"></i>
            <span>{{ t("manageYourBalance") }}</span>
          </div>
        </div>
        <AuthButton class="enhanced-auth-button"></AuthButton>
        <p class="disclaimer">{{ disclaimer || t("secureLoginDisclaimer") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthButton from "@/components/ui/AuthButton.vue";
import { useUserStore } from "@/stores/user";
import { useI18n } from "@/composables/useI18n";
import { computed } from "vue";

const userStore = useUserStore();
const profile = computed(() => userStore.currentUser);
const { t } = useI18n();

interface Props {
  message?: string;
  title?: string;
  showFeatures?: boolean;
  disclaimer?: string;
}

withDefaults(defineProps<Props>(), {
  message: "",
  title: "",
  showFeatures: true,
  disclaimer: "",
});
</script>

<style scoped>
.unauthorized-container {
  min-height: calc(100vh - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-radius: 12px;
  margin: 60px auto 0;
  width: 100%;
  max-width: 1000px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.unauthorized-message:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.unauthorized-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--myst-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--myst-gold) 30%, transparent);
  animation: pulse 2s infinite;
}

.unauthorized-icon i {
  font-size: 24px;
  color: var(--myst-bg);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--myst-gold) 30%, transparent);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 40px color-mix(in srgb, var(--myst-gold) 50%, transparent);
  }
}

.unauthorized-title {
  color: var(--myst-ink-strong);
  font-size: 24px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  margin-bottom: 16px;
  font-weight: 600;
}

.unauthorized-text {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 1200px;
}

.unauthorized-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  width: 100%;
  max-width: 800px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 15%, transparent);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  transform: translateY(-2px);
}

.feature-item i {
  color: var(--myst-gold);
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.feature-item span {
  color: var(--myst-ink-strong);
  font-size: 14px;
  font-weight: 500;
}

.enhanced-auth-button {
  margin-bottom: 15px;
  transform: scale(1.05);
}

.disclaimer {
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .unauthorized-container {
    padding: 16px;
    min-height: calc(100vh - 150px);
  }

  .unauthorized-message {
    padding: 32px 24px;
    max-width: 100%;
  }

  .unauthorized-icon {
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
  }

  .unauthorized-icon i {
    font-size: 22px;
  }

  .unauthorized-title {
    font-size: 22px;
    margin-bottom: 12px;
  }

  .unauthorized-text {
    font-size: 15px;
    margin-bottom: 24px;
  }

  .unauthorized-features {
    margin-bottom: 24px;
  }

  .feature-item {
    padding: 14px 18px;
    gap: 10px;
  }

  .feature-item span {
    font-size: 13px;
  }

  .enhanced-auth-button {
    transform: scale(1);
  }
}

@media (max-width: 480px) {
  .unauthorized-message {
    padding: 28px 20px;
    border-radius: 10px;
  }

  .unauthorized-icon {
    width: 48px;
    height: 48px;
  }

  .unauthorized-icon i {
    font-size: 20px;
  }

  .unauthorized-title {
    font-size: 20px;
  }

  .unauthorized-text {
    font-size: 14px;
  }

  .feature-item {
    padding: 12px 16px;
  }

  .feature-item span {
    font-size: 12px;
  }
}
</style>
