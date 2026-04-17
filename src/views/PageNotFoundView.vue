<template>
  <div class="ritual-page page-container">
    <HeaderItem/>
    <main class="pnf-main">
      <div class="mist-overlay"></div>
      
      <div class="pnf-content">
        <FadeInSection>
          <div class="ritual-box-404">
            <h1 class="glitch-text">404</h1>
            <div class="ritual-divider"></div>
            <h2 class="pnf-title">{{ t("pageNotFoundTitle") }}</h2>
            <p class="pnf-message">
              {{ t("pageNotFoundMessage") }}
            </p>
            <div class="pnf-actions">
              <button class="btn-ritual" @click="router.push('/')">
                <i class="fa-solid fa-arrow-left"></i>
                {{ t("goBack") }}
              </button>
            </div>
          </div>
        </FadeInSection>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {useI18n} from "@/composables/useI18n";
import {useRouter} from "vue-router";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FadeInSection from "@/components/ui/FadeInSection.vue";

const {t} = useI18n();
const router = useRouter();
</script>

<style scoped>
.ritual-page {
  height: 100vh;
  background-color: #05070a;
  overflow: hidden;
}

.pnf-main {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mist-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(200, 178, 115, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.ritual-box-404 {
  text-align: center;
  padding: 60px;
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(200, 178, 115, 0.1);
  backdrop-filter: blur(10px);
  max-width: 600px;
}

.glitch-text {
  font-family: 'Playfair Display', serif;
  font-size: 120px;
  color: var(--myst-gold);
  margin: 0;
  line-height: 1;
  font-weight: 900;
  text-shadow: 0 0 30px rgba(200, 178, 115, 0.3);
}

.ritual-divider {
  width: 60px;
  height: 1px;
  background: var(--myst-gold);
  margin: 30px auto;
}

.pnf-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #fff;
  margin-bottom: 16px;
}

.pnf-message {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 40px;
}

.btn-ritual {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 32px;
  background: transparent;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ritual:hover {
  background: rgba(200, 178, 115, 0.1);
  box-shadow: 0 0 20px rgba(200, 178, 115, 0.2);
}

@media (max-width: 768px) {
  .glitch-text { font-size: 80px; }
  .ritual-box-404 { padding: 40px 20px; margin: 20px; }
}
</style>
