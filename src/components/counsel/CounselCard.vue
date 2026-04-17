<template>
  <RouterLink
      :class="[`status-${suggestion.status.toLowerCase()}`, { 'has-high-votes': (suggestion.votesFor || 0) > 10 }]"
      :to="`/counsel/${suggestion.slug}`"
      class="counsel-ritual-card"
  >
    <div class="card-ritual-glow"></div>
    
    <div class="card-ritual-header">
      <h3 class="card-ritual-title">{{ suggestion.title }}</h3>
      <div :class="`status-${suggestion.status.toLowerCase()}`" class="status-ritual-badge">
        {{ t(`counselStatus${suggestion.status.charAt(0) + suggestion.status.slice(1).toLowerCase()}`) }}
      </div>
    </div>

    <div class="card-ritual-meta">
      <span class="suggester-ritual">
        <i class="fa-solid fa-feather-pointed"></i>
        {{ t('counselSuggester') }} <strong>{{ suggestion.suggesterName }}</strong>
      </span>
      <span class="date-ritual">
        {{ formatDate(suggestion.suggestionDate) }}
      </span>
    </div>

    <div class="voting-ritual-area">
      <div class="voting-ledger-bar">
        <div
            :style="{ width: `${votingPercentage}%` }"
            class="voting-fill-marks"
        ></div>
      </div>
      <div class="voting-ledger-stats">
        <span class="stats-for">
          <i class="fa-solid fa-circle-check"></i>
          {{ suggestion.votesFor || 0 }} ({{ votingPercentage.toFixed(0) }}%)
        </span>
        <span class="stats-against">
          {{ suggestion.votesAgainst || 0 }}
          <i class="fa-solid fa-circle-xmark"></i>
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {useI18n} from '@/composables/useI18n'
import type {CounselSuggestionPreview} from '@/types/counsel'
import {RouterLink} from 'vue-router'

interface Props {
  suggestion: CounselSuggestionPreview
}

const props = defineProps<Props>()
const {t, currentLanguage} = useI18n()

const votingPercentage = computed(() => {
  const total = (props.suggestion.votesFor || 0) + (props.suggestion.votesAgainst || 0)
  return total === 0 ? 0 : ((props.suggestion.votesFor || 0) / total) * 100
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.counsel-ritual-card {
  display: block;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 24px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  text-decoration: none;
  overflow: hidden;
}

.counsel-ritual-card:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(200, 178, 115, 0.2);
  transform: translateY(-4px);
}

.card-ritual-glow {
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(200, 178, 115, 0.2), transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.counsel-ritual-card:hover .card-ritual-glow { transform: scaleX(1); }

.card-ritual-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 16px;
}

.card-ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #fff;
  margin: 0;
  line-height: 1.3;
  font-weight: 700;
  flex: 1;
}

.status-ritual-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #666;
  border-radius: 2px;
}

.status-proposed { border-color: rgba(200, 178, 115, 0.3); color: var(--myst-gold); }
.status-accepted { border-color: rgba(74, 222, 128, 0.3); color: #4ade80; }
.status-rejected { border-color: rgba(255, 82, 82, 0.3); color: #ff5252; }

.card-ritual-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.suggester-ritual {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggester-ritual strong { color: #888; font-weight: 500; }
.suggester-ritual i { color: var(--myst-gold); font-size: 10px; opacity: 0.5; }

.date-ritual {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #444;
  text-transform: uppercase;
}

.voting-ritual-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.voting-ledger-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  width: 100%;
}

.voting-fill-marks {
  height: 100%;
  background: var(--myst-gold);
  box-shadow: 0 0 10px var(--myst-gold);
  transition: width 0.8s ease;
}

.voting-ledger-stats {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  color: #555;
}

.stats-for { color: var(--myst-gold); display: flex; align-items: center; gap: 6px; }
.stats-against { display: flex; align-items: center; gap: 6px; }

@media (max-width: 640px) {
  .card-ritual-header { flex-direction: column; gap: 12px; }
  .card-ritual-meta { flex-direction: column; gap: 8px; }
}
</style>
