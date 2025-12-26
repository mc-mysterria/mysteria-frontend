<template>
  <div class="beyonder-status-container">
    <div class="beyonder-header">
      <div class="pathway-symbol-container">
        <img :src="pathwayImage" :alt="pathwayDisplay" class="pathway-symbol" />
      </div>
      <h3 class="beyonder-title">{{ t('beyonderStatus') }}</h3>
    </div>

    <div class="beyonder-content">
      <div class="beyonder-field">
        <span class="field-label">{{ t('pathway') }}:</span>
        <span class="field-value pathway-value">{{ pathwayDisplay }}</span>
      </div>

      <div class="beyonder-field">
        <span class="field-label">{{ t('sequence') }}:</span>
        <span class="field-value sequence-value">{{ beyonderData.sequence }}</span>
      </div>

      <div class="beyonder-field">
        <span class="field-label">{{ t('actingProgress') }}:</span>
        <span class="field-value">{{ actingPercentage }}%</span>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: actingPercentage + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables/useI18n';
import type { BeyonderData } from '@/types/users';

const { t } = useI18n();

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
  // Format to show meaningful decimal places
  if (percentage < 0.000001) {
    return percentage.toExponential(2);
  } else if (percentage < 0.01) {
    return percentage.toFixed(8);
  } else if (percentage < 1) {
    return percentage.toFixed(4);
  } else {
    return percentage.toFixed(2);
  }
});
</script>

<style scoped>
.beyonder-status-container {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.beyonder-status-container:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.beyonder-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
  gap: 12px;
}

.pathway-symbol-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-radius: 50%;
  padding: 12px;
  transition: all 0.3s ease;
}

.beyonder-status-container:hover .pathway-symbol-container {
  background: color-mix(in srgb, var(--myst-gold) 20%, transparent);
  transform: scale(1.05);
  box-shadow: 0 0 20px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.pathway-symbol {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px color-mix(in srgb, var(--myst-gold) 40%, transparent));
  transition: filter 0.3s ease;
}

.beyonder-status-container:hover .pathway-symbol {
  filter: drop-shadow(0 4px 12px color-mix(in srgb, var(--myst-gold) 60%, transparent));
}

.beyonder-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--myst-gold);
  margin: 0;
  text-align: center;
}

.beyonder-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.beyonder-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--myst-bg-2) 50%, transparent);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.beyonder-field:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 70%, transparent);
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--myst-ink-medium);
}

.field-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.pathway-value {
  color: var(--myst-gold);
  text-transform: capitalize;
}

.sequence-value {
  color: var(--myst-accent);
}

.progress-bar-container {
  height: 8px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--myst-gold) 0%, var(--myst-accent) 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
  min-width: 2px;
}

/* Mobile adjustments */
@media (max-width: 576px) {
  .beyonder-status-container {
    padding: 20px;
  }

  .pathway-symbol-container {
    width: 64px;
    height: 64px;
    padding: 10px;
  }

  .beyonder-title {
    font-size: 18px;
  }

  .beyonder-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .field-label,
  .field-value {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .beyonder-status-container {
    padding: 20px;
  }

  .pathway-symbol-container {
    width: 72px;
    height: 72px;
  }
}
</style>
