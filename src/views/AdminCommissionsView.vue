<template>
  <div class="admin-commissions">
    <!-- Header -->
    <div class="page-header">
      <button class="back-button" @click="router.push('/profile')">
        <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <div class="header-identity">
        <div class="header-badge">
          <i class="fa-solid fa-scroll"></i>
        </div>
        <h1 class="page-title">Commission Requests</h1>
      </div>
    </div>

    <div class="section">
      <div class="controls">
        <div class="filter-box">
          <select v-model="statusFilter" @change="loadCommissions">
            <option value="">All statuses</option>
            <option v-for="opt in COMMISSION_STATUSES" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <button :disabled="loading" class="refresh-btn" @click="loadCommissions">
          <svg fill="none" height="15" stroke="currentColor" viewBox="0 0 24 24" width="15">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      <div class="commission-list">
        <div
            v-for="c in commissions"
            :key="c.id"
            :class="{ selected: selected?.id === c.id }"
            class="commission-item"
            @click="select(c)"
        >
          <div class="item-info">
            <div class="item-name">
              {{ c.playerIgn }}
              <span :class="`type-${c.requestType.toLowerCase()}`" class="type-badge">{{ c.requestType }}</span>
              <span :class="`status-${c.status.toLowerCase()}`" class="status-badge">
                {{ formatStatus(c.status) }}
              </span>
              <span v-if="c.touchesExistingCommission" class="warning-badge" title="This target has been commissioned before">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </span>
            </div>
            <div class="item-details">
              <span v-if="c.requestType === 'MAJOR'">{{ c.majorTargetName }} — {{ c.majorType }}</span>
              <span v-else>{{ c.minorChanges.length }} minor change(s)</span>
              <span>{{ formatDate(c.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div v-if="commissions.length === 0 && !loading" class="no-items">
          No commission requests found.
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        Loading commissions...
      </div>
    </div>

    <!-- Review panel -->
    <div v-if="selected" class="section">
      <h2 class="section-title">Review Request</h2>

      <div class="form-card">
        <div class="detail-grid">
          <div class="detail-item">
            <label>Player</label>
            <span>{{ selected.playerIgn }} (Discord: {{ selected.discordUsername }})</span>
          </div>
          <div class="detail-item">
            <label>Type</label>
            <span>{{ selected.requestType }}</span>
          </div>
          <div class="detail-item">
            <label>Linked Slots</label>
            <span>{{ selected.linkedSlotIds.length }}</span>
          </div>
          <div class="detail-item">
            <label>Discord Ticket</label>
            <span>{{ selected.discordTicketChannelId }}</span>
          </div>
        </div>

        <template v-if="selected.requestType === 'MAJOR'">
          <div class="detail-item full">
            <label>Target</label>
            <span>{{ selected.majorTargetName }} ({{ selected.majorType }})</span>
          </div>
          <div class="detail-item full">
            <label>Requested Change</label>
            <p>{{ selected.majorRequestedChange }}</p>
          </div>
          <div class="detail-item full">
            <label>Motivation</label>
            <p>{{ selected.majorMotivation }}</p>
          </div>
          <div v-if="selected.majorLoreReference" class="detail-item full">
            <label>Lore Reference</label>
            <p>{{ selected.majorLoreReference }}</p>
          </div>
        </template>

        <template v-else>
          <div v-for="(change, index) in selected.minorChanges" :key="index" class="detail-item full">
            <label>Minor Change #{{ index + 1 }} — {{ change.targetName }}</label>
            <p>{{ change.changeDescription }}</p>
            <p class="motivation-text">Motivation: {{ change.motivation }}</p>
          </div>
        </template>

        <div v-if="selected.touchesExistingCommission" class="touches-warning">
          <i class="fa-solid fa-triangle-exclamation"></i>
          This target has been commissioned before (case-insensitive exact match — may miss renamed/aliased spells).
        </div>

        <div class="form-group">
          <label>Status *</label>
          <select v-model="reviewStatus">
            <option v-for="opt in COMMISSION_STATUSES" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Staff Notes</label>
          <textarea v-model="reviewStaffNotes" placeholder="Explain what needs to change, or leave feedback..." rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Assigned Developer</label>
          <input v-model="reviewAssignedDeveloper" placeholder="Developer name" type="text"/>
        </div>

        <div class="form-group">
          <label>Commissions Required</label>
          <input v-model.number="reviewCommissionsRequired" min="1" placeholder="Total slots needed (for rescopes)" type="number"/>
          <small>Only relevant when sending back as Rescope Required and more than 1 slot is needed.</small>
        </div>

        <div class="form-actions">
          <button :disabled="reviewSubmitting" class="action-btn primary" @click="submitReview">
            <span v-if="reviewSubmitting" class="button-spinner"></span>
            {{ reviewSubmitting ? 'Updating…' : 'Update Status' }}
          </button>
        </div>
        <p class="update-note">This also posts a status-update message into the request's Discord ticket automatically.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {commissionsAPI} from '@/utils/api/commissions';
import {COMMISSION_STATUSES} from '@/types/commissions';
import type {AdminCommissionResponseDto, CommissionStatus} from '@/types/commissions';

const router = useRouter();

const commissions = ref<AdminCommissionResponseDto[]>([]);
const selected = ref<AdminCommissionResponseDto | null>(null);
const statusFilter = ref<string>('');
const loading = ref(false);
const reviewSubmitting = ref(false);

const reviewStatus = ref<CommissionStatus>('PENDING_REVIEW');
const reviewStaffNotes = ref('');
const reviewAssignedDeveloper = ref('');
const reviewCommissionsRequired = ref<number | null>(null);

const formatStatus = (status: string): string =>
    COMMISSION_STATUSES.find((s) => s.value === status)?.label || status;

const formatDate = (dateString: string): string => new Date(dateString).toLocaleString();

const loadCommissions = async () => {
  loading.value = true;
  try {
    const response = await commissionsAPI.adminList(
        statusFilter.value ? (statusFilter.value as CommissionStatus) : undefined,
    );
    commissions.value = response.data;
  } finally {
    loading.value = false;
  }
};

const select = (c: AdminCommissionResponseDto) => {
  selected.value = c;
  reviewStatus.value = c.status;
  reviewStaffNotes.value = c.staffNotes || '';
  reviewAssignedDeveloper.value = c.assignedDeveloper || '';
  reviewCommissionsRequired.value = c.commissionsRequired;
};

const submitReview = async () => {
  if (!selected.value) return;

  if (!confirm(`Update ${selected.value.playerIgn}'s commission to ${formatStatus(reviewStatus.value)}?`)) {
    return;
  }

  reviewSubmitting.value = true;
  try {
    const response = await commissionsAPI.adminReview(selected.value.id, {
      status: reviewStatus.value,
      staffNotes: reviewStaffNotes.value || null,
      assignedDeveloper: reviewAssignedDeveloper.value || null,
      commissionsRequired: reviewCommissionsRequired.value,
    });

    const updated = response.data;
    const index = commissions.value.findIndex((c) => c.id === updated.id);
    if (index !== -1) commissions.value[index] = updated;
    selected.value = updated;
  } finally {
    reviewSubmitting.value = false;
  }
};

loadCommissions();
</script>

<style scoped>
.admin-commissions {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--myst-ink-muted);
  transition: all 0.2s ease;
}

.back-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 70%, var(--myst-gold));
  color: var(--myst-ink);
}

.header-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent);
  border-radius: 8px;
  color: var(--myst-gold);
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-ink);
}

.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--myst-ink);
  margin: 0 0 16px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.filter-box {
  flex: 1;
}

.filter-box select {
  width: 100%;
  padding: 11px 15px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 8px;
  font-size: 13px;
  background: var(--myst-bg-2);
  color: var(--myst-ink);
  box-sizing: border-box;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 18px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.commission-list {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 10px;
  overflow: hidden;
  max-height: 460px;
  overflow-y: auto;
}

.commission-item {
  padding: 14px 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  cursor: pointer;
  transition: all 0.15s ease;
}

.commission-item:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 60%, var(--myst-gold));
}

.commission-item.selected {
  background: color-mix(in srgb, var(--myst-bg-2) 40%, var(--myst-gold));
  border-left: 3px solid var(--myst-gold);
}

.commission-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--myst-ink);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.type-badge,
.status-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.type-badge {
  background: color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  color: var(--myst-ink-muted);
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

.warning-badge {
  color: #f59e0b;
  font-size: 12px;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: var(--myst-ink-muted);
}

.no-items {
  padding: 40px 20px;
  text-align: center;
  color: var(--myst-ink-muted);
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 32px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  background: var(--myst-bg-2);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-top: 2px solid var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-card {
  background: var(--myst-bg-2);
  padding: 22px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

.detail-item label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--myst-ink-muted);
  margin-bottom: 4px;
}

.detail-item span {
  font-size: 13px;
  color: var(--myst-ink);
}

.detail-item.full {
  grid-column: 1 / -1;
  margin-bottom: 14px;
}

.detail-item p {
  margin: 0;
  font-size: 13px;
  color: var(--myst-ink);
  line-height: 1.6;
  white-space: pre-wrap;
}

.motivation-text {
  margin-top: 6px !important;
  color: var(--myst-ink-muted) !important;
  font-size: 12px !important;
}

.touches-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 18px;
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  color: #f59e0b;
  font-size: 12px;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--myst-ink);
  font-size: 13px;
  margin-bottom: 7px;
}

.form-group small {
  display: block;
  color: var(--myst-ink-muted);
  font-size: 12px;
  margin-top: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 7px;
  font-family: inherit;
  font-size: 13px;
  background: var(--myst-bg);
  color: var(--myst-ink);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

.action-btn {
  padding: 10px 22px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 7px;
}

.action-btn.primary {
  background: #10b981;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #059669;
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.button-spinner {
  width: 13px;
  height: 13px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top: 1.5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.update-note {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--myst-ink-muted);
}
</style>
