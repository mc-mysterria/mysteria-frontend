<template>
  <section id="community" class="observatory">
    <div class="myst-shell observatory-grid">
      <div class="observatory-copy">
        <p class="myst-eyebrow">{{ t('homePage.observatoryEyebrow') }}</p>
        <h2 class="observatory-title">{{ title }}</h2>
        <p class="observatory-lede">{{ t('homePage.observatoryLede') }}</p>

        <div class="observatory-rows">
          <div class="observatory-row">
            <span class="row-label nowrap">{{ t('homePage.observatoryAdvanced') }}</span>
            <span class="row-value">{{ advancedBeyonders }}</span>
          </div>
          <div class="observatory-row">
            <span class="row-label">{{ t('homePage.observatoryAverage') }}</span>
            <span class="row-value">{{ averageSequence }}</span>
          </div>
          <div class="observatory-row">
            <span class="row-label">{{ t('homePage.observatoryActive') }}</span>
            <span class="row-value">{{ uniquePathways }} / 22</span>
          </div>
        </div>
      </div>

      <div class="observatory-panel myst-panel">
        <div class="panel-head">
          <h3>{{ t('homePage.observatoryPanelTitle') }}</h3>
          <span class="panel-note">{{ t('homePage.observatoryPanelNote') }}</span>
        </div>

        <div v-if="loading && !topPathways.length" class="panel-loading">
          <span v-for="row in 5" :key="row" class="panel-skeleton"></span>
        </div>

        <div v-else class="panel-rows">
          <RouterLink
              v-for="pathway in topFive"
              :key="pathway.name"
              class="pathway-row"
              :to="`/pathways/${pathway.name.toLowerCase()}`"
          >
            <img :alt="pathwayName(pathway.name, currentLanguage)" :src="pathwayImage(pathway.name)" class="row-sigil">
            <span class="row-name">{{ pathwayName(pathway.name, currentLanguage) }}</span>
            <span class="row-meter">
              <span :style="{ width: `${Math.round((pathway.count / maxPathwayCount) * 100)}%` }"></span>
            </span>
            <span class="row-count">{{ pathway.count }}</span>
          </RouterLink>
        </div>

        <RouterLink class="panel-registry-link" to="/ascension">
          {{ t('homePage.observatoryRegistryCta') }} →
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useI18n} from '@/composables/useI18n';
import {useBeyonderStats} from '@/composables/useBeyonderStats';
import {pathwayImage, pathwayName} from '@/data/pathways';

const {t, currentLanguage} = useI18n();
const {
  loading,
  totalBeyonders,
  uniquePathways,
  advancedBeyonders,
  averageSequence,
  topPathways,
  maxPathwayCount,
} = useBeyonderStats();

const topFive = computed(() => topPathways.value.slice(0, 5));
const title = computed(() =>
    t('homePage.observatoryTitle').replace('{count}', String(totalBeyonders.value)),
);
</script>

<style scoped>
.observatory {
  padding: 100px 24px;
  background: var(--myst-bg);
}

.observatory-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 60px;
  align-items: center;
}

.observatory-title {
  margin: 14px 0 18px;
  font-family: var(--myst-font-display);
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--myst-offwhite);
}

.observatory-lede {
  margin: 0 0 34px;
  color: var(--myst-ink-muted);
  font-size: 15px;
  line-height: 1.75;
}

.observatory-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.observatory-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--myst-line-14);
}

.row-label {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.row-label.nowrap {
  white-space: nowrap;
}

.row-value {
  font-family: var(--myst-font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-gold);
}

/* Panel */
.observatory-panel {
  padding: 38px 40px;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
}

.panel-head h3 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 19px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.panel-note {
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.panel-rows,
.panel-loading {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-skeleton {
  height: 40px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
  background-size: 200% 100%;
  animation: observatoryShimmer 1.6s linear infinite;
}

@keyframes observatoryShimmer {
  to {
    background-position: -200% 0;
  }
}

.pathway-row {
  display: grid;
  grid-template-columns: 44px 110px 1fr 44px;
  align-items: center;
  gap: 16px;
  color: inherit;
}

.pathway-row:hover {
  color: inherit;
}

.pathway-row:hover .row-name {
  color: var(--myst-gold);
}

.row-sigil {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(200, 178, 115, 0.3));
}

.row-name {
  font-size: 14.5px;
  color: var(--myst-offwhite);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.25s ease;
}

.row-meter {
  display: block;
  height: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.row-meter > span {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(200, 178, 115, 0.5), var(--myst-gold));
}

.row-count {
  font-family: var(--myst-font-mono);
  font-size: 13px;
  color: var(--myst-gold);
  text-align: right;
}

.panel-registry-link {
  display: block;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid var(--myst-line-14);
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  transition: color 0.25s ease;
}

.panel-registry-link:hover {
  color: var(--myst-gold);
}

@media (max-width: 980px) {
  .observatory-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .observatory {
    padding: 70px 20px;
  }

  .observatory-panel {
    padding: 26px 22px;
  }

  .pathway-row {
    grid-template-columns: 36px 1fr 44px;
    gap: 12px;
  }

  .row-meter {
    display: none;
  }

  .row-sigil {
    width: 32px;
    height: 32px;
  }
}
</style>
