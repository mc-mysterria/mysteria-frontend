<template>
  <section id="community" class="beyonder-ledger">
    <!-- Grain/Noise Texture Overlay -->
    <div class="grain-overlay" aria-hidden="true"></div>

    <div class="ledger-container">
      <div class="ledger-header">
        <div class="header-decoration left" aria-hidden="true"></div>
        <div class="header-content">
          <span class="eyebrow-text">{{ t('communityEyebrow') }}</span>
          <h2 class="main-title">
            {{ loading ? t('loadingStatistics') : `${totalBeyonders} ${t('activeBeyonders')}` }}
          </h2>
          <p class="subtitle-text">{{ t('joinPlayersCommunity') }}</p>
        </div>
        <div class="header-decoration right" aria-hidden="true"></div>
      </div>

      <div v-if="loading" class="mystic-loader">
        <div class="orb-container">
          <div class="mystic-orb"></div>
          <div class="orb-ring"></div>
          <div class="orb-ring secondary"></div>
        </div>
        <p class="loader-text">{{ t('loadingStatistics') }}</p>
      </div>

      <div v-else class="ledger-content">
        <!-- The Pillars of Fate (Top Metrics) -->
        <div class="pillars-grid">
          <div class="pillar-item" v-for="(metric, index) in topMetrics" :key="index" :style="{ '--delay': `${index * 0.1}s` }">
            <div class="pillar-bg"></div>
            <div class="pillar-content">
              <span class="pillar-label">{{ metric.label }}</span>
              <div class="pillar-value-container">
                <span class="pillar-value">{{ metric.value }}</span>
                <div class="pillar-glow" aria-hidden="true"></div>
              </div>
              <p class="pillar-subtext">{{ metric.subtext }}</p>
            </div>
          </div>
        </div>

        <div class="stats-showcase">
          <!-- The Sigil Grid (Pathways) -->
          <div class="tapestry-panel">
            <div class="panel-header">
              <h3 class="panel-title">{{ t('mostPopularPathways') }}</h3>
              <div class="panel-divider"></div>
            </div>
            <div class="sigil-grid">
              <div
                  v-for="(pathway, index) in topPathways"
                  :key="pathway.name"
                  class="sigil-tile"
                  :style="{ '--delay': `${index * 0.04}s` }"
              >
                <div class="sigil-frame">
                  <img
                      :alt="pathway.name"
                      :src="getPathwayImage(pathway.name)"
                      class="pathway-sigil"
                  />
                  <div class="sigil-glow"></div>
                </div>
                <div class="sigil-info">
                  <span class="sigil-name">{{ formatPathwayName(pathway.name) }}</span>
                  <span class="sigil-count">{{ pathway.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- The Stairway to Divinity (Sequences) -->
          <div class="stairway-panel">
            <div class="panel-header">
              <h3 class="panel-title">{{ t('sequenceDistribution') }}</h3>
              <div class="panel-divider"></div>
            </div>
            <div class="stairway-visualization">
              <div
                  v-for="seq in sequenceDistribution"
                  :key="seq.sequence"
                  class="stairway-step"
                  :style="{ '--height': `${(seq.count / maxSequenceCount) * 100}%`, '--color': getSequenceColorValue(parseInt(seq.sequence)) }"
              >
                <div class="step-bar">
                  <div class="step-tooltip">
                    <span class="tooltip-val">{{ seq.count }}</span>
                    <span class="tooltip-label">Seq {{ seq.sequence }}</span>
                  </div>
                </div>
                <div class="step-label">S{{ seq.sequence }}</div>
              </div>
            </div>
            <div class="stairway-footer">
              <p>{{ t('averageSequence') }}: <span class="highlight">{{ averageSequence }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
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
const CACHE_DURATION = 60 * 60 * 1000;

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
      .slice(0, 8); // Showing top 8 in grid
});

const sequenceDistribution = computed(() => {
  const seqCounts = new Map<string, number>();
  beyonderData.value.forEach(b => {
    const seq = b.sequence.toString();
    const seqNum = parseInt(seq);
    if (seqNum >= 1 && seqNum <= 9) {
      seqCounts.set(seq, (seqCounts.get(seq) || 0) + 1);
    }
  });
  return Array.from(seqCounts.entries())
      .map(([sequence, count]) => ({sequence, count}))
      .filter(item => item.count > 0)
      .sort((a, b) => parseInt(a.sequence) - parseInt(b.sequence));
});

const maxSequenceCount = computed(() => {
  return Math.max(...sequenceDistribution.value.map(s => s.count), 1);
});

const topMetrics = computed(() => [
  { label: t('totalBeyonders'), value: totalBeyonders.value, subtext: t('activeBeyonders') },
  { label: t('activePathways'), value: uniquePathways.value, subtext: t('uniquePowers') || 'Unique Powers' },
  { label: t('advancedBeyonders'), value: advancedBeyonders.value, subtext: t('highSequences') || 'High Sequences' }
]);

const formatPathwayName = (pathway: string) => pathway.charAt(0).toUpperCase() + pathway.slice(1);
const getPathwayImage = (pathwayName: string) => new URL(`../../assets/images/pathways/${pathwayName.toLowerCase()}.webp`, import.meta.url).href;

const getSequenceColorValue = (sequence: number) => {
  const colors = ['#ff6b6b', '#f59e42', '#ffd93d', '#6bcf7f', '#4ecdc4', '#5dade2', '#a78bfa', '#ec6ead', '#95a5a6', '#c8b273'];
  return colors[sequence] || '#c8b273';
};

const fetchBeyonderStats = async () => {
  loading.value = true;
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed: CachedData = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      beyonderData.value = parsed.data;
      loading.value = false;
      return;
    }
  }

  try {
    const response = await fetch('/catwalk/pathway/everyone');
    const result: BeyonderStatsResponse = await response.json();
    if (result.success && result.data.beyonder) {
      beyonderData.value = result.data.beyonder;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data: result.data.beyonder, timestamp: Date.now() }));
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBeyonderStats);
</script>

<style scoped>
/* ALCHEMICAL LEDGER AESTHETIC REFINED */

.beyonder-ledger {
  position: relative;
  background-color: #080a14;
  padding: 120px 0;
  overflow: hidden;
  color: #e0e0e0;
  font-family: 'Inter', system-ui, sans-serif;
}

.grain-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  z-index: 10;
}

.ledger-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 2;
}

/* Header Styling */
.ledger-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 80px;
  text-align: center;
}

.header-decoration {
  height: 1px;
  flex: 1;
  max-width: 120px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
  position: relative;
}

.header-decoration::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--myst-gold);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--myst-gold);
}

.header-content {
  flex: 2;
}

.eyebrow-text {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 12px;
  opacity: 0.7;
}

.main-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.75rem, 4vw, 3rem);
  color: var(--myst-offwhite);
  margin: 0 0 12px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.subtitle-text {
  font-size: 15px;
  color: #888;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Pillars Grid (Top Metrics) */
.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 64px;
}

.pillar-item {
  position: relative;
  padding: 32px 20px;
  text-align: center;
  opacity: 0;
  animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.pillar-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(200, 178, 115, 0.05) 0%, transparent 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  z-index: -1;
}

.pillar-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.pillar-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 42px;
  font-weight: 700;
  color: var(--myst-gold);
  line-height: 1;
  display: block;
  margin-bottom: 8px;
}

.pillar-subtext {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* Stats Showcase Panels */
.stats-showcase {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  align-items: stretch;
}

.tapestry-panel, .stairway-panel {
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 40px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 32px;
}

.panel-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: var(--myst-offwhite);
  margin-bottom: 12px;
  font-weight: 600;
}

.panel-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--myst-gold) 0%, transparent 100%);
  width: 50px;
}

/* Sigil Grid for Pathways */
.sigil-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  flex: 1;
}

.sigil-tile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  opacity: 0;
  animation: fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
  transition: all 0.3s ease;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.sigil-tile:hover {
  background: rgba(200, 178, 115, 0.05);
  border-color: rgba(200, 178, 115, 0.2);
  transform: translateY(-2px);
}

.sigil-frame {
  position: relative;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.pathway-sigil {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  position: relative;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

.sigil-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(200, 178, 115, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sigil-tile:hover .sigil-glow {
  opacity: 1;
}

.sigil-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sigil-name {
  font-size: 14px;
  font-weight: 600;
  color: #bbb;
  transition: color 0.3s ease;
}

.sigil-tile:hover .sigil-name {
  color: var(--myst-offwhite);
}

.sigil-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 700;
  color: var(--myst-gold);
}

/* Stairway Visualization */
.stairway-visualization {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 240px;
  gap: 12px;
  margin-bottom: 24px;
  flex: 1;
}

.stairway-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-end;
  position: relative;
}

.step-bar {
  width: 100%;
  height: var(--height);
  background: var(--color);
  opacity: 0.5;
  border-radius: 2px 2px 0 0;
  transition: all 0.4s ease;
  position: relative;
  cursor: pointer;
}

.stairway-step:hover .step-bar {
  opacity: 1;
  transform: scaleX(1.1);
  box-shadow: 0 0 15px var(--color);
}

.step-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: #0d111a;
  border: 1px solid var(--color);
  padding: 6px 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 20;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.stairway-step:hover .step-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(-5px);
}

.tooltip-val {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: #fff;
  font-size: 14px;
}

.tooltip-label {
  font-size: 10px;
  color: #888;
  white-space: nowrap;
  text-transform: uppercase;
}

.step-label {
  margin-top: 12px;
  font-size: 11px;
  font-weight: 700;
  color: #555;
  text-align: center;
}

.stairway-footer {
  text-align: center;
  font-size: 14px;
  color: #888;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.highlight {
  color: var(--myst-gold);
  font-weight: 700;
}

/* Mystic Loader */
.mystic-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
}

.orb-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

.mystic-orb {
  position: absolute;
  inset: 20px;
  background: var(--myst-gold);
  border-radius: 50%;
  filter: blur(8px);
  animation: orbPulse 2s infinite alternate;
}

.orb-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(200, 178, 115, 0.3);
  border-radius: 50%;
  animation: orbSpin 4s linear infinite;
}

.orb-ring.secondary {
  animation-direction: reverse;
  animation-duration: 6s;
  border-color: rgba(255, 255, 255, 0.1);
}

@keyframes orbPulse {
  from { transform: scale(0.8); opacity: 0.5; }
  to { transform: scale(1.2); opacity: 1; }
}

@keyframes orbSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loader-text {
  font-family: 'JetBrains Mono', monospace;
  color: var(--myst-gold);
  letter-spacing: 2px;
  font-size: 14px;
}

/* Responsive Overrides */
@media (max-width: 1024px) {
  .stats-showcase {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .pillars-grid {
    grid-template-columns: 1fr;
  }

  .ledger-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-decoration {
    width: 100%;
    max-width: 200px;
  }

  .main-title {
    font-size: 2.25rem;
  }

  .tapestry-panel, .stairway-panel {
    padding: 24px;
  }

  .sigil-grid {
    grid-template-columns: 1fr;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
