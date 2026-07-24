<template>
  <span :class="`status-${status.toLowerCase()}`" class="status-badge">{{ label }}</span>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useI18n} from '@/composables/useI18n';
import type {CommissionStatus} from '@/types/commissions';

const props = defineProps<{ status: CommissionStatus }>();
const {t} = useI18n();

const label = computed(() => t(`commissions.status.${props.status}`));
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.status-pending_review {
  background: color-mix(in srgb, #f59e0b 25%, transparent);
  color: #fbbf24;
}

.status-approved {
  background: color-mix(in srgb, #10b981 25%, transparent);
  color: #34d399;
}

.status-rejected {
  background: color-mix(in srgb, #ef4444 25%, transparent);
  color: #f87171;
}

.status-rescope_required {
  background: color-mix(in srgb, #3b82f6 25%, transparent);
  color: #60a5fa;
}

.status-completed {
  background: color-mix(in srgb, #8b5cf6 25%, transparent);
  color: #a78bfa;
}
</style>
