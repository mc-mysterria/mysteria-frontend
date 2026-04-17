<template>
  <div class="counsel-ritual-page page-container">
    <HeaderItem/>
    <main class="counsel-article-ritual">
      <div v-if="suggestion" class="article-ritual-box">
        <!-- Navigation -->
        <div class="article-ritual-nav">
          <button class="btn-ritual-back" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            <span>{{ t('counselBackToRules') }}</span>
          </button>
        </div>

        <!-- Header -->
        <header class="article-ritual-header">
          <div class="article-ritual-meta">
            <span class="ritual-date">{{ formatDate(suggestion.suggestionDate) }}</span>
            <div class="ritual-header-line"></div>
          </div>
          <h1 class="article-ritual-title">{{ suggestion.title }}</h1>
          
          <div class="ritual-status-wrapper">
             <div :class="`status-${suggestion.status.toLowerCase()}`" class="status-ritual-badge">
              {{ t(`counselStatus${suggestion.status.charAt(0) + suggestion.status.slice(1).toLowerCase()}`) }}
            </div>
            <span class="suggester-info">
               † {{ t('counselSuggester') }} <strong>{{ suggestion.suggesterName }}</strong>
            </span>
          </div>
        </header>

        <!-- Voting Visualization -->
        <div class="ritual-voting-ledger">
          <h3 class="ledger-title-sm">{{ t('counselVotingResults') }}</h3>
          
          <div class="ledger-bars-stack">
            <div class="ledger-bar-row">
              <div class="bar-meta">
                <span class="bar-label">{{ t('counselVotesFor') }}</span>
                <span class="bar-val">{{ suggestion.votesFor || 0 }}</span>
              </div>
              <div class="bar-ritual-track">
                <div :style="{ width: `${votingPercentageFor}%` }" class="bar-ritual-fill for"></div>
              </div>
            </div>

            <div class="ledger-bar-row">
              <div class="bar-meta">
                <span class="bar-label">{{ t('counselVotesAgainst') }}</span>
                <span class="bar-val">{{ suggestion.votesAgainst || 0 }}</span>
              </div>
              <div class="bar-ritual-track">
                <div :style="{ width: `${votingPercentageAgainst}%` }" class="bar-ritual-fill against"></div>
              </div>
            </div>
          </div>
          
          <div class="ledger-total">
            TOTAL MARKS OF OPINION: {{ totalVotes }}
          </div>
        </div>

        <div v-if="suggestion.imageUrl" class="article-ritual-image">
          <img :alt="suggestion.title" :src="suggestion.imageUrl"/>
          <div class="image-ritual-frame"></div>
        </div>

        <!-- Content -->
        <div v-dompurify-html="suggestion.renderedDescription || renderedDescription"
             class="article-ritual-content"></div>

        <!-- Footer -->
        <footer class="article-ritual-footer">
          <div class="ritual-end-mark">† † †</div>
        </footer>
      </div>

      <!-- Loading / Error -->
      <div v-else-if="loading" class="ritual-loading-area">
        <div class="ritual-spinner"></div>
        <p>{{ t('loading') }}</p>
      </div>
      <div v-else class="ritual-error-area">
        <p>{{ t('counselNoSuggestions') }}</p>
        <button class="btn-ritual-back" @click="goBack">RECOVER</button>
      </div>
    </main>
    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {counselAPI} from '@/utils/api/counsel'
import type {CounselSuggestion} from '@/types/counsel'
import HeaderItem from '@/components/layout/HeaderItem.vue'
import FooterItem from '@/components/layout/FooterItem.vue'
import {useI18n} from '@/composables/useI18n'
import MarkdownIt from 'markdown-it'
import {pathwayEmojiPlugin} from '@/utils/pathwayPlugin'

const route = useRoute()
const router = useRouter()
const suggestion = ref<CounselSuggestion | null>(null)
const loading = ref(true)
const {t, currentLanguage} = useI18n()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})
md.use(pathwayEmojiPlugin);

const renderedDescription = computed(() => {
  if (!suggestion.value?.description) return ''
  return md.render(suggestion.value.description)
})

const totalVotes = computed(() => {
  return (suggestion.value?.votesFor || 0) + (suggestion.value?.votesAgainst || 0)
})

const votingPercentageFor = computed(() => {
  const total = totalVotes.value
  return total === 0 ? 0 : ((suggestion.value?.votesFor || 0) / total) * 100
})

const votingPercentageAgainst = computed(() => {
  const total = totalVotes.value
  return total === 0 ? 0 : ((suggestion.value?.votesAgainst || 0) / total) * 100
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadSuggestion = async () => {
  const slug = route.params.slug as string
  if (slug) {
    try {
      loading.value = true
      const response = await counselAPI.getBySlug(currentLanguage.value, slug)
      suggestion.value = response.data
    } catch (error) {
      console.error('Failed to fetch counsel suggestion:', error)
      suggestion.value = null
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
}

const scrollToTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'instant'})
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  })
}

const goBack = () => {
  router.push({name: 'rules', query: {tab: 'counsel'}})
}

watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    scrollToTop()
    await loadSuggestion()
    scrollToTop()
  }
})

onMounted(async () => {
  await loadSuggestion()
  scrollToTop()
})
</script>

<style scoped>
.counsel-ritual-page { background-color: #05070a; min-height: 100vh; display: flex; flex-direction: column; }

.counsel-article-ritual {
  flex: 1; max-width: 900px; margin: 0 auto;
  padding: 120px 24px 80px; width: 100%;
}

.article-ritual-box { position: relative; }

.article-ritual-nav { margin-bottom: 48px; }

.btn-ritual-back {
  background: transparent; border: 1px solid rgba(255, 255, 255, 0.1);
  color: #666; padding: 10px 24px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s;
}

.btn-ritual-back:hover { color: var(--myst-gold); border-color: var(--myst-gold); transform: translateX(-4px); }

.article-ritual-header { margin-bottom: 60px; text-align: center; }

.article-ritual-meta {
  display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px;
}

.ritual-date {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: var(--myst-gold); text-transform: uppercase; letter-spacing: 4px;
}

.ritual-header-line { width: 40px; height: 1px; background: var(--myst-gold); opacity: 0.4; }

.article-ritual-title {
  font-family: 'Playfair Display', serif; font-size: clamp(2rem, 5vw, 3.5rem);
  color: #fff; line-height: 1.1; font-weight: 800; margin: 0 0 24px;
}

.ritual-status-wrapper {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}

.status-ritual-badge {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  text-transform: uppercase; letter-spacing: 1px; padding: 4px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1); color: #888;
}

.status-proposed { border-color: rgba(200, 178, 115, 0.3); color: var(--myst-gold); }
.status-accepted { border-color: rgba(74, 222, 128, 0.3); color: #4ade80; }
.status-rejected { border-color: rgba(255, 82, 82, 0.3); color: #ff5252; }

.suggester-info {
  font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #444;
}
.suggester-info strong { color: #666; }

/* Voting Ledger */
.ritual-voting-ledger {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px; margin-bottom: 60px;
}

.ledger-title-sm {
  font-family: 'Playfair Display', serif; font-size: 16px;
  color: var(--myst-gold); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 2px;
}

.ledger-bars-stack { display: flex; flex-direction: column; gap: 20px; }

.ledger-bar-row { display: flex; flex-direction: column; gap: 8px; }

.bar-meta { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; }
.bar-label { color: #555; }
.bar-val { color: #fff; }

.bar-ritual-track { height: 4px; background: rgba(255, 255, 255, 0.05); width: 100%; }
.bar-ritual-fill { height: 100%; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
.bar-ritual-fill.for { background: var(--myst-gold); box-shadow: 0 0 10px var(--myst-gold); }
.bar-ritual-fill.against { background: #ff5252; box-shadow: 0 0 10px #ff5252; }

.ledger-total {
  margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.03);
  text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333; letter-spacing: 2px;
}

.article-ritual-image {
  margin-bottom: 60px; position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.article-ritual-image img { width: 100%; height: auto; display: block; opacity: 0.8; }

.article-ritual-content {
  line-height: 1.8; color: #ccc; font-size: 18px;
}

/* Content Styles */
.article-ritual-content :deep(p) { margin-bottom: 24px; }
.article-ritual-content :deep(h2), .article-ritual-content :deep(h3) {
  font-family: 'Playfair Display', serif; color: #fff; margin: 48px 0 20px;
}
.article-ritual-content :deep(strong) { color: var(--myst-gold); font-weight: 700; }

.article-ritual-content :deep(img.pathway-emoji) {
  display: inline;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
  margin: 0 0.1em;
  border: none;
  transform: none;
  box-shadow: none;
  opacity: 1;
}

.article-ritual-content :deep(blockquote) {
  margin: 40px 0; padding: 24px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid var(--myst-gold);
  font-style: italic; color: #888;
}

.article-ritual-footer { margin-top: 80px; text-align: center; }
.ritual-end-mark { font-family: 'Playfair Display', serif; color: var(--myst-gold); font-size: 24px; letter-spacing: 8px; opacity: 0.3; }

.ritual-loading-area, .ritual-error-area {
  min-height: 400px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 24px; color: #444; font-family: 'JetBrains Mono', monospace;
}

.ritual-spinner {
  width: 40px; height: 40px; border: 2px solid rgba(200, 178, 115, 0.1);
  border-top-color: var(--myst-gold); border-radius: 50%; animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .counsel-article-ritual { padding-top: 100px; }
  .article-ritual-title { font-size: 1.75rem; }
}
</style>
