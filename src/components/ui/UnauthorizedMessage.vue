<template>
  <div v-if="!profile">
    <div class="unauthorized-container">
      <div class="unauthorized-message">
        <div class="unauthorized-icon">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h2 class="unauthorized-title">{{ title || t('authenticationRequired') }}</h2>
        <p class="unauthorized-text">{{ message }}</p>
        <div class="unauthorized-features">
          <div class="feature-item" v-if="showFeatures">
            <i class="fa-solid fa-shopping-cart"></i>
            <span>{{ t('accessExclusiveItems') }}</span>
          </div>
          <div class="feature-item" v-if="showFeatures">
            <i class="fa-solid fa-coins"></i>
            <span>{{ t('manageYourBalance') }}</span>
          </div>
        </div>
        <AuthButton class="enhanced-auth-button"></AuthButton>
        <p class="disclaimer">{{ disclaimer || t('secureLoginDisclaimer') }}</p>
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
  padding: 15px;
}

.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e2126 0%, #23262c 50%, #2a2d35 100%);
  border-radius: 20px;
  margin: 0 auto;
  max-width: 600px;
  padding: 35px 35px;
  text-align: center;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(108, 93, 211, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(108, 93, 211, 0.2);
  position: relative;
  overflow: hidden;
}

.unauthorized-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.5), transparent);
}

.unauthorized-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
  box-shadow: 0 8px 32px rgba(74, 222, 128, 0.3);
  animation: pulse 2s infinite;
}

.unauthorized-icon i {
  font-size: 26px;
  color: white;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(74, 222, 128, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(74, 222, 128, 0.5);
  }
}

.unauthorized-title {
  color: #ffffff;
  font-size: 24px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.unauthorized-text {
  color: #b4bbc5;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 25px;
  max-width: 420px;
}

.unauthorized-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 25px;
  width: 100%;
  max-width: 380px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(108, 93, 211, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(108, 93, 211, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(108, 93, 211, 0.15);
  border-color: rgba(74, 222, 128, 0.3);
  transform: translateY(-2px);
}

.feature-item i {
  color: #8b7eff;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.feature-item span {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.enhanced-auth-button {
  margin-bottom: 15px;
  transform: scale(1.05);
}

.disclaimer {
  color: #7a8189;
  font-size: 11px;
  line-height: 1.3;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .unauthorized-container {
    padding: 15px;
    min-height: calc(100vh - 150px);
  }
  
  .unauthorized-message {
    padding: 35px 25px;
    max-width: 100%;
  }
  
  .unauthorized-icon {
    width: 65px;
    height: 65px;
    margin-bottom: 20px;
  }
  
  .unauthorized-icon i {
    font-size: 26px;
  }
  
  .unauthorized-title {
    font-size: 24px;
    margin-bottom: 12px;
  }
  
  .unauthorized-text {
    font-size: 16px;
    margin-bottom: 25px;
  }
  
  .unauthorized-features {
    margin-bottom: 25px;
  }
  
  .feature-item {
    padding: 10px 16px;
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
    padding: 30px 20px;
    border-radius: 16px;
  }
  
  .unauthorized-icon {
    width: 55px;
    height: 55px;
  }
  
  .unauthorized-icon i {
    font-size: 22px;
  }
  
  .unauthorized-title {
    font-size: 20px;
  }
  
  .unauthorized-text {
    font-size: 14px;
  }
  
  .feature-item {
    padding: 8px 14px;
  }
  
  .feature-item span {
    font-size: 12px;
  }
}
</style>
