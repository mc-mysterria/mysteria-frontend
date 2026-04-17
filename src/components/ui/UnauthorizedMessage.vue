<template>
  <FadeInSection>
    <div class="unauthorized-ritual-container">
      <div class="mist-overlay"></div>
      
      <div class="ritual-box">
        <div class="ritual-icon">
          <i class="fa-solid fa-lock"></i>
        </div>
        
        <h2 class="ritual-title">{{ t('authenticationRequired') }}</h2>
        <div class="ritual-divider"></div>
        
        <div class="ritual-benefits">
          <div class="benefit-item">
            <i class="fa-solid fa-star-of-life"></i>
            <span>{{ t('accessExclusiveItems') }}</span>
          </div>
          <div class="benefit-item">
            <i class="fa-solid fa-star-of-life"></i>
            <span>{{ t('manageYourBalance') }}</span>
          </div>
        </div>

        <div class="ritual-actions">
          <AuthButton/>
        </div>
      </div>
    </div>
  </FadeInSection>
</template>

<script lang="ts" setup>
import {useI18n} from "@/composables/useI18n";
import AuthButton from "@/components/ui/AuthButton.vue";
import FadeInSection from "@/components/ui/FadeInSection.vue";

const {t} = useI18n();
</script>

<style scoped>
.unauthorized-ritual-container {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

.mist-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(200, 178, 115, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.ritual-box {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(200, 178, 115, 0.1);
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
}

.ritual-icon {
  font-size: 32px;
  color: var(--myst-gold);
  margin-bottom: 24px;
  opacity: 0.8;
}

.ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: #fff;
  margin-bottom: 0;
}

.ritual-divider {
  width: 40px;
  height: 1px;
  background: var(--myst-gold);
  margin: 30px auto;
}

.ritual-benefits {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 48px;
  align-items: center;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.benefit-item i {
  font-size: 10px;
  color: var(--myst-gold);
  opacity: 0.6;
}

.ritual-actions {
  display: flex;
  justify-content: center;
}
</style>
