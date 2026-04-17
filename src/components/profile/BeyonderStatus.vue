<template>
  <div class="divinity-path beyonder-status-container">
    <div class="divinity-frame" aria-hidden="true"></div>
    
    <div class="divinity-header">
      <div class="pathway-sigil-container">
        <img :alt="pathwayDisplay" :src="pathwayImage" class="pathway-sigil"/>
        <div class="sigil-echo"></div>
      </div>
      <div class="header-text">
        <span class="path-eyebrow">{{ t('beyonderStatus') }}</span>
        <h3 class="path-title">{{ pathwayDisplay }}</h3>
      </div>
    </div>

    <div class="divinity-content">
      <div class="divinity-stat">
        <div class="stat-meta">
          <span class="stat-label">{{ t('sequence') }}</span>
          <span class="stat-divider"></span>
        </div>
        <div class="stat-value sequence-val">{{ beyonderData.sequence }}</div>
      </div>

      <div class="divinity-stat acting-stat">
        <div class="stat-meta">
          <span class="stat-label">{{ t('actingProgress') }}</span>
          <span class="stat-value acting-val">{{ actingPercentage }}%</span>
        </div>
        <div class="ethereal-gauge">
          <div class="gauge-track"></div>
          <div :style="{ width: actingPercentage + '%' }" class="gauge-fill">
            <div class="gauge-light"></div>
          </div>
          <div class="gauge-markers">
            <div v-for="i in 4" :key="i" class="marker"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useI18n} from '@/composables/useI18n';
import type {BeyonderData} from '@/types/users';

const {t} = useI18n();

const props = defineProps<{
  beyonderData: BeyonderData;
}>();

const pathwayDisplay = computed(() => {
  return props.beyonderData.pathway.charAt(0).toUpperCase() +
      props.beyonderData.pathway.slice(1);
});

const pathwayImage = computed(() => {
  const pathwayName = props.beyonderData.pathway.toLowerCase();
  return new URL(`../../assets/images/pathways/${pathwayName}.webp`, import.meta.url).href;
});

const actingPercentage = computed(() => {
  const percentage = props.beyonderData.acting * 100;
  if (percentage < 0.01) return percentage.toFixed(4);
  return percentage.toFixed(2);
});
</script>

<style scoped>
/* PATH OF DIVINITY AESTHETIC */

.divinity-path {
  position: relative;
  background: linear-gradient(135deg, rgba(13, 16, 30, 0.6) 0%, rgba(8, 10, 20, 0.8) 100%);
  padding: 32px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 4px;
}

.divinity-path:hover {
  transform: translateY(-5px);
  background: linear-gradient(135deg, rgba(20, 24, 45, 0.7) 0%, rgba(13, 16, 30, 0.9) 100%);
}

.divinity-frame {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.03);
  pointer-events: none;
}

.divinity-frame::after {
  content: '';
  position: absolute;
  top: 6px; left: 6px; bottom: 6px; right: 6px;
  border: 1px solid rgba(200, 178, 115, 0.15);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20px, 20px 0);
}

/* Header Refinement */
.divinity-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.pathway-sigil-container {
  position: relative;
  width: 72px;
  height: 72px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
}

.pathway-sigil {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(200, 178, 115, 0.3));
  position: relative;
  z-index: 5;
}

.sigil-echo {
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 50%;
  animation: pulseEcho 3s ease-out infinite;
}

@keyframes pulseEcho {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

.path-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 4px;
  opacity: 0.6;
}

.path-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--myst-offwhite);
  margin: 0;
  font-weight: 700;
}

/* Content Area */
.divinity-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.divinity-stat {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.stat-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.05), transparent);
  margin-left: 16px;
}

.stat-value {
  font-family: 'Playfair Display', serif;
}

.sequence-val {
  font-size: 32px;
  color: var(--myst-gold);
  font-weight: 700;
  line-height: 1;
}

/* Ethereal Gauge */
.acting-val {
  font-size: 14px;
  color: #aaa;
  font-family: 'JetBrains Mono', monospace;
}

.ethereal-gauge {
  position: relative;
  height: 6px;
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--myst-gold) 0%, #4ecdc4 100%);
  position: relative;
  transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 3px;
}

.gauge-light {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 30px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  filter: blur(2px);
  animation: shine 2s linear infinite;
}

@keyframes shine {
  from { transform: translateX(-100%); }
  to { transform: translateX(300%); }
}

.gauge-markers {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-evenly;
  pointer-events: none;
}

.marker {
  width: 1px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .divinity-path {
    padding: 24px;
  }
  
  .path-title {
    font-size: 24px;
  }
  
  .sequence-val {
    font-size: 28px;
  }
}
</style>
