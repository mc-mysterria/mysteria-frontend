<template>
  <div class="page-container">
    <HeaderItem />

    <main class="guide-main">
      <!-- Dynamic Background -->
      <div class="step-background" :class="`step-bg-${currentStep}`"></div>

      <div class="guide-container">
        <!-- Navigation and Step Slider -->
        <div class="slider-wrapper">
          <!-- Left Navigation -->
          <button
            @click="previousStep"
            :disabled="currentStep === 0"
            class="nav-arrow nav-arrow-left"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Step Slider -->
          <div class="guide-slider">
          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${((currentStep + 1) / totalSteps) * 100}%` }"
              ></div>
            </div>
            <div class="step-counter">
              {{ currentStep + 1 }} / {{ totalSteps }}
            </div>
          </div>


          <!-- Step Content -->
          <div class="step-content">
            <transition name="slide" mode="out-in">
              <div :key="currentStep" class="step-slide">

                <!-- Step 1: Copy Server IP -->
                <div v-if="currentStep === 0" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012-2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep1FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep1FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="server-info">
                      <div class="server-details-grid">
                        <div class="info-item">
                          <span class="info-label">{{ t("serverVersion") }}:</span>
                          <span class="info-value">{{ t("minecraftVersion") }}</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ t("serverEdition") }}:</span>
                          <span class="info-value">{{ t("serverEdition") }}</span>
                        </div>
                      </div>

                      <div class="server-ip-section">
                        <div class="server-ip">
                          <span class="ip-label">{{ t("serverIP") }}:</span>
                          <code class="ip-address">{{ serverIP }}</code>
                        </div>
                        <button @click="copyToClipboard" class="copy-button">
                          <svg v-if="!isCopied" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012-2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                          </svg>
                          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                          {{ isCopied ? t('copySuccess') : t('copyIP') }}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Step 2: Add Server -->
                <div v-if="currentStep === 1" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep2FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep2FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="instruction-list">
                        <div class="instruction-item">
                          <div class="instruction-number">1</div>
                          <span>{{ t('guideStep2Instruction1') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">2</div>
                          <span>{{ t('guideStep2Instruction2') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">3</div>
                          <span>{{ t('guideStep2Instruction3') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">4</div>
                          <span>{{ t('guideStep2Instruction4') }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="step-image">
                      <img src="@/assets/images/guide/ip.webp" alt="Server IP Guide" class="guide-image" />
                    </div>
                  </div>
                </div>

                <!-- Step 3: Join Server -->
                <div v-if="currentStep === 2" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep3FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep3FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="instruction-list">
                        <div class="instruction-item">
                          <div class="instruction-number">1</div>
                          <span>{{ t('guideStep3Instruction1') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">2</div>
                          <span>{{ t('guideStep3Instruction2') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">3</div>
                          <span>{{ t('guideStep3Instruction3') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">4</div>
                          <span>{{ t('guideStep3Instruction4') }}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Step 4: Verify Account -->
                <div v-if="currentStep === 3" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep4FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep4FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="instruction-list">
                        <div class="instruction-item">
                          <div class="instruction-number">1</div>
                          <span>{{ t('guideStep4Instruction1') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">2</div>
                          <span>{{ t('guideStep4Instruction2') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">3</div>
                          <span>{{ t('guideStep4Instruction3') }}</span>
                        </div>
                      </div>

                      <router-link to="/profile" class="profile-link">
                        {{ t('goToProfile') }}
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <polyline points="12,5 19,12 12,19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </router-link>
                    </div>

                    <div class="step-image">
                      <img src="@/assets/images/guide/verify.webp" alt="Verify Account Guide" class="guide-image" />
                    </div>
                  </div>
                </div>

                <!-- Step 5: Enter World -->
                <div v-if="currentStep === 4" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep5FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep5FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="instruction-list">
                        <div class="instruction-item">
                          <div class="instruction-number">1</div>
                          <span>{{ t('guideStep5Instruction1') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">2</div>
                          <span>{{ t('guideStep5Instruction2') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">3</div>
                          <span>{{ t('guideStep5Instruction3') }}</span>
                        </div>
                        <div class="instruction-item">
                          <div class="instruction-number">4</div>
                          <span>{{ t('guideStep5Instruction4') }}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Step 6: Learn Lore -->
                <div v-if="currentStep === 5" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep6FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep6FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="lore-sections">
                        <div class="lore-item">
                          <h3>{{ t('guideStep6LoreTitle1') }}</h3>
                          <p>{{ t('guideStep6LoreDesc1') }}</p>
                        </div>
                        <div class="lore-item">
                          <h3>{{ t('guideStep6LoreTitle2') }}</h3>
                          <p>{{ t('guideStep6LoreDesc2') }}</p>
                        </div>
                      </div>

                      <div class="lore-links">
                        <div class="lore-links-grid">
                          <a href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505" class="external-link" target="_blank" rel="noopener noreferrer">
                            {{ t('readWebNovel') }}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </a>
                          <a href="https://www.crunchyroll.com/series/GEXH3W2EZ/lord-of-mysteries" class="external-link" target="_blank" rel="noopener noreferrer">
                            {{ t('watchAnime') }}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Step 7: Start Playing -->
                <div v-if="currentStep === 6" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="5,3 19,12 5,21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('guideStep7FullTitle') }}</h2>
                    <p class="step-description">{{ t('guideStep7FullDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="final-tips">
                      <h3>{{ t('guideStep7JourneyTitle') }}</h3>
                      <div class="tips-grid">
                        <div class="tip-item">
                          <div class="tip-icon">⚡</div>
                          <p>{{ t('guideStep7Tip1') }}</p>
                        </div>
                        <div class="tip-item">
                          <div class="tip-icon">🎭</div>
                          <p>{{ t('guideStep7Tip2') }}</p>
                        </div>
                        <div class="tip-item">
                          <div class="tip-icon">🌟</div>
                          <p>{{ t('guideStep7Tip3') }}</p>
                        </div>
                        <div class="tip-item">
                          <div class="tip-icon">📚</div>
                          <p>{{ t('guideStep7Tip4') }}</p>
                        </div>
                      </div>

                      <div class="final-actions">
                        <a href="https://discord.com/invite/jc7GSxBWgb" class="action-button discord" target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
                          </svg>
                          {{ t('joinDiscord') }}
                        </a>
                        <router-link to="/rules" class="action-button rules">
                          {{ t('readRules') }}
                        </router-link>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Step 8: Harmoniya Launcher (Optional) -->
                <div v-if="currentStep === 7" class="step">
                  <div class="step-header">
                    <div class="step-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="7.5,4.21 12,6.81 16.5,4.21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="7.5,19.79 7.5,14.6 3,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="21,12 16.5,14.6 16.5,19.79" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="12,22.81 12,17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <line x1="12" y1="6.81" x2="12" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <h2 class="step-title">{{ t('launcherTitle') }} ({{ t('optional') }})</h2>
                    <p class="step-description">{{ t('launcherDescription') }}</p>
                  </div>

                  <div class="step-body">
                    <div class="step-instructions">
                      <div class="launcher-features">
                        <h3>{{ t('launcherBenefits') }}</h3>
                        <div class="feature-list">
                          <div class="feature-item">
                            <div class="feature-icon">⚙️</div>
                            <span>{{ t('launcherFeature1') }}</span>
                          </div>
                          <div class="feature-item">
                            <div class="feature-icon">🔄</div>
                            <span>{{ t('launcherFeature2') }}</span>
                          </div>
                          <div class="feature-item">
                            <div class="feature-icon">🎮</div>
                            <span>{{ t('launcherFeature4') }}</span>
                          </div>
                          <div class="feature-item">
                            <div class="feature-icon">✨</div>
                            <span>{{ t('launcherFeature5') }}</span>
                          </div>
                        </div>

                        <div class="launcher-actions">
                          <a href="https://launcher.harmoniya.net/windows" class="launcher-download-button" target="_blank" rel="noopener noreferrer">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            {{ t('downloadLauncher') }}
                          </a>
                          <p class="optional-note">{{ t('launcherFeature3') }}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </transition>
          </div>

        </div>

          <!-- Right Navigation -->
          <button
            @click="nextStep"
            :disabled="currentStep === totalSteps - 1"
            class="nav-arrow nav-arrow-right"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

        </div>
      </div>
    </main>

    <!-- Step Indicators as Footer -->
    <footer class="step-indicators-footer">
      <div class="step-indicators">
        <div
          v-for="(step, index) in steps"
          :key="index"
          @click="goToStep(index)"
          class="step-indicator"
          :class="{
            active: index === currentStep,
            completed: index < currentStep
          }"
        >
          <div class="indicator-dot"></div>
          <span class="indicator-label">{{ step.title }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "@/composables/useI18n";
import HeaderItem from "@/components/layout/HeaderItem.vue";

const { t } = useI18n();

const serverIP = computed(() => t("serverAddress"));
const isCopied = ref(false);

// Slider state
const currentStep = ref(0);
const totalSteps = 8;

// Step definitions using i18n
const steps = computed(() => [
  { title: t('guideStep1Title'), description: t('guideStep1Description') },
  { title: t('guideStep2Title'), description: t('guideStep2Description') },
  { title: t('guideStep3Title'), description: t('guideStep3Description') },
  { title: t('guideStep4Title'), description: t('guideStep4Description') },
  { title: t('guideStep5Title'), description: t('guideStep5Description') },
  { title: t('guideStep6Title'), description: t('guideStep6Description') },
  { title: t('guideStep7Title'), description: t('guideStep7Description') },
  { title: t('guideStep8Title'), description: t('guideStep8Description') }
]);

// Navigation functions
const nextStep = () => {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const goToStep = (index: number) => {
  currentStep.value = index;
};

// Copy to clipboard function
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(serverIP.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  } catch (err) {
    console.error("Failed to copy: ", err);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = serverIP.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    // Show success feedback for fallback too
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 1500);
  }
};
</script>

<style scoped>
/* Page Container */
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.guide-main {
  flex: 1;
  background: var(--myst-bg);
  display: flex;
  flex-direction: column;
  margin-top: 80px;
  min-height: 0;
  position: relative;
  overflow: auto;
}

/* Dynamic Step Background */
.step-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(8px) brightness(0.3);
  transition: all 0.8s ease-in-out;
  z-index: 1;
}

.step-bg-0 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ff6b6b;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%23feca57;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%23ff9ff3;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g1)"/><circle cx="200" cy="150" r="80" fill="%23fff" opacity="0.1"/><circle cx="800" cy="400" r="120" fill="%23fff" opacity="0.05"/><circle cx="1000" cy="200" r="60" fill="%23fff" opacity="0.08"/></svg>');
}

.step-bg-1 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2310ac84;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%231dd1a1;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%2355efc4;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g2)"/><rect x="150" y="100" width="100" height="100" rx="20" fill="%23fff" opacity="0.1"/><rect x="800" y="300" width="80" height="80" rx="15" fill="%23fff" opacity="0.08"/></svg>');
}

.step-bg-2 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ffecd2;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%23fcb69f;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%23ff8a80;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g3)"/><circle cx="300" cy="300" r="50" fill="%23fff" opacity="0.1"/><circle cx="900" cy="200" r="70" fill="%23fff" opacity="0.06"/></svg>');
}

.step-bg-3 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23a8edea;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%23fed6e3;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%23d299c2;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g4)"/><path d="M200,400 Q300,300 400,400 T600,400" stroke="%23fff" stroke-width="10" fill="none" opacity="0.1"/></svg>');
}

.step-bg-4 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23667eea;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%23764ba2;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%23f093fb;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g5)"/><polygon points="400,200 500,150 600,200 550,300 450,300" fill="%23fff" opacity="0.1"/></svg>');
}

.step-bg-5 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f093fb;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%23f5576c;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%234ac29a;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g6)"/><rect x="300" y="200" width="150" height="100" rx="25" fill="%23fff" opacity="0.1"/></svg>');
}

.step-bg-6 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g7" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ffecd2;stop-opacity:0.8"/><stop offset="50%" style="stop-color:%23fcb69f;stop-opacity:0.6"/><stop offset="100%" style="stop-color:%23ff9a9e;stop-opacity:0.4"/></linearGradient><radialGradient id="r1" cx="50%" cy="50%"><stop offset="0%" style="stop-color:%23fff;stop-opacity:0.3"/><stop offset="100%" style="stop-color:%23fff;stop-opacity:0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g7)"/><circle cx="600" cy="400" r="200" fill="url(%23r1)"/><circle cx="200" cy="600" r="100" fill="%23fff" opacity="0.1"/><circle cx="1000" cy="100" r="80" fill="%23fff" opacity="0.08"/></svg>');
}

.step-bg-7 {
  background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g8" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2354a0ff;stop-opacity:0.7"/><stop offset="50%" style="stop-color:%235f27cd;stop-opacity:0.5"/><stop offset="100%" style="stop-color:%2300d2d3;stop-opacity:0.3"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g8)"/><polygon points="300,200 400,100 500,200 400,300" fill="%23fff" opacity="0.1"/><polygon points="700,500 850,400 1000,500 850,600" fill="%23fff" opacity="0.06"/><rect x="400" y="600" width="120" height="80" rx="15" fill="%23fff" opacity="0.08"/></svg>');
}

.guide-container {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  z-index: 2;
}

/* Slider Wrapper with External Navigation */
.slider-wrapper {
  display: flex;
  align-items: stretch;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

/* Guide Slider */
.guide-slider {
  background: transparent;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* Progress Bar */
.progress-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border-radius: 2px;
  margin-right: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--myst-gold), color-mix(in srgb, var(--myst-gold) 80%, transparent));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.step-counter {
  color: var(--myst-gold);
  font-weight: 600;
  font-size: 12px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

/* Navigation Arrows */
.nav-arrow {
  width: 60px;
  height: 60px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 32px;
  font-weight: 300;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  align-self: center;
}

.nav-arrow:hover:not(:disabled) {
  color: var(--myst-gold);
  transform: scale(1.2);
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.8),
    0 0 10px var(--myst-gold),
    0 0 15px var(--myst-gold),
    0 0 20px var(--myst-gold);
}

.nav-arrow:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  transform: none;
  text-shadow: none;
}

.nav-arrow svg {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.nav-arrow:hover:not(:disabled) svg {
  filter:
    drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))
    drop-shadow(0 0 10px var(--myst-gold))
    drop-shadow(0 0 15px var(--myst-gold));
}

.nav-arrow-left {
  margin-right: 8px;
}

.nav-arrow-right {
  margin-left: 8px;
}

/* Step Content */
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding-bottom: 20px;
}

.step-slide {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  min-height: 0;
  overflow: auto;
}

.step-header {
  text-align: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.step-icon {
  width: 48px;
  height: 48px;
  color: var(--myst-gold);
  margin: 0 auto 12px;
}

.step-icon svg {
  width: 100%;
  height: 100%;
}

.step-title {
  font-size: 20px;
  font-family: "Inter", sans-serif;
  font-weight: 700;
  color: var(--myst-ink-strong);
  margin-bottom: 6px;
}

.step-description {
  font-size: 13px;
  color: var(--myst-ink-muted);
  line-height: 1.4;
}

.step-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
  align-items: start;
  overflow: hidden;
}

.step-body:has(.step-image:empty),
.step-body:not(:has(.step-image)) {
  grid-template-columns: 1fr;
  justify-items: center;
}

.step-body:has(.step-image:empty) .step-instructions,
.step-body:not(:has(.step-image)) .step-instructions {
  max-width: 700px;
  text-align: left;
  width: 100%;
}

/* Copy IP step specific styling */
.step:first-child .step-instructions {
  max-width: 900px;
}

.step:first-child .server-ip {
  font-size: 16px;
  padding: 16px;
}

.step:first-child .ip-address {
  font-size: 16px;
  padding: 10px 12px;
}

.step:first-child .copy-button {
  font-size: 14px;
  padding: 12px 20px;
}

/* Step Instructions */
.step-instructions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
  transition: all 0.2s ease;
}

.instruction-item:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.instruction-number {
  background: var(--myst-gold);
  color: var(--myst-bg);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.instruction-item span {
  color: var(--myst-ink);
  font-weight: 500;
  font-size: 13px;
  line-height: 1.3;
}

/* Server Info */
.server-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.server-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.info-label {
  color: var(--myst-ink-muted);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: var(--myst-gold);
  font-weight: 600;
  font-size: 13px;
}

.server-ip-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.server-ip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.ip-label {
  color: var(--myst-ink);
  font-weight: 500;
  font-size: 14px;
}

.ip-address {
  font-family: "Minecraft", monospace;
  font-size: 14px;
  color: var(--myst-gold);
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 6px 8px;
  border-radius: 4px;
  flex: 1;
}

.copy-button {
  background: var(--myst-gold);
  border: none;
  color: var(--myst-bg);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
}

.copy-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 80%, transparent);
}

.copy-button svg {
  width: 16px;
  height: 16px;
}

/* Lore Sections */
.lore-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.lore-item {
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.lore-item h3 {
  color: var(--myst-ink-strong);
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
}

.lore-item p {
  color: var(--myst-ink-muted);
  margin: 0;
  font-size: 12px;
}

.lore-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lore-links-title {
  color: var(--myst-gold);
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-align: center;
}

.lore-links-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}

.external-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--myst-gold);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 10px 8px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  font-size: 11px;
  text-align: center;
  min-height: 40px;
  width: 100%;
  box-sizing: border-box;
}

.external-link:hover {
  color: color-mix(in srgb, var(--myst-gold) 80%, transparent);
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
}

.external-link svg {
  width: 14px;
  height: 14px;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--myst-gold);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  font-size: 13px;
  margin-top: 8px;
}

.profile-link:hover {
  color: color-mix(in srgb, var(--myst-gold) 80%, transparent);
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
}

.profile-link svg {
  width: 14px;
  height: 14px;
}

/* Final Tips */
.final-tips {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.final-tips h3 {
  color: var(--myst-gold);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.tips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
}

.tip-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tip-item p {
  color: var(--myst-ink);
  margin: 0;
  line-height: 1.4;
  font-size: 12px;
}

.final-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 13px;
}

.action-button.discord {
  background: #5865f2;
  color: white;
}

.action-button.discord:hover {
  background: #4752c4;
}

.action-button.rules {
  background: transparent;
  color: var(--myst-gold);
  border: 2px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.action-button.rules:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: var(--myst-gold);
}

.action-button svg {
  width: 16px;
  height: 16px;
}

/* Launcher Features */
.launcher-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.launcher-features h3 {
  color: var(--myst-gold);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, white 5%, transparent);
  transition: all 0.2s ease;
}

.feature-item:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.feature-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.feature-item span {
  color: var(--myst-ink);
  font-weight: 500;
  font-size: 14px;
}

.launcher-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}

.launcher-download-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 14px;
}

.launcher-download-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 80%, transparent);
  transform: translateY(-1px);
}

.launcher-download-button svg {
  width: 18px;
  height: 18px;
}

.optional-note {
  color: var(--myst-ink-muted);
  font-size: 12px;
  text-align: center;
  font-style: italic;
  margin: 0;
}

/* Step Images */
.step-image {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
}

/* Align images with first instruction blocks */
.step-body {
  align-items: flex-start;
}

.step-image {
  align-self: flex-start;
}

.guide-image {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  transition: all 0.2s ease;
}

.guide-image:hover {
  border-color: var(--myst-gold);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.placeholder-image {
  width: 100%;
  height: 200px;
  background: color-mix(in srgb, var(--myst-bg) 40%, transparent);
  border: 2px dashed color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--myst-ink-muted);
  font-style: italic;
  text-align: center;
  transition: all 0.2s ease;
  font-size: 13px;
}

.placeholder-image:hover {
  border-color: var(--myst-gold);
  background: color-mix(in srgb, var(--myst-gold) 5%, transparent);
}

/* Step Indicators Footer */
.step-indicators-footer {
  background: var(--myst-bg);
  border-top: 1px solid color-mix(in srgb, white 15%, transparent);
  padding: 16px 0;
  margin-top: 12px;
}

.step-indicators {
  display: flex;
  justify-content: center;
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  flex-wrap: wrap;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px 6px;
  border-radius: 6px;
  min-width: 70px;
}

.step-indicator:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  transform: translateY(-2px);
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 2px solid color-mix(in srgb, white 20%, transparent);
  transition: all 0.2s ease;
}

.step-indicator.active .indicator-dot {
  background: var(--myst-gold);
  border-color: var(--myst-gold);
}

.step-indicator.completed .indicator-dot {
  background: color-mix(in srgb, var(--myst-gold) 60%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 60%, transparent);
}

.indicator-label {
  font-size: 10px;
  color: var(--myst-ink-muted);
  font-weight: 500;
  text-align: center;
  transition: color 0.2s ease;
  line-height: 1.2;
}

.step-indicator.active .indicator-label {
  color: var(--myst-gold);
  font-weight: 600;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .step-body {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .server-details-grid {
    grid-template-columns: 1fr;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }

  .lore-links-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }

  .final-actions {
    flex-direction: column;
    align-items: center;
  }

  .slider-wrapper {
    gap: 12px;
  }

  .nav-arrow {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }

  .nav-arrow svg {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 768px) {
  .guide-container {
    padding: 8px;
  }

  /* Hide images on mobile, show only text */
  .step-image {
    display: none;
  }

  .step-body {
    grid-template-columns: 1fr !important;
    justify-items: center;
  }

  .step-instructions {
    max-width: 100% !important;
    width: 100%;
  }

  .slider-wrapper {
    gap: 8px;
  }

  .nav-arrow {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .nav-arrow svg {
    width: 24px;
    height: 24px;
  }

  .step {
    padding: 16px 0;
  }

  .step-title {
    font-size: 20px;
  }

  .step-indicators-footer {
    padding: 16px 0;
  }

  .step-indicators {
    gap: 8px;
    padding: 0 12px;
  }

  .step-indicator {
    min-width: 60px;
    padding: 8px 4px;
  }

  .indicator-label {
    font-size: 9px;
  }

  .indicator-dot {
    width: 10px;
    height: 10px;
  }

  .progress-container {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }

  .progress-bar {
    margin-right: 0;
  }

  .placeholder-image {
    height: 150px;
    font-size: 11px;
  }
}

@media (max-width: 640px) {
  .step-icon {
    width: 40px;
    height: 40px;
  }

  .step-title {
    font-size: 18px;
  }

  .server-ip {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .copy-button {
    width: 100%;
  }
}
</style>
