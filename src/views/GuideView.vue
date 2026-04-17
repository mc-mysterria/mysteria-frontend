<template>
  <div class="ritual-page page-container">
    <HeaderItem/>

    <main class="ritual-main">
      <!-- Atmospheric Background -->
      <div class="ritual-bg-overlay" :class="`phase-${currentStep}`">
        <div class="mist-layer one"></div>
      </div>

      <div class="ritual-container">
        <!-- Unified Header - Compacted -->
        <div class="myst-page-header compact">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h1 class="myst-header-label">{{ t("ritualOfInitiation") }}</h1>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>

        <!-- Initiation Progress - Enlarged -->
        <div class="ritual-progress-area">
          <div class="ritual-steps-sigils">
            <div
                v-for="(step, index) in steps"
                :key="index"
                :class="{
                'is-active': index === currentStep,
                'is-done': index < currentStep
              }"
                class="sigil-step"
                @click="goToStep(index)"
            >
              <div class="sigil-icon">
                <span v-if="index < currentStep" class="done-mark">†</span>
                <span v-else class="step-idx">{{ index + 1 }}</span>
              </div>
              <span class="sigil-label">{{ step.title.split(' ')[0] }}</span>
            </div>
          </div>
          <div class="ritual-line-container">
            <div class="ritual-line-base"></div>
            <div class="ritual-line-fill" :style="{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }"></div>
          </div>
        </div>

        <!-- Ritual Slider -->
        <div class="ritual-slider-wrapper">
          <button
              :disabled="currentStep === 0"
              class="ritual-nav left"
              @click="previousStep"
              :aria-label="t('previous')"
          >
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <div class="ritual-card-portal">
            <transition mode="out-in" name="ritual-fade">
              <div :key="currentStep" class="ritual-slide">
                
                <!-- Step Header - Compacted -->
                <div class="slide-header">
                  <h2 class="slide-title">{{ steps[currentStep].title }}</h2>
                  <p class="slide-subtitle">{{ steps[currentStep].description }}</p>
                </div>

                <!-- Step Body -->
                <div class="slide-body no-scrollbar">
                  <!-- Step 1: Gateway (IP) -->
                  <div v-if="currentStep === 0" class="content-ritual centered-content">
                    <div class="essence-grid">
                      <div class="essence-item">
                        <span class="essence-label">{{ t("serverVersion") }}</span>
                        <span class="essence-val">{{ t("minecraftVersion") }}</span>
                      </div>
                      <div class="essence-item">
                        <span class="essence-label">{{ t("serverEdition") }}</span>
                        <span class="essence-val">{{ t("serverEdition") }}</span>
                      </div>
                    </div>
                    <div class="ritual-ip-box">
                      <div class="ip-label">{{ t("gatewayAddress") }}</div>
                      <div class="ip-display">
                        <code class="ip-sigil">{{ serverIP }}</code>
                        <button class="btn-ritual" @click="copyToClipboard">
                          <i :class="isCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
                          <span>{{ isCopied ? t('copySuccess') : t('copyIP') }}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Step 2 & 4: Instructions with Images (Join & Verify) -->
                  <div v-else-if="[1, 3].includes(currentStep)" class="content-ritual has-image">
                    <div class="instruction-list">
                      <div
                          v-for="i in (currentStep === 1 ? 4 : 3)"
                          :key="i"
                          class="ritual-instruction-item"
                      >
                        <div class="item-number">{{ i }}</div>
                        <p class="item-text">{{ t(`guideStep${currentStep + 1}Instruction${i}`) }}</p>
                      </div>
                      <div v-if="currentStep === 3" class="action-row">
                        <router-link class="btn-ritual" to="/profile">
                          {{ t('goToProfile') }} <i class="fa-solid fa-arrow-right"></i>
                        </router-link>
                      </div>
                    </div>
                    <div class="image-frame">
                      <img :src="getStepImage()" class="ritual-img" alt="Ritual Guide"/>
                      <div class="frame-edge"></div>
                    </div>
                  </div>

                  <!-- Step 3 & 5: Grid Instructions (Portal & Rules) -->
                  <div v-else-if="[2, 4].includes(currentStep)" class="content-ritual centered-content">
                    <div class="ritual-instruction-grid">
                      <div
                          v-for="i in 4"
                          :key="i"
                          class="ritual-instruction-card"
                      >
                        <div class="card-idx">{{ i }}</div>
                        <p class="item-text">{{ t(`guideStep${currentStep + 1}Instruction${i}`) }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Step 6: Lore -->
                  <div v-else-if="currentStep === 5" class="content-ritual centered-content">
                    <div class="lore-ritual-grid">
                      <div class="lore-entry">
                        <h3 class="lore-title">{{ t('guideStep6LoreTitle1') }}</h3>
                        <p class="item-text">{{ t('guideStep6LoreDesc1') }}</p>
                      </div>
                      <div class="lore-entry">
                        <h3 class="lore-title">{{ t('guideStep6LoreTitle2') }}</h3>
                        <p class="item-text">{{ t('guideStep6LoreDesc2') }}</p>
                      </div>
                    </div>
                    <div class="action-row centered">
                      <a class="btn-ritual" href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505" target="_blank">{{ t('readWebNovel') }}</a>
                      <a class="btn-ritual" href="https://www.crunchyroll.com/series/GEXH3W2EZ/lord-of-mysteries" target="_blank">{{ t('watchAnime') }}</a>
                    </div>
                  </div>

                  <!-- Step 7: COI Client -->
                  <div v-else-if="currentStep === 6" class="content-ritual centered-content">
                    <div class="launcher-benefit-ritual">
                      <div class="benefit-item-ritual">
                        <i class="fa-solid fa-star-of-life"></i>
                        <span class="item-text">{{ t('coiClientBenefit1') }}</span>
                      </div>
                      <div class="benefit-item-ritual">
                        <i class="fa-solid fa-star-of-life"></i>
                        <span class="item-text">{{ t('coiClientBenefit2') }}</span>
                      </div>
                      <div class="benefit-item-ritual">
                        <i class="fa-solid fa-star-of-life"></i>
                        <span class="item-text">{{ t('coiClientBenefit3') }}</span>
                      </div>
                    </div>
                    <div class="launcher-ritual-footer">
                      <div class="action-row centered">
                        <a class="btn-ritual" href="https://github.com/ikeepcalm/coi-client" target="_blank">{{ t('coiClientAcquire') }}</a>
                      </div>
                      <p class="optional-ritual">{{ t('coiClientOptional') }}</p>
                    </div>
                  </div>

                </div>
              </div>
            </transition>
          </div>

          <button
              :disabled="currentStep === totalSteps - 1"
              class="ritual-nav right"
              @click="nextStep"
              :aria-label="t('next')"
          >
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue";
import {useI18n} from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import ipImg from "@/assets/images/guide/ip.webp";
import verifyImg from "@/assets/images/guide/verify.webp";

const {t} = useI18n();

const serverIP = computed(() => t("serverAddress"));
const isCopied = ref(false);

const currentStep = ref(0);
const totalSteps = 7;

const steps = computed(() => [
  {title: t('guideStep1FullTitle'), description: t('guideStep1FullDescription')},
  {title: t('guideStep2FullTitle'), description: t('guideStep2FullDescription')},
  {title: t('guideStep3FullTitle'), description: t('guideStep3FullDescription')},
  {title: t('guideStep4FullTitle'), description: t('guideStep4FullDescription')},
  {title: t('guideStep5FullTitle'), description: t('guideStep5FullDescription')},
  {title: t('guideStep6FullTitle'), description: t('guideStep6FullDescription')},
  {title: t('coiClientTitle'), description: t('coiClientDescription')}
]);

const nextStep = () => { if (currentStep.value < totalSteps - 1) currentStep.value++; };
const previousStep = () => { if (currentStep.value > 0) currentStep.value--; };
const goToStep = (index: number) => { currentStep.value = index; };

const getStepImage = () => {
  if (currentStep.value === 1) return ipImg;
  if (currentStep.value === 3) return verifyImg;
  return "";
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(serverIP.value);
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 1500);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
</script>

<style scoped>
/* RITUAL OF INITIATION - OPTIMIZED FOR 1080P NO SCROLL */

.ritual-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #05070a;
  overflow: hidden;
}

.ritual-main {
  flex: 1;
  position: relative;
  margin-top: 80px; /* Header height */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ritual-bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  transition: background-color 1.5s ease;
}

.phase-0 { background-color: rgba(200, 178, 115, 0.03); }

.mist-layer {
  position: absolute;
  inset: -100%;
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 40%);
  animation: mistMove 40s linear infinite;
}

@keyframes mistMove {
  from { transform: translate(0, 0) rotate(0deg); }
  to { transform: translate(5%, 5%) rotate(360deg); }
}

.ritual-container {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 40px 30px; /* Reduced vertical padding */
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Compact Header Override */
.myst-page-header.compact {
  margin: 15px 0 25px; /* Significantly reduced margins */
}

/* Progress Area - Enlarged and More Visible */
.ritual-progress-area {
  margin-bottom: 30px;
  flex-shrink: 0;
}

.ritual-steps-sigils {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.sigil-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  z-index: 5;
}

.sigil-icon {
  width: 36px; height: 36px; /* Increased size from 28px */
  border: 1px solid rgba(255, 255, 255, 0.2); /* Increased visibility */
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; /* Increased size */
  background: #05070a;
  transition: all 0.4s ease;
  color: #666;
}

.sigil-step.is-active .sigil-icon {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
  box-shadow: 0 0 20px rgba(200, 178, 115, 0.4);
  transform: scale(1.15);
}

.sigil-step.is-done .sigil-icon {
  border-color: rgba(200, 178, 115, 0.6);
  color: var(--myst-gold);
}

.sigil-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; /* Slightly larger */
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #555;
  font-weight: 500;
}

.sigil-step.is-active .sigil-label { color: var(--myst-gold); font-weight: 700; }
.sigil-step.is-done .sigil-label { color: #888; }

.ritual-line-container {
  position: relative;
  height: 1px;
  width: 100%;
  top: -42px; /* Adjusted for larger icons */
}

.ritual-line-base {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
}

.ritual-line-fill {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  background: var(--myst-gold);
  transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 10px var(--myst-gold);
}

/* Slider & Navigation Arrows */
.ritual-slider-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 0;
}

.ritual-nav {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 50px; height: 50px;
  border-radius: 50%;
  color: #888;
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.ritual-nav:hover:not(:disabled) { 
  color: var(--myst-gold); 
  border-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.05);
  transform: scale(1.1);
}
.ritual-nav:disabled { opacity: 0.1; cursor: not-allowed; }

.ritual-card-portal {
  flex: 1;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ritual-slide {
  padding: 30px 50px; /* Reduced vertical padding */
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.slide-header {
  text-align: center;
  margin-bottom: 25px; /* Reduced margin */
  flex-shrink: 0;
}

.slide-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; /* Slightly smaller */
  color: var(--myst-offwhite);
  margin-bottom: 8px;
}

.slide-subtitle {
  font-size: 14px;
  color: #888;
  max-width: 650px;
  margin: 0 auto;
}

.slide-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically when possible */
}

/* Content Layouts */
.centered-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.has-image {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 40px;
  align-items: center;
}

/* Common Elements */
.item-text {
  font-size: 14px; /* Reduced for better fit */
  line-height: 1.6;
  color: #aaa;
  margin: 0;
}

.action-row {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.action-row.centered { justify-content: center; }

.btn-ritual {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: transparent;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
}

.btn-ritual:hover {
  background: rgba(200, 178, 115, 0.1);
  box-shadow: 0 0 15px rgba(200, 178, 115, 0.2);
}

/* Numbered List Alignment */
.ritual-instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 15px; /* Reduced spacing */
  text-align: left;
}

.item-number {
  flex-shrink: 0;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
}

/* Image Frame */
.image-frame {
  position: relative;
  background: #000;
  border: 1px solid rgba(255, 255, 255, 0.05);
  max-height: 300px;
  overflow: hidden;
}

.ritual-img {
  width: 100%; height: 100%;
  object-fit: contain;
  opacity: 0.8;
}

.frame-edge {
  position: absolute; inset: 10px;
  border: 1px solid rgba(200, 178, 115, 0.15);
  pointer-events: none;
}

/* Grid Instructions */
.ritual-instruction-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 850px;
}

.ritual-instruction-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.card-idx {
  font-family: 'JetBrains Mono', monospace;
  color: var(--myst-gold);
  font-size: 12px;
  letter-spacing: 4px;
  opacity: 0.6;
}

/* Essence (Step 1) */
.essence-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 550px;
}

.essence-item {
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.essence-label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #555;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.essence-val {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: var(--myst-gold);
}

.ip-display {
  display: inline-flex;
  align-items: center;
  gap: 20px;
  padding: 14px 28px;
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
}

.ip-sigil {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  color: var(--myst-gold);
}

/* Lore & Tips Grids */
.lore-ritual-grid, .tips-ritual-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 25px;
  width: 100%;
  max-width: 950px;
}

.lore-entry, .tip-ritual-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

.lore-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: var(--myst-gold);
  margin-bottom: 10px;
}

.tip-ritual-icon { font-size: 20px; margin-bottom: 12px; }

/* Launcher Benefits */
.launcher-benefit-ritual {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 450px;
  text-align: left;
}

.benefit-item-ritual { display: flex; align-items: center; gap: 12px; }
.benefit-item-ritual i { color: var(--myst-gold); font-size: 10px; }

.optional-ritual {
  font-size: 11px;
  color: #555;
  margin-top: 20px;
}

/* Transitions */
.ritual-fade-enter-active, .ritual-fade-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.ritual-fade-enter-from { opacity: 0; transform: translateX(20px); }
.ritual-fade-leave-to { opacity: 0; transform: translateX(-20px); }

/* Scrollbar Removal */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@media (max-width: 1024px) {
  .has-image { grid-template-columns: 1fr; }
  .image-frame { display: none; }
}
</style>
