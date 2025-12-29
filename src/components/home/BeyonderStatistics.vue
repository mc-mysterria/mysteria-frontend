<template>
  <section id="community" class="beyonder-stats-section">
    <div class="stats-container">
      <SectionTitle
          :eyebrow="t('communityEyebrow')"
          :subtitle="t('joinPlayersCommunity')"
          :title="loading ? t('loadingStatistics') : `${totalBeyonders} ${t('activeBeyonders')}`"
      />

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
      </div>

      <div v-else class="stats-content">
        <!-- Key Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🌟</div>
            <div class="metric-value">{{ totalBeyonders }}</div>
            <div class="metric-label">{{ t('totalBeyonders') }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔮</div>
            <div class="metric-value">{{ uniquePathways }}</div>
            <div class="metric-label">{{ t('activePathways') }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-value">{{ advancedBeyonders }}</div>
            <div class="metric-label">{{ t('advancedBeyonders') }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-value">{{ averageSequence }}</div>
            <div class="metric-label">{{ t('averageSequence') }}</div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-grid">
          <!-- Top Pathways -->
          <div class="chart-card">
            <h3 class="chart-title">{{ t('mostPopularPathways') }}</h3>
            <div class="pathway-bars">
              <div
                  v-for="pathway in topPathways"
                  :key="pathway.name"
                  class="pathway-bar-item"
              >
                <div class="pathway-bar-header">
                  <div class="pathway-name-container">
                    <img
                        :alt="pathway.name"
                        :src="getPathwayImage(pathway.name)"
                        class="pathway-symbol-small"
                    />
                    <span class="pathway-name">{{ formatPathwayName(pathway.name) }}</span>
                  </div>
                  <span class="pathway-count">{{ pathway.count }}</span>
                </div>
                <div class="pathway-bar-track">
                  <div
                      :style="{ width: `${(pathway.count / totalBeyonders) * 100}%` }"
                      class="pathway-bar-fill"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sequence Distribution -->
          <div class="chart-card">
            <h3 class="chart-title">{{ t('sequenceDistribution') }}</h3>
            <div class="sequence-chart">
              <div
                  v-for="seq in sequenceDistribution"
                  :key="seq.sequence"
                  class="sequence-bar-wrapper"
              >
                <div class="sequence-bar-container">
                  <div
                      :style="{
                        height: `${(seq.count / maxSequenceCount) * 100}%`,
                        background: getSequenceColor(parseInt(seq.sequence))
                      }"
                      :title="`${t('sequence')} ${seq.sequence}: ${seq.count} ${t('sequenceBeyonders')}`"
                      class="sequence-bar-fill"
                  >
                    <span class="bar-count">{{ seq.count }}</span>
                  </div>
                </div>
                <div class="sequence-label">Seq {{ seq.sequence }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import SectionTitle from '@/components/ui/SectionTitle.vue';
import type {BeyonderData} from '@/types/users';
import {useI18n} from '@/composables/useI18n';

const {t} = useI18n();

interface BeyonderStatsResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    beyonder: BeyonderData[];
  };
}

interface CachedData {
  data: BeyonderData[];
  timestamp: number;
}

const CACHE_KEY = 'beyonder-stats-cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const loading = ref(true);
const beyonderData = ref<BeyonderData[]>([]);

const totalBeyonders = computed(() => beyonderData.value.length);

const uniquePathways = computed(() => {
  const pathways = new Set(beyonderData.value.map(b => b.pathway));
  return pathways.size;
});

const advancedBeyonders = computed(() => {
  return beyonderData.value.filter(b => {
    const seq = parseInt(b.sequence);
    return seq >= 0 && seq <= 3;
  }).length;
});

const averageSequence = computed(() => {
  if (beyonderData.value.length === 0) return '0';
  const sum = beyonderData.value.reduce((acc, b) => acc + parseInt(b.sequence), 0);
  const avg = sum / beyonderData.value.length;
  return avg.toFixed(1);
});

const topPathways = computed(() => {
  const pathwayCounts = new Map<string, number>();

  beyonderData.value.forEach(b => {
    const count = pathwayCounts.get(b.pathway) || 0;
    pathwayCounts.set(b.pathway, count + 1);
  });

  return Array.from(pathwayCounts.entries())
      .map(([name, count]) => ({name, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 pathways
});

const sequenceDistribution = computed(() => {
  const seqCounts = new Map<string, number>();

  beyonderData.value.forEach(b => {
    const seq = b.sequence.toString();
    const seqNum = parseInt(seq);
    // Only count sequences 1-9 (exclude 0)
    if (seqNum >= 1 && seqNum <= 9) {
      seqCounts.set(seq, (seqCounts.get(seq) || 0) + 1);
    }
  });

  return Array.from(seqCounts.entries())
      .map(([sequence, count]) => ({sequence, count}))
      .filter(item => item.count > 0) // Only show sequences with beyonders
      .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence));
});

const maxSequenceCount = computed(() => {
  return Math.max(...sequenceDistribution.value.map(s => s.count));
});

const formatPathwayName = (pathway: string) => {
  return pathway.charAt(0).toUpperCase() + pathway.slice(1);
};

const getPathwayImage = (pathwayName: string) => {
  const name = pathwayName.toLowerCase();
  return new URL(`../../assets/images/pathways/${name}.webp`, import.meta.url).href;
};

const getSequenceColor = (sequence: number) => {
  const colors = [
    'linear-gradient(180deg, #ff6b6b 0%, #ee5a6f 100%)', // Seq 0 - Red (Highest)
    'linear-gradient(180deg, #f59e42 0%, #ff8c42 100%)', // Seq 1 - Orange
    'linear-gradient(180deg, #ffd93d 0%, #ffc93d 100%)', // Seq 2 - Yellow
    'linear-gradient(180deg, #6bcf7f 0%, #51cf66 100%)', // Seq 3 - Green
    'linear-gradient(180deg, #4ecdc4 0%, #45b7d1 100%)', // Seq 4 - Cyan
    'linear-gradient(180deg, #5dade2 0%, #4a90e2 100%)', // Seq 5 - Blue
    'linear-gradient(180deg, #a78bfa 0%, #9575fa 100%)', // Seq 6 - Purple
    'linear-gradient(180deg, #ec6ead 0%, #f06292 100%)', // Seq 7 - Pink
    'linear-gradient(180deg, #95a5a6 0%, #7f8c8d 100%)', // Seq 8 - Gray
    'linear-gradient(180deg, #c8b273 0%, #b8a263 100%)', // Seq 9 - Gold (Lowest)
  ];
  return colors[sequence] || colors[9];
};

const loadFromCache = (): BeyonderData[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cachedData: CachedData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
};

const saveToCache = (data: BeyonderData[]) => {
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

const fetchBeyonderStats = async () => {
  loading.value = true;

  // Try to load from cache first
  const cachedData = loadFromCache();
  if (cachedData) {
    beyonderData.value = cachedData;
    loading.value = false;
    return;
  }

  // Fetch fresh data
  try {
    const response = await fetch('/catwalk/pathway/everyone');
    const result: BeyonderStatsResponse = await response.json();

    if (result.success && result.data.beyonder) {
      beyonderData.value = result.data.beyonder;
      saveToCache(result.data.beyonder);
    }
  } catch (error) {
    console.error('Failed to fetch beyonder statistics:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBeyonderStats();
});
</script>

<style scoped>
.beyonder-stats-section {
  background: var(--myst-bg);
  padding: 80px 0;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top: 3px solid var(--myst-gold);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stats-content {
  margin-top: 48px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.metric-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.metric-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--myst-gold);
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: var(--myst-ink-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.chart-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 32px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--myst-gold);
  margin-bottom: 24px;
  text-align: center;
}

/* Pathway Bars */
.pathway-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pathway-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pathway-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pathway-name-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pathway-symbol-small {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pathway-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--myst-ink-strong);
  text-transform: capitalize;
}

.pathway-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--myst-gold);
}

.pathway-bar-track {
  height: 8px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border-radius: 4px;
  overflow: hidden;
}

.pathway-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c8b273 0%, #4a90e2 60%, #a78bfa 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* Sequence Chart */
.sequence-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 300px;
  gap: 4px;
  padding: 0 10px;
}

.sequence-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 8px;
}

.sequence-bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;
  position: relative;
}

.sequence-bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: all 0.6s ease;
  min-height: 8px;
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.sequence-bar-fill:hover {
  transform: scaleY(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.bar-count {
  font-size: 11px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sequence-bar-fill:hover .bar-count {
  opacity: 1;
}

.sequence-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--myst-ink-medium);
  text-align: center;
  white-space: nowrap;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .beyonder-stats-section {
    padding: 60px 0;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .metric-card {
    padding: 24px 16px;
  }

  .metric-icon {
    font-size: 36px;
  }

  .metric-value {
    font-size: 28px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .chart-card {
    padding: 24px;
  }

  .sequence-chart {
    height: 250px;
    gap: 2px;
  }

  .sequence-label {
    font-size: 10px;
  }

  .bar-count {
    font-size: 10px;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
