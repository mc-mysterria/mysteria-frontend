<template>
  <div class="my-commissions">
    <div class="list-header">
      <span class="list-eyebrow">{{ t('commissions.mine.eyebrow') }}</span>
      <h3 class="list-title">{{ t('commissions.mine.title') }}</h3>
    </div>

    <div v-if="loading" class="state-block">
      <div class="loading-sigil"></div>
    </div>

    <div v-else-if="commissions.length === 0" class="state-block empty">
      <i class="fa-solid fa-scroll empty-icon"></i>
      <p>{{ t('commissions.mine.empty') }}</p>
    </div>

    <div v-else class="commission-entries">
      <div v-for="c in commissions" :key="c.id" class="commission-entry">
        <div class="entry-indicator" :class="`indicator-${c.status.toLowerCase()}`"></div>
        <div class="entry-main">
          <div class="entry-top-row">
            <span class="type-tag">{{ t(`commissions.requestType.${c.requestType}`) }}</span>
            <CommissionStatusBadge :status="c.status"/>
          </div>

          <div class="entry-meta">
            <span>{{ t('commissions.mine.slotsUsed') }}: {{ c.linkedSlotCount }}</span>
            <span v-if="c.commissionsRequired">
              {{ t('commissions.mine.slotsRequired') }}: {{ c.commissionsRequired }}
            </span>
            <span class="entry-date">{{ formatNotificationDate(c.createdAt, locale) }}</span>
          </div>

          <div v-if="c.staffNotes" class="entry-details">
            <button class="details-trigger" :class="{ 'is-active': expanded.has(c.id) }" @click="toggle(c.id)">
              <span>{{ t('commissions.mine.staffNotes') }}</span>
              <i class="fa-solid fa-caret-down"></i>
            </button>
            <Transition name="expand">
              <p v-if="expanded.has(c.id)" class="staff-notes-text">{{ c.staffNotes }}</p>
            </Transition>
          </div>

          <div class="entry-actions">
            <RouterLink :to="`/commissions/${c.id}`" class="view-details-btn">
              {{ t('commissions.mine.viewDetails') }}
            </RouterLink>
            <button v-if="c.status === 'RESCOPE_REQUIRED'" class="resubmit-btn" @click="resubmit(c.id)">
              {{ t('commissions.mine.resubmit') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from '@/composables/useI18n';
import {commissionsAPI} from '@/utils/api/commissions';
import {formatNotificationDate} from '@/utils/notifications';
import CommissionStatusBadge from '@/components/commissions/CommissionStatusBadge.vue';
import type {CommissionResponseDto} from '@/types/commissions';

const router = useRouter();
const {t, currentLanguage} = useI18n();

const loading = ref(false);
const commissions = ref<CommissionResponseDto[]>([]);
const expanded = ref<Set<string>>(new Set());
const locale = computed(() => (currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US'));

const load = async () => {
  loading.value = true;
  try {
    const response = await commissionsAPI.getMine();
    commissions.value = response.data;
  } finally {
    loading.value = false;
  }
};

const toggle = (id: string) => {
  if (expanded.value.has(id)) expanded.value.delete(id);
  else expanded.value.add(id);
};

const resubmit = (id: string) => {
  router.push({path: '/commissions', query: {resubmit: id}});
};

defineExpose({reload: load});

onMounted(load);
</script>

<style scoped>
.my-commissions {
  margin-top: 40px;
}

.list-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.list-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.list-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--myst-offwhite);
}

.state-block {
  padding: 40px 0;
  text-align: center;
  color: #666;
}

.state-block.empty .empty-icon {
  font-size: 26px;
  color: #444;
  margin-bottom: 12px;
  display: block;
}

.loading-sigil {
  width: 28px;
  height: 28px;
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

.commission-entries {
  display: grid;
  gap: 16px;
}

.commission-entry {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.entry-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: #555;
}

.indicator-pending_review {
  background: #fbbf24;
}

.indicator-approved {
  background: #34d399;
}

.indicator-rejected {
  background: #f87171;
}

.indicator-rescope_required {
  background: #60a5fa;
}

.indicator-completed {
  background: #a78bfa;
}

.entry-main {
  padding: 18px 20px 18px 24px;
}

.entry-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.type-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.05);
  color: #888;
}

.entry-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.entry-date {
  font-family: 'JetBrains Mono', monospace;
}

.entry-details {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.details-trigger {
  background: none;
  border: none;
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.details-trigger:hover,
.details-trigger.is-active {
  color: var(--myst-gold);
}

.staff-notes-text {
  margin: 12px 0 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  font-size: 12px;
  color: #ccc;
  line-height: 1.6;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.entry-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.view-details-btn,
.resubmit-btn {
  padding: 8px 18px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.view-details-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
}

.view-details-btn:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
}

.resubmit-btn {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

.resubmit-btn:hover {
  background: #60a5fa;
  color: #05070a;
}
</style>
