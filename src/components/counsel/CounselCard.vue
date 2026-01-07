<template>
  <RouterLink
      :class="`status-${suggestion.status.toLowerCase()}`"
      :to="`/counsel/${suggestion.slug}`"
      class="counsel-card"
  >
    <div class="card-header">
      <h3 class="card-title">{{ suggestion.title }}</h3>
      <span :class="`status-${suggestion.status.toLowerCase()}`" class="status-badge">
        {{ t(`counselStatus${suggestion.status.charAt(0) + suggestion.status.slice(1).toLowerCase()}`) }}
      </span>
    </div>

    <div class="card-meta">
      <span class="suggester">
        {{ t('counselSuggester') }} <strong>{{ suggestion.suggesterName }}</strong>
      </span>
      <span class="suggestion-date">
        {{ formatDate(suggestion.suggestionDate) }}
      </span>
    </div>

    <div class="voting-section">
      <div class="voting-bar-container">
        <div class="voting-bar">
          <div
              :style="{ width: `${votingPercentage}%` }"
              class="voting-bar-fill for"
          ></div>
        </div>
        <div class="voting-stats">
          <span class="votes-for">
            {{ t('counselVotesFor') }}: {{ suggestion.votesFor || 0 }} ({{ votingPercentage.toFixed(1) }}%)
          </span>
          <span class="votes-against">
            {{ t('counselVotesAgainst') }}: {{ suggestion.votesAgainst || 0 }}
          </span>
        </div>
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
const {t} = useI18n()

const votingPercentage = computed(() => {
  const total = (props.suggestion.votesFor || 0) + (props.suggestion.votesAgainst || 0)
  return total === 0 ? 0 : ((props.suggestion.votesFor || 0) / total) * 100
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.counsel-card {
  display: block;
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid var(--counsel-border, color-mix(in srgb, #4a90e2 30%, transparent));
  border-left: 4px solid var(--counsel-primary, #4a90e2);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.counsel-card:hover {
  border-color: var(--counsel-primary, #4a90e2);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--counsel-primary, #4a90e2) 20%, transparent);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin: 0;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-family: "Inter", system-ui, sans-serif;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.status-proposed {
  background: color-mix(in srgb, #ff9800 20%, transparent);
  color: #ff9800;
}

.status-badge.status-accepted {
  background: color-mix(in srgb, #4caf50 20%, transparent);
  color: #4caf50;
}

.status-badge.status-rejected {
  background: color-mix(in srgb, #f44336 20%, transparent);
  color: #f44336;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--myst-ink-muted);
  flex-wrap: wrap;
}

.suggester strong {
  color: var(--myst-ink);
  font-weight: 600;
}

.suggestion-date {
  color: var(--myst-ink-muted);
  font-size: 13px;
}

.voting-section {
  margin-top: 16px;
}

.voting-bar-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voting-bar {
  height: 8px;
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.voting-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--counsel-primary, #4a90e2), var(--counsel-primary-soft, #6ba4ec));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.voting-stats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--myst-ink-muted);
}

.votes-for {
  color: var(--counsel-primary, #4a90e2);
  font-weight: 500;
}

.votes-against {
  color: var(--myst-ink-muted);
}

/* Responsive */
@media (max-width: 640px) {
  .counsel-card {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-title {
    font-size: 16px;
  }

  .status-badge {
    align-self: flex-start;
  }

  .card-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
