<template>
  <HeaderItem />
  <div class="game">
    <div class="game-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1 class="hero-title">{{ t('gameGuideTitle') }}</h1>
        <p class="hero-subtitle">{{ t('gameGuideSubtitle') }}</p>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Server Connection -->
        <div class="guide-card server-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('serverConnectionTitle') }}</h2>
          <p class="card-description">{{ t('serverConnectionDescription') }}</p>

          <div class="server-details">
            <div class="server-info-grid">
              <div class="info-item">
                <span class="info-label">{{ t('serverVersion') }}:</span>
                <span class="info-value">1.21.6</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('serverEdition') }}:</span>
                <span class="info-value">Java Edition</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('modsRequired') }}:</span>
                <span class="info-value">{{ t('noModsRequired') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ t('serverType') }}:</span>
                <span class="info-value">{{ t('rpgServer') }}</span>
              </div>
            </div>

            <div class="server-ip-container">
              <div class="server-ip">
                <span class="ip-label">{{ t('serverIP') }}:</span>
                <code class="ip-address" ref="ipAddress">{{ serverIP }}</code>
              </div>
              <button @click="copyToClipboard" class="copy-button" :title="t('copyToClipboard')">
                <svg v-if="!isCopied" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012-2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>{{ isCopied ? t('copySuccess') : t('copyIP') }}</span>
              </button>
            </div>
          </div>

          <!-- Server Image -->
          <div class="image-container server-image">
            <img src="@/assets/images/Server.png" :alt="t('serverScreenshotPlaceholder')" />
          </div>
        </div>

        <!-- Lore & Anime -->
        <div class="guide-card lore-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('loreAnimeTitle') }}</h2>
          <p class="card-description">{{ t('loreAnimeDescription') }}</p>

          <div class="recommendations">
            <div class="recommendation-item">
              <h3>{{ t('webNovelTitle') }}</h3>
              <p>{{ t('webNovelDescription') }}</p>
              <a href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505" class="external-link" target="_blank" rel="noopener noreferrer">
                {{ t('readWebNovel') }}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>

            <div class="recommendation-item">
              <h3>{{ t('animeTitle') }}</h3>
              <p>{{ t('animeDescription') }}</p>
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

          <!-- Lore Image -->
          <div class="image-container lore-image">
            <img src="@/assets/images/Anime.jpg" :alt="t('loreImagePlaceholder')" />
          </div>
        </div>

        <!-- Harmoniya Launcher -->
        <div class="guide-card launcher-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('launcherTitle') }}</h2>
          <p class="card-description">{{ t('launcherDescription') }}</p>

          <div class="launcher-features">
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('launcherFeature1') }}</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('launcherFeature2') }}</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('launcherFeature3') }}</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('launcherFeature4') }}</span>
            </div>
            <div class="feature-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ t('launcherFeature5') }}</span>
            </div>
          </div>

          <button
            class="download-button"
            @click="openLauncher"
            :title="t('downloadLauncher')"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ t('downloadLauncher') }}
          </button>

          <!-- Launcher Image -->
          <div class="image-container launcher-image">
            <img src="@/assets/images/Harmoniya.png" :alt="t('launcherScreenshotPlaceholder')" />
          </div>
        </div>

        <!-- Rules -->
        <div class="guide-card rules-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('rulesTitle') }}</h2>
          <p class="card-description">{{ t('rulesDescription') }}</p>

          <div class="main-rules-preview">
            <h3 class="preview-title">{{ t('mainRuleConcepts') }}</h3>
            <div class="rule-concepts">
              <div class="rule-concept" v-for="(concept, index) in tArray('ruleConcepts')" :key="index">
                <div class="concept-icon">⚡</div>
                <span>{{ concept }}</span>
              </div>
            </div>
          </div>

          <router-link to="/rules" class="rules-link">
            {{ t('readRules') }}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="12,5 19,12 12,19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>

        <!-- Discord Guild -->
        <div class="guide-card discord-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('discordTitle') }}</h2>
          <p class="card-description">{{ t('discordDescription') }}</p>

          <div class="discord-benefits">
            <div class="benefit-item" v-for="(benefit, index) in tArray('discordBenefits')" :key="index">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ benefit }}</span>
            </div>
          </div>

          <a href="#" class="discord-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.188.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
            </svg>
            {{ t('joinDiscord') }}
          </a>
        </div>

        <!-- Profile & Verification -->
        <div class="guide-card profile-card">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('profileTitle') }}</h2>
          <p class="card-description">{{ t('profileDescription') }}</p>

          <div class="verification-steps">
            <div class="step-item">
              <div class="step-number">1</div>
              <span>{{ t('verificationStep1') }}</span>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <span>{{ t('verificationStep2') }}</span>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <span>{{ t('verificationStep3') }}</span>
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

        <!-- Quick Tips -->
        <div class="guide-card tips-card full-width">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 class="card-title">{{ t('quickTipsTitle') }}</h2>
          <div class="tips-grid">
            <div class="tip-item" v-for="(tip, index) in tArray('quickTips')" :key="index">
              <div class="tip-icon">💡</div>
              <p>{{ tip }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="bottom-cta">
        <h2>{{ t('readyToStart') }}</h2>
        <p>{{ t('readyToStartDescription') }}</p>
        <div class="cta-buttons">
          <router-link to="/profile" class="cta-button primary">
            {{ t('setupProfile') }}
          </router-link>
          <router-link to="/rules" class="cta-button secondary">
            {{ t('reviewRules') }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Background Animation -->
    <div class="animation-wrapper">
      <div class="light light1" ref="light1"></div>
      <div class="light light2" ref="light2"></div>
      <div class="light light3" ref="light3"></div>
    </div>
  </div>
  <FooterItem />
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import HeaderItem from '@/components/layout/HeaderItem.vue'
import FooterItem from '@/components/layout/FooterItem.vue'

const { t, tArray } = useI18n()

// Server IP - this could be moved to a configuration file
const serverIP = 'play.mysterria.net'

// Refs for animation
const light1 = ref<HTMLElement | null>(null)
const light2 = ref<HTMLElement | null>(null)
const light3 = ref<HTMLElement | null>(null)
const ipAddress = ref<HTMLElement | null>(null)
const isCopied = ref(false)

const lightRefs = [light1, light2, light3]

// Copy to clipboard functionality
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(serverIP)
    // Show success feedback
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 1500)
  } catch (err) {
    console.error('Failed to copy: ', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = serverIP
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    // Show success feedback for fallback too
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 1500)
  }
}

onMounted(() => {
  nextTick(() => {
    const options = {
      threshold: 0.15,
      rootMargin: '0px 0px -5% 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('element-show')
          observer.unobserve(entry.target)
        }
      })
    }, options)

    lightRefs.forEach((lightRef) => {
      if (lightRef.value) {
        observer.observe(lightRef.value)
        lightRef.value.classList.add('element-animation')
      }
    })
  })
})

const openLauncher = () => {
  window.open('https://harmoniya.net/', '_blank')
}
</script>

<script lang="ts">
export default {
  name: 'GameView'
}
</script>

<style scoped>
@font-face {
  font-family: 'MontserratBold';
  src: url('@/assets/fonts/Montserrat-Bold.ttf');
}

@font-face {
  font-family: 'Minecraft';
  src: url('@/assets/fonts/Monocraft.ttf');
}

.game {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, rgba(12, 12, 24, 1) 0%, rgba(20, 20, 40, 1) 100%);
}

.game-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(2rem, 4vw, 4rem) clamp(1rem, 2vw, 2rem);
  position: relative;
  z-index: 1;
}

.hero-section {
  text-align: center;
  margin-bottom: clamp(2rem, 4vw, 3rem);
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-family: 'MontserratBold', sans-serif;
  font-weight: 700;
  background: linear-gradient(135deg, #6c5dd3 0%, #8b7eff 50%, #ee7828 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 12px rgba(108, 93, 211, 0.3);
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: clamp(3rem, 6vw, 4rem);
  align-items: stretch;
}

.guide-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: clamp(1.5rem, 3vw, 2rem);
  border: 1px solid rgba(108, 93, 211, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(108, 93, 211, 0.2);
  border-color: rgba(108, 93, 211, 0.3);
}

.guide-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6c5dd3, #8b7eff, #ee7828);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: #8b7eff;
}

.card-icon svg {
  width: 100%;
  height: 100%;
}

.card-title {
  font-size: clamp(1.3rem, 2.5vw, 1.6rem);
  font-family: 'MontserratBold', sans-serif;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.card-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 1.5rem;
  min-height: 3em;
}

/* Server Details Section */
.server-details {
  flex-grow: 1;
  margin: 1.5rem 0;
}

.server-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(108, 93, 211, 0.1);
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #8b7eff;
  font-weight: 600;
  font-size: 0.9rem;
}

.server-ip-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.server-ip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(108, 93, 211, 0.2);
}

.ip-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.ip-address {
  font-family: 'Minecraft', monospace;
  font-size: 1.1rem;
  color: #8b7eff;
  background: rgba(139, 126, 255, 0.1);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  flex: 1;
}

.copy-button {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  width: 100%;
}

.copy-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 93, 211, 0.3);
}

.copy-button svg {
  width: 18px;
  height: 18px;
}

/* Recommendations */
.recommendations {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.recommendation-item {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(108, 93, 211, 0.1);
}

.recommendation-item h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.recommendation-item p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b7eff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.external-link:hover {
  color: #6c5dd3;
}

.external-link svg {
  width: 16px;
  height: 16px;
}

/* Launcher Features */
.launcher-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.feature-item svg {
  width: 20px;
  height: 20px;
  color: #4ade80;
  flex-shrink: 0;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  margin-top: auto;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 93, 211, 0.3);
}

.download-button svg {
  width: 20px;
  height: 20px;
}

/* Discord Benefits */
.discord-benefits {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.benefit-item svg {
  width: 20px;
  height: 20px;
  color: #4ade80;
  flex-shrink: 0;
}

.discord-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #5865f2;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
  margin-top: auto;
}

.discord-link:hover {
  background: #4752c4;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(88, 101, 242, 0.3);
}

.discord-link svg {
  width: 20px;
  height: 20px;
}

/* Main Rules Preview */
.main-rules-preview {
  flex-grow: 1;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #d4af37;
  margin-bottom: 1rem;
  text-align: center;
}

.rule-concepts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-concept {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.2);
  transition: all 0.2s ease;
}

.rule-concept:hover {
  border-color: rgba(139, 69, 19, 0.4);
  background: rgba(139, 69, 19, 0.1);
}

.concept-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  color: #d4af37;
}

/* Links */
.rules-link,
.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b7eff;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
  margin-top: auto;
}

.rules-link:hover,
.profile-link:hover {
  color: #6c5dd3;
  transform: translateX(4px);
}

.rules-link svg,
.profile-link svg {
  width: 18px;
  height: 18px;
}

/* Verification Steps */
.verification-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.step-number {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* Quick Tips */
.tips-card.full-width {
  grid-column: 1 / -1;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(108, 93, 211, 0.1);
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-item p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

/* Image Containers */
.image-container {
  height: 180px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(108, 93, 211, 0.1);
  overflow: hidden;
  margin-top: auto;
  transition: all 0.2s ease;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-container:hover {
  border-color: rgba(108, 93, 211, 0.3);
  box-shadow: 0 4px 12px rgba(108, 93, 211, 0.1);
}

.image-container:hover img {
  transform: scale(1.05);
}

/* Image Placeholders (for sections without images) */
.image-placeholder {
  height: 180px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 2px dashed rgba(108, 93, 211, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
  margin-top: auto;
  transition: all 0.2s ease;
}

.image-placeholder:hover {
  border-color: rgba(108, 93, 211, 0.5);
  background: rgba(108, 93, 211, 0.05);
}

/* Bottom CTA */
.bottom-cta {
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  padding: clamp(2rem, 4vw, 3rem);
  border: 1px solid rgba(108, 93, 211, 0.15);
  position: relative;
  overflow: hidden;
}

.bottom-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #6c5dd3, #8b7eff, #ee7828);
}

.bottom-cta h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-family: 'MontserratBold', sans-serif;
  color: #ffffff;
  margin-bottom: 1rem;
}

.bottom-cta p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 150px;
}

.cta-button.primary {
  background: linear-gradient(135deg, #6c5dd3, #8b7eff);
  color: white;
}

.cta-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(108, 93, 211, 0.3);
}

.cta-button.secondary {
  background: transparent;
  color: #8b7eff;
  border: 2px solid rgba(108, 93, 211, 0.3);
}

.cta-button.secondary:hover {
  background: rgba(108, 93, 211, 0.1);
  border-color: rgba(108, 93, 211, 0.5);
  transform: translateY(-2px);
}

/* Background Animation */
.animation-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.light {
  width: clamp(300px, 40vw, 600px);
  height: clamp(300px, 40vw, 600px);
  background: radial-gradient(circle, rgba(108, 93, 211, 0.4) 0%, rgba(139, 126, 255, 0.2) 100%);
  border-radius: 50%;
  filter: blur(clamp(100px, 20vw, 250px));
  position: absolute;
  animation: pulse-glow 8s ease-in-out infinite;
}

.light1 {
  top: 10%;
  right: -15%;
  animation-delay: 0s;
}

.light2 {
  top: 50%;
  left: -15%;
  animation-delay: 2s;
}

.light3 {
  bottom: 10%;
  right: -10%;
  animation-delay: 4s;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.element-animation {
  opacity: 0;
  transition: opacity 0.6s ease-out;
  will-change: opacity;
}

.element-show {
  opacity: 1;
  will-change: auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .server-info-grid {
    grid-template-columns: 1fr;
  }

  .server-ip {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .recommendations {
    gap: 0.75rem;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .animation-wrapper {
    display: none;
  }

  .game-container {
    padding: 1rem;
  }

  .guide-card {
    padding: 1rem;
  }

  .image-placeholder {
    height: 150px;
  }
}
</style>
