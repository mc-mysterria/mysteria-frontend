<template>
  <section v-if="isOwnProfile" class="commissions-card myst-panel">
    <header class="card-head">
      <h3>{{ t('commissions.pageTitle') }}</h3>
      <RouterLink class="card-link" to="/commissions">{{ t('commissions.card.viewCta') }} →</RouterLink>
    </header>

    <div v-if="loading" class="card-loading" aria-hidden="true">
      <span></span><span></span>
    </div>

    <div v-else class="card-stats">
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
  </section>
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
const pendingCount = computed(() => commissions.value.filter(c => c.status === 'PENDING_REVIEW').length);
const rescopeCount = computed(() => commissions.value.filter(c => c.status === 'RESCOPE_REQUIRED').length);

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
  padding: 28px 30px;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.card-head h3 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.card-link {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.card-link:hover {
  color: var(--myst-gold);
}

.card-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-family: var(--myst-font-mono);
  font-size: 26px;
  font-weight: 700;
  color: var(--myst-gold);
}

.stat-label {
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.stat.highlight .stat-value {
  color: var(--myst-amber);
}

.card-loading {
  display: flex;
  gap: 32px;
}

.card-loading span {
  width: 64px;
  height: 40px;
  background: rgba(255, 255, 255, 0.04);
}
</style>
