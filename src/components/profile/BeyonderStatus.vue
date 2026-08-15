<template>
  <section class="pathway-panel beyonder-status-container">
    <span class="myst-corner-frame panel-frame" aria-hidden="true"></span>
    <span class="panel-glow" aria-hidden="true"></span>

    <div class="panel-head">
      <div class="sigil">
        <span class="sigil-echo" aria-hidden="true"></span>
        <span class="sigil-disc">
          <img :alt="pathwayDisplay" :src="pathwayImg">
        </span>
      </div>
      <p class="pathway-label">{{ t('profilePage.pathwayOfThe') }}</p>
      <h2 class="pathway-name">{{ pathwayDisplay }}</h2>
      <p class="pathway-sequence">
        {{ t('profilePage.sequence') }} {{ beyonderData.sequence }}
        <template v-if="currentRungName"> · {{ currentRungName }}</template>
      </p>
    </div>

    <div class="acting">
      <div class="acting-head">
        <span class="myst-micro">{{ t('profilePage.actingProgress') }}</span>
        <span class="acting-value">{{ actingPercentage }}%</span>
      </div>
      <div class="myst-meter acting-meter">
        <span :style="{ width: `${Math.min(100, Number(actingPercentage))}%` }"></span>
      </div>
      <p class="acting-hint">{{ t('profilePage.actingHint') }}</p>
    </div>

    <div v-if="ladder.length" class="ladder">
      <span class="myst-micro ladder-label">{{ t('profilePage.climb') }}</span>
      <div class="ladder-rows">
        <div
            v-for="rung in ladder"
            :key="rung.sequence"
            :class="['rung', rung.state]"
        >
          <span class="rung-number">S{{ rung.sequence }}</span>
          <span class="rung-name">{{ rung.name }}</span>
          <span class="rung-tag">{{ rung.tag }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useI18n} from '@/composables/useI18n';
import type {BeyonderData} from '@/types/users';
import {pathwayImage, pathwayLadder, pathwayName} from '@/data/pathways';

const {t, currentLanguage} = useI18n();

const props = defineProps<{ beyonderData: BeyonderData }>();

const pathwayId = computed(() => props.beyonderData.pathway.toLowerCase());
const pathwayDisplay = computed(() => pathwayName(pathwayId.value, currentLanguage.value));
const pathwayImg = computed(() => pathwayImage(pathwayId.value));

const currentSequence = computed(() => {
  const parsed = Number.parseInt(String(props.beyonderData.sequence), 10);
  return Number.isFinite(parsed) ? parsed : null;
});

const actingPercentage = computed(() => {
  const percentage = props.beyonderData.acting * 100;
  if (percentage < 0.01) return percentage.toFixed(4);
  return percentage.toFixed(2);
});

type RungState = 'done' | 'current' | 'next' | 'locked';

const ladder = computed(() => {
  const rungs = pathwayLadder(pathwayId.value, currentLanguage.value);
  const current = currentSequence.value;

  return rungs.map(rung => {
    let state: RungState = 'locked';
    if (current !== null) {
      if (rung.sequence > current) state = 'done';
      else if (rung.sequence === current) state = 'current';
      else if (rung.sequence === current - 1) state = 'next';
    }

    return {
      ...rung,
      state,
      tag: state === 'done'
          ? t('profilePage.climbed')
          : state === 'current'
              ? t('profilePage.youAreHere')
              : state === 'next'
                  ? t('profilePage.nextRitual')
                  : '',
    };
  });
});

const currentRungName = computed(
    () => ladder.value.find(rung => rung.state === 'current')?.name ?? '',
);
</script>

<style scoped>
.pathway-panel {
  position: relative;
  padding: 40px 36px;
  background: linear-gradient(170deg, rgba(16, 19, 34, 0.9), rgba(8, 10, 18, 0.96));
  border: 1px solid var(--myst-line-35);
  overflow: hidden;
}

.panel-frame {
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border-color: var(--myst-line-12);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 24px, 24px 0);
}

.panel-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 80% 45% at 50% 0%, rgba(200, 178, 115, 0.08), transparent 70%);
}

.panel-head {
  position: relative;
  text-align: center;
  margin-bottom: 34px;
}

.sigil {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 22px;
}

.sigil-echo {
  position: absolute;
  inset: -6px;
  border: 1px solid rgba(200, 178, 115, 0.25);
  border-radius: 50%;
  animation: pulseEcho 3.2s ease-out infinite;
}

@keyframes pulseEcho {
  0% {
    transform: scale(0.92);
    opacity: 1;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

.sigil-disc {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--myst-line-20);
}

.sigil-disc img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 14px rgba(200, 178, 115, 0.4));
}

.pathway-label {
  margin: 0 0 8px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: rgba(200, 178, 115, 0.6);
}

.pathway-name {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 34px;
  font-weight: 800;
  color: var(--myst-offwhite);
}

.pathway-sequence {
  margin: 10px 0 0;
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--myst-gold);
}

/* Acting */
.acting {
  position: relative;
  margin-bottom: 30px;
}

.acting-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.acting-value {
  font-family: var(--myst-font-mono);
  font-size: 14px;
  font-weight: 700;
  color: var(--myst-gold);
}

.acting-meter {
  height: 6px;
}

.acting-hint {
  margin: 10px 0 0;
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.6;
}

/* Ladder */
.ladder {
  position: relative;
}

.ladder-label {
  display: block;
  margin-bottom: 14px;
}

.ladder-rows {
  display: flex;
  flex-direction: column;
}

.rung {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-left: 2px solid rgba(255, 255, 255, 0.06);
}

.rung-number {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  color: rgba(145, 145, 155, 0.4);
}

.rung-name {
  font-size: 13px;
  color: rgba(145, 145, 155, 0.45);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rung-tag {
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(145, 145, 155, 0.5);
  white-space: nowrap;
}

.rung.done {
  border-left-color: var(--myst-line-40);
}

.rung.done .rung-number {
  color: var(--myst-gold);
}

.rung.done .rung-name {
  color: var(--myst-ink);
}

.rung.next .rung-number,
.rung.current .rung-number {
  color: var(--myst-gold);
}

.rung.current {
  background: rgba(200, 178, 115, 0.1);
  border-left-color: var(--myst-gold);
}

.rung.current .rung-name {
  color: var(--myst-offwhite);
  font-weight: 700;
}

.rung.current .rung-tag {
  color: var(--myst-gold);
}

@media (max-width: 520px) {
  .pathway-panel {
    padding: 30px 22px;
  }

  .pathway-name {
    font-size: 28px;
  }
}
</style>
