<template>
  <div class="counsel-ritual-section">
    <div class="ritual-mist-overlay"></div>

    <div class="counsel-ritual-header">
      <!-- Unified Header -->
      <div class="myst-page-header">
        <div class="myst-header-decoration" aria-hidden="true"></div>
        <h2 class="myst-header-label">{{ t('counselTitle') || 'Meeting of the Counsel' }}</h2>
        <div class="myst-header-decoration" aria-hidden="true"></div>
      </div>
      
      <p class="counsel-ritual-subtitle">{{ t('counselSubtitle') }}</p>

      <!-- Filter Toggle -->
      <div class="ritual-filter-group">
        <button
            :class="{ active: activeFilter === 'active' }"
            class="btn-ritual-filter"
            @click="activeFilter = 'active'"
        >
          {{ t('counselFilterActive') }}
        </button>
        <button
            :class="{ active: activeFilter === 'all' }"
            class="btn-ritual-filter"
            @click="activeFilter = 'all'"
        >
          {{ t('counselFilterAll') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="ritual-loading-counsel">
      <div class="ritual-spinner"></div>
      <p class="ledger-text">{{ t('loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="ritual-error-counsel">
      <p>{{ t('counselLoadingError') }}</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSuggestions.length === 0" class="ritual-empty-counsel">
      <p class="ledger-text">{{ activeFilter === 'active' ? t('counselEmptyState') : t('counselNoSuggestions') }}</p>
    </div>

    <!-- Suggestions List -->
    <div v-else class="ritual-suggestions-grid">
      <CounselCard
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.id"
          :suggestion="suggestion"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
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
.counsel-ritual-section {
  position: relative;
  padding: 40px 0;
  min-height: 400px;
}

.ritual-mist-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(200, 178, 115, 0.03) 0%, transparent 70%);
  pointer-events: none;
}

.counsel-ritual-header {
  text-align: center;
  margin-bottom: 48px;
  position: relative;
  z-index: 2;
}

.counsel-ritual-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #666;
  max-width: 600px;
  margin: 0 auto 32px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.ritual-filter-group {
  display: inline-flex;
  gap: 12px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.btn-ritual-filter {
  padding: 8px 24px;
  background: transparent;
  border: none;
  color: #444;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-ritual-filter:hover { color: #888; }
.btn-ritual-filter.active {
  background: rgba(200, 178, 115, 0.1);
  color: var(--myst-gold);
}

.ritual-suggestions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.ritual-loading-counsel, .ritual-error-counsel, .ritual-empty-counsel {
  text-align: center;
  padding: 80px 20px;
  color: #444;
}

.ledger-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.ritual-spinner {
  width: 32px; height: 32px;
  border: 2px solid rgba(200, 178, 115, 0.1);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .ritual-filter-group { width: 100%; display: flex; }
  .btn-ritual-filter { flex: 1; }
}
</style>
