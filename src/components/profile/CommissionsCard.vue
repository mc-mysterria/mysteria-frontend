<template>
  <div v-if="isOwnProfile" class="commissions-card">
    <div class="card-header">
      <span class="card-eyebrow">{{ t('commissions.card.eyebrow') }}</span>
      <h3 class="card-title">{{ t('commissions.pageTitle') }}</h3>
    </div>

    <div v-if="loading" class="state-block">
      <div class="loading-sigil"></div>
    </div>

    <template v-else>
      <div class="stats-row">
        <div class="stat">
          <span class="stat-value">{{ availableSlots }}</span>
          <span class="stat-label">{{ t('commissions.card.slotsAvailable') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">{{ t('commissions.card.pending') }}</span>
        </div>
        <div v-if="rescopeCount > 0" class="stat highlight">
          <span class="stat-value">{{ rescopeCount }}</span>
          <span class="stat-label">{{ t('commissions.card.needsAction') }}</span>
        </div>
      </div>

      <RouterLink class="card-cta" to="/commissions">
        {{ t('commissions.card.viewCta') }}
      </RouterLink>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {useI18n} from '@/composables/useI18n';
import {commissionsAPI} from '@/utils/api/commissions';
import type {CommissionResponseDto, CommissionSlotDto} from '@/types/commissions';

const props = defineProps<{ isOwnProfile: boolean }>();

const {t} = useI18n();

const loading = ref(false);
const slots = ref<CommissionSlotDto[]>([]);
const commissions = ref<CommissionResponseDto[]>([]);

const availableSlots = computed(() => slots.value.length);
const pendingCount = computed(
    () => commissions.value.filter((c) => c.status === 'PENDING_REVIEW').length,
);
const rescopeCount = computed(
    () => commissions.value.filter((c) => c.status === 'RESCOPE_REQUIRED').length,
);

const load = async () => {
  if (!props.isOwnProfile) return;
  loading.value = true;
  try {
    const [slotsRes, mineRes] = await Promise.all([
      commissionsAPI.getSlots(),
      commissionsAPI.getMine(),
    ]);
    slots.value = slotsRes.data;
    commissions.value = mineRes.data;
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<style scoped>
.commissions-card {
  position: relative;
  background: rgba(13, 16, 30, 0.4);
  padding: 28px 32px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.card-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.card-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.card-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--myst-offwhite);
}

.state-block {
  padding: 24px 0;
  text-align: center;
}

.loading-sigil {
  width: 26px;
  height: 26px;
  margin: 0 auto;
  border: 2px solid rgba(200, 178, 115, 0.2);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat {
  flex: 1;
  min-width: 100px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.stat.highlight {
  background: rgba(96, 165, 250, 0.08);
  border-color: rgba(96, 165, 250, 0.3);
}

.stat-value {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: var(--myst-gold);
}

.stat.highlight .stat-value {
  color: #60a5fa;
}

.stat-label {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-cta {
  display: block;
  text-align: center;
  padding: 12px;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.card-cta:hover {
  background: var(--myst-gold);
  color: #05070a;
}

@media (max-width: 600px) {
  .commissions-card {
    padding: 20px;
  }
}
</style>
