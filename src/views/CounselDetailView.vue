<template>
  <div class="counsel-detail-page">
    <HeaderItem/>
    <main class="counsel-detail-container">
      <div class="counsel-background">
        <!-- Animated particles -->
      </div>

      <div v-if="suggestion" class="counsel-content">
        <button @click="goBack" class="back-button">
          <IconArrowLeft class="w-5 h-5"/>
          <span>{{ t('counselBackToRules') }}</span>
        </button>

        <div class="suggestion-header">
          <div class="header-top">
            <h1 class="suggestion-title">{{ suggestion.title }}</h1>
            <span class="status-badge" :class="`status-${suggestion.status.toLowerCase()}`">
              {{ t(`counselStatus${suggestion.status.charAt(0) + suggestion.status.slice(1).toLowerCase()}`) }}
            </span>
          </div>

          <div class="suggestion-meta">
            <span class="suggester">
              {{ t('counselSuggester') }} <strong>{{ suggestion.suggesterName }}</strong>
            </span>
            <span class="suggestion-date">
              {{ formatDate(suggestion.suggestionDate) }}
            </span>
          </div>
        </div>

        <div v-if="suggestion.imageUrl" class="suggestion-image">
          <img :src="suggestion.imageUrl" :alt="suggestion.title"/>
        </div>

        <div class="voting-results-section">
          <h3 class="voting-title">{{ t('counselVotingResults') }}</h3>
          <div class="voting-visualization">
            <div class="voting-bars">
              <div class="vote-bar for-bar">
                <div class="bar-fill" :style="{ width: `${votingPercentageFor}%` }"></div>
                <div class="bar-label">
                  <span class="label-text">{{ t('counselVotesFor') }}</span>
                  <span class="label-value">{{ suggestion.votesFor || 0 }} ({{ votingPercentageFor.toFixed(1) }}%)</span>
                </div>
              </div>
              <div class="vote-bar against-bar">
                <div class="bar-fill" :style="{ width: `${votingPercentageAgainst}%` }"></div>
                <div class="bar-label">
                  <span class="label-text">{{ t('counselVotesAgainst') }}</span>
                  <span class="label-value">{{ suggestion.votesAgainst || 0 }} ({{ votingPercentageAgainst.toFixed(1) }}%)</span>
                </div>
              </div>
            </div>
            <div class="total-votes">
              Total Votes: {{ totalVotes }}
            </div>
          </div>
        </div>

        <div class="suggestion-description" v-dompurify-html="suggestion.renderedDescription || renderedDescription"></div>
      </div>

      <div v-else-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('loading') }}</p>
      </div>

      <div v-else class="error-state">
        <p>{{ t('counselNoSuggestions') }}</p>
      </div>
    </main>
    <FooterItem/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {counselAPI} from '@/utils/api/counsel'
import type {CounselSuggestion} from '@/types/counsel'
import HeaderItem from '@/components/layout/HeaderItem.vue'
import FooterItem from '@/components/layout/FooterItem.vue'
import {useI18n} from '@/composables/useI18n'
import MarkdownIt from 'markdown-it'
import IconArrowLeft from '@/assets/icons/IconArrowLeft.vue'

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
  return new Date(dateString).toLocaleDateString(undefined, {
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
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
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

watch(currentLanguage, async () => {
  await loadSuggestion()
})

onMounted(async () => {
  await loadSuggestion()
  scrollToTop()
})
</script>

<style scoped>
.counsel-detail-page {
  min-height: 100vh;
  background: var(--myst-bg);
  position: relative;
}

.counsel-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 24px 60px;
  position: relative;
}

.counsel-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.counsel-background::before,
.counsel-background::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #4a90e2 0%, transparent 70%);
  opacity: 0.12;
  border-radius: 50%;
  filter: blur(80px);
  animation: float-particle-detail 25s ease-in-out infinite;
}

.counsel-background::before {
  top: -150px;
  left: -150px;
  animation-delay: 0s;
}

.counsel-background::after {
  bottom: -150px;
  right: -150px;
  animation-delay: 12.5s;
}

@keyframes float-particle-detail {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(80px, -120px) scale(1.15);
  }
  66% {
    transform: translate(-80px, 80px) scale(0.95);
  }
}

@media (prefers-reduced-motion: reduce) {
  .counsel-background::before,
  .counsel-background::after {
    animation: none;
    opacity: 0.08;
  }
}

.counsel-content {
  position: relative;
  z-index: 1;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, #4a90e2 30%, transparent);
  border-radius: 8px;
  color: var(--myst-ink);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 32px;
  font-family: "Inter", system-ui, sans-serif;
}

.back-button:hover {
  background: color-mix(in srgb, #4a90e2 15%, transparent);
  border-color: #4a90e2;
  transform: translateX(-4px);
}

.suggestion-header {
  margin-bottom: 32px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 16px;
}

.suggestion-title {
  font-size: 3rem;
  font-weight: 800;
  color: var(--myst-ink-strong);
  line-height: 1.2;
  flex: 1;
  font-family: "Inter", system-ui, sans-serif;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.status-proposed {
  background: color-mix(in srgb, #4a90e2 20%, transparent);
  color: #4a90e2;
}

.status-badge.status-accepted {
  background: color-mix(in srgb, #4caf50 20%, transparent);
  color: #4caf50;
}

.status-badge.status-rejected {
  background: color-mix(in srgb, #f44336 20%, transparent);
  color: #f44336;
}

.suggestion-meta {
  display: flex;
  gap: 24px;
  font-size: 15px;
  color: var(--myst-ink-muted);
  flex-wrap: wrap;
}

.suggester strong {
  color: var(--myst-ink);
  font-weight: 600;
}

.suggestion-image {
  margin-bottom: 32px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, #4a90e2 20%, transparent);
}

.suggestion-image img {
  width: 100%;
  height: auto;
  display: block;
}

.voting-results-section {
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border: 1px solid color-mix(in srgb, #4a90e2 25%, transparent);
  border-left: 4px solid #4a90e2;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 40px;
}

.voting-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4a90e2;
  margin-bottom: 20px;
  font-family: "Inter", system-ui, sans-serif;
}

.voting-visualization {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voting-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vote-bar {
  position: relative;
}

.bar-fill {
  height: 40px;
  border-radius: 8px;
  transition: width 0.5s ease;
  position: relative;
}

.for-bar .bar-fill {
  background: linear-gradient(90deg, #4a90e2, #6ba4ec);
}

.against-bar .bar-fill {
  background: linear-gradient(90deg, #f44336, #ff6b6b);
}

.bar-label {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  z-index: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.total-votes {
  text-align: center;
  font-size: 14px;
  color: var(--myst-ink-muted);
  font-weight: 500;
  padding-top: 8px;
  border-top: 1px solid color-mix(in srgb, #4a90e2 15%, transparent);
}

.suggestion-description {
  background: color-mix(in srgb, var(--myst-bg-2) 40%, transparent);
  border: 1px solid color-mix(in srgb, white 8%, transparent);
  border-radius: 12px;
  padding: 32px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--myst-ink);
}

.suggestion-description :deep(h1),
.suggestion-description :deep(h2),
.suggestion-description :deep(h3) {
  color: #4a90e2;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-family: "Inter", system-ui, sans-serif;
}

.suggestion-description :deep(h1) {
  font-size: 2.25rem;
}

.suggestion-description :deep(h2) {
  font-size: 1.875rem;
}

.suggestion-description :deep(h3) {
  font-size: 1.5rem;
}

.suggestion-description :deep(p) {
  margin-bottom: 1.5rem;
}

.suggestion-description :deep(a) {
  color: #4a90e2;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.suggestion-description :deep(a:hover) {
  color: #6ba4ec;
}

.suggestion-description :deep(ul),
.suggestion-description :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 2rem;
}

.suggestion-description :deep(li) {
  margin-bottom: 0.5rem;
}

.suggestion-description :deep(blockquote) {
  border-left: 4px solid #4a90e2;
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: var(--myst-ink-muted);
  font-style: italic;
}

.suggestion-description :deep(code) {
  background-color: color-mix(in srgb, #4a90e2 15%, transparent);
  color: #4a90e2;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
}

.suggestion-description :deep(pre) {
  background-color: var(--myst-bg);
  border: 1px solid color-mix(in srgb, #4a90e2 20%, transparent);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.suggestion-description :deep(pre code) {
  background: none;
  padding: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100px 20px;
  position: relative;
  z-index: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid color-mix(in srgb, #4a90e2 20%, transparent);
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state p {
  color: var(--myst-ink-muted);
  font-size: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .counsel-detail-container {
    padding: 80px 16px 40px;
  }

  .suggestion-title {
    font-size: 2rem;
  }

  .header-top {
    flex-direction: column;
    gap: 12px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .suggestion-description {
    padding: 24px;
    font-size: 15px;
  }

  .voting-results-section {
    padding: 20px;
  }

  .bar-label {
    font-size: 12px;
    padding: 0 12px;
  }

  .label-value {
    display: none;
  }
}

@media (max-width: 640px) {
  .suggestion-title {
    font-size: 1.75rem;
  }

  .suggestion-meta {
    flex-direction: column;
    gap: 8px;
  }

  .suggestion-description {
    padding: 20px;
    font-size: 14px;
  }
}
</style>
