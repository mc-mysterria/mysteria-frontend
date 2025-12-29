<template>
  <div class="counsel-section">
    <div class="counsel-background">
      <!-- Animated particles -->
    </div>

    <div class="counsel-header">
      <h2 class="counsel-title">{{ t('counselTitle') }}</h2>
      <p class="counsel-subtitle">{{ t('counselSubtitle') }}</p>

      <!-- Filter Toggle -->
      <div class="filter-toggle">
        <button
            class="filter-button"
            :class="{ active: activeFilter === 'active' }"
            @click="activeFilter = 'active'"
        >
          {{ t('counselFilterActive') }}
        </button>
        <button
            class="filter-button"
            :class="{ active: activeFilter === 'all' }"
            @click="activeFilter = 'all'"
        >
          {{ t('counselFilterAll') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ t('counselLoadingError') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSuggestions.length === 0" class="empty-state">
      <p>{{ activeFilter === 'active' ? t('counselEmptyState') : t('counselNoSuggestions') }}</p>
    </div>

    <!-- Suggestions List -->
    <div v-else class="suggestions-list">
      <CounselCard
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.id"
          :suggestion="suggestion"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import {useI18n} from '@/composables/useI18n'
import {counselAPI} from '@/utils/api/counsel'
import type {CounselSuggestionPreview} from '@/types/counsel'
import CounselCard from './CounselCard.vue'

const {t, currentLanguage} = useI18n()

const suggestions = ref<CounselSuggestionPreview[]>([])
const loading = ref(true)
const error = ref(false)
const activeFilter = ref<'active' | 'all'>('active')

const filteredSuggestions = computed(() => {
  if (activeFilter.value === 'active') {
    return suggestions.value.filter(s => s.status !== 'REJECTED')
  }
  return suggestions.value
})

const loadSuggestions = async (lang: 'en' | 'uk') => {
  loading.value = true
  error.value = false
  try {
    const response = await counselAPI.getAll(lang)
    suggestions.value = response.data
        .sort((a, b) => new Date(b.suggestionDate).getTime() - new Date(a.suggestionDate).getTime())
  } catch (err) {
    console.error('Failed to load counsel suggestions:', err)
    error.value = true
    suggestions.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSuggestions(currentLanguage.value)
})

watch(currentLanguage, (newLang) => {
  loadSuggestions(newLang)
})
</script>

<style scoped>
.counsel-section {
  position: relative;
  padding: 24px 0;
}

.counsel-background {
  position: absolute;
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
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--counsel-primary, #4a90e2) 0%, transparent 70%);
  opacity: 0.15;
  border-radius: 50%;
  filter: blur(60px);
  animation: float-particle 20s ease-in-out infinite;
}

.counsel-background::before {
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.counsel-background::after {
  bottom: -100px;
  right: -100px;
  animation-delay: 10s;
}

@keyframes float-particle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(100px, -100px) scale(1.2);
  }
  50% {
    transform: translate(50px, 100px) scale(0.9);
  }
  75% {
    transform: translate(-100px, 50px) scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .counsel-background::before,
  .counsel-background::after {
    animation: none;
    opacity: 0.1;
  }
}

.counsel-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.counsel-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--counsel-primary, #4a90e2);
  margin-bottom: 8px;
  font-family: "Inter", system-ui, sans-serif;
}

.counsel-subtitle {
  font-size: 16px;
  color: var(--myst-ink-muted);
  margin-bottom: 24px;
  line-height: 1.6;
}

.filter-toggle {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  background: color-mix(in srgb, var(--myst-bg-2) 50%, transparent);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--counsel-primary, #4a90e2) 20%, transparent);
}

.filter-button {
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  font-weight: 500;
  font-family: "Inter", system-ui, sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button:hover {
  background: color-mix(in srgb, var(--counsel-primary, #4a90e2) 10%, transparent);
  color: var(--myst-ink);
}

.filter-button.active {
  background: var(--counsel-primary, #4a90e2);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--counsel-primary, #4a90e2) 30%, transparent);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  position: relative;
  z-index: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid color-mix(in srgb, var(--counsel-primary, #4a90e2) 20%, transparent);
  border-top-color: var(--counsel-primary, #4a90e2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state p,
.empty-state p {
  color: var(--myst-ink-muted);
  font-size: 16px;
}

.error-state p {
  color: #f44336;
}

/* Responsive */
@media (max-width: 768px) {
  .counsel-title {
    font-size: 1.75rem;
  }

  .counsel-subtitle {
    font-size: 14px;
  }

  .filter-toggle {
    width: 100%;
    max-width: 300px;
  }

  .filter-button {
    flex: 1;
    padding: 10px 16px;
  }
}

@media (max-width: 640px) {
  .counsel-section {
    padding: 16px 0;
  }

  .counsel-header {
    margin-bottom: 24px;
  }

  .counsel-title {
    font-size: 1.5rem;
  }
}
</style>
