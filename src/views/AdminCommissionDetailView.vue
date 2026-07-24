<template>
  <div class="admin-commission-detail">
    <div class="page-header">
      <button class="back-button" @click="router.push('/admin/commissions')">
        <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <div class="header-identity">
        <div class="header-badge">
          <i class="fa-solid fa-scroll"></i>
        </div>
        <h1 class="page-title">{{ commission ? commission.playerIgn + "'s Commission" : 'Commission Request' }}</h1>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading commission...
    </div>

    <div v-else-if="loadError" class="error-message">{{ loadError }}</div>

    <template v-else-if="commission">
      <!-- Identity + summary -->
      <div class="section">
        <div class="form-card">
          <div class="detail-top-row">
            <span class="type-badge">{{ formatTypeSummary(commission) }}</span>
            <span :class="`status-${commission.status.toLowerCase()}`" class="status-badge">{{ formatStatus(commission.status) }}</span>
            <a
                v-if="ticketUrl"
                :href="ticketUrl"
                class="ticket-link"
                rel="noopener noreferrer"
                target="_blank"
            >
              <i class="fa-brands fa-discord"></i>
              Open Discord Ticket
            </a>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <label>Player IGN</label>
              <span>{{ commission.playerIgn }}</span>
            </div>
            <div class="detail-item">
              <label>Discord</label>
              <span>{{ commission.discordUsername }} ({{ commission.discordId }})</span>
            </div>
            <div class="detail-item">
              <label>Slots Attached</label>
              <span>{{ commission.linkedSlotIds.length }} commission slot(s)</span>
            </div>
            <div v-if="commission.commissionsRequired" class="detail-item">
              <label>Commissions Required</label>
              <span>{{ commission.commissionsRequired }}</span>
            </div>
            <div v-if="commission.assignedDeveloper" class="detail-item">
              <label>Assigned Developer</label>
              <span>{{ commission.assignedDeveloper }}</span>
            </div>
            <div class="detail-item">
              <label>Submitted</label>
              <span>{{ formatDate(commission.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Last Updated</label>
              <span>{{ formatDate(commission.updatedAt) }}</span>
            </div>
          </div>

          <template v-if="commission.majorChanges.length > 0">
            <div v-for="(change, index) in commission.majorChanges" :key="`major-${index}`" class="detail-section major-change-card">
              <label>Major Change #{{ index + 1 }} – {{ change.targetName }} ({{ change.majorType }})</label>
              <p>{{ change.requestedChange }}</p>
              <p class="motivation-text">Motivation: {{ change.motivation }}</p>
              <p v-if="change.loreReference" class="motivation-text">Lore Reference: {{ change.loreReference }}</p>
            </div>
          </template>

          <table v-if="commission.minorChanges.length > 0" class="minor-changes-table">
            <thead>
            <tr>
              <th>Target</th>
              <th>Change Description</th>
              <th>Motivation</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(change, index) in commission.minorChanges" :key="index">
              <td>{{ change.targetName }}</td>
              <td>{{ change.changeDescription }}</td>
              <td>{{ change.motivation }}</td>
            </tr>
            </tbody>
          </table>

          <div v-if="commission.touchesExistingCommission" class="touches-warning">
            <i class="fa-solid fa-triangle-exclamation"></i>
            This target has been commissioned before (case-insensitive exact match – may miss renamed/aliased
            spells; non-blocking, informational only).
          </div>

          <div v-if="commission.staffNotes" class="prior-notes">
            <label>Current Staff Notes</label>
            <p>{{ commission.staffNotes }}</p>
          </div>
        </div>
      </div>

      <!-- Review action panel -->
      <div class="section">
        <h2 class="section-title">Review Action</h2>

        <div class="form-card">
          <div class="action-buttons">
            <button :class="{ active: selectedAction === 'APPROVE' }" class="action-select-btn approve" @click="selectAction('APPROVE')">
              <i class="fa-solid fa-check"></i> Approve
            </button>
            <button :class="{ active: selectedAction === 'DECLINE' }" class="action-select-btn decline" @click="selectAction('DECLINE')">
              <i class="fa-solid fa-xmark"></i> Decline
            </button>
            <button :class="{ active: selectedAction === 'RESCOPE' }" class="action-select-btn rescope" @click="selectAction('RESCOPE')">
              <i class="fa-solid fa-rotate-left"></i> Request Rescope
            </button>
            <button
                v-if="commission.status === 'APPROVED'"
                :class="{ active: selectedAction === 'COMPLETE' }"
                class="action-select-btn complete"
                @click="selectAction('COMPLETE')"
            >
              <i class="fa-solid fa-flag-checkered"></i> Mark Completed
            </button>
          </div>

          <div v-if="selectedAction" class="action-form">
            <div class="form-group">
              <label>Staff Notes{{ notesRequired ? ' *' : '' }}</label>
              <textarea
                  v-model="staffNotes"
                  :class="{ error: validationErrors.staffNotes }"
                  placeholder="Explain what needs to change, or leave feedback – the player sees this."
                  rows="3"
              ></textarea>
              <div v-if="validationErrors.staffNotes" class="field-error">{{ validationErrors.staffNotes }}</div>
            </div>

            <div class="form-group">
              <label>Assigned Developer</label>
              <input v-model="assignedDeveloper" placeholder="Developer name" type="text"/>
            </div>

            <div v-if="selectedAction === 'RESCOPE'" class="form-group">
              <label>Commissions Required</label>
              <input v-model.number="commissionsRequired" min="1" placeholder="Total slots needed" type="number"/>
              <small>Total number of slots the player needs before resubmitting. Leave blank if just 1.</small>
            </div>

            <div class="form-actions">
              <button :disabled="submitting" class="action-btn primary" @click="submitReview">
                <span v-if="submitting" class="button-spinner"></span>
                {{ submitting ? 'Updating…' : `Confirm ${actionLabel}` }}
              </button>
              <button :disabled="submitting" class="action-btn secondary" @click="selectedAction = null">
                Cancel
              </button>
            </div>
          </div>

          <p class="update-note">This also posts a status-update message into the request's Discord ticket automatically.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {commissionsAPI} from '@/utils/api/commissions';
import {COMMISSION_STATUSES} from '@/types/commissions';
import type {AdminCommissionResponseDto, CommissionStatus} from '@/types/commissions';

type ReviewAction = 'APPROVE' | 'DECLINE' | 'RESCOPE' | 'COMPLETE';

const ACTION_STATUS: Record<ReviewAction, CommissionStatus> = {
  APPROVE: 'APPROVED',
  DECLINE: 'REJECTED',
  RESCOPE: 'RESCOPE_REQUIRED',
  COMPLETE: 'COMPLETED',
};

const ACTION_LABEL: Record<ReviewAction, string> = {
  APPROVE: 'Approve',
  DECLINE: 'Decline',
  RESCOPE: 'Rescope',
  COMPLETE: 'Completion',
};

const route = useRoute();
const router = useRouter();

const commission = ref<AdminCommissionResponseDto | null>(null);
const loading = ref(true);
const loadError = ref('');
const submitting = ref(false);

const selectedAction = ref<ReviewAction | null>(null);
const staffNotes = ref('');
const assignedDeveloper = ref('');
const commissionsRequired = ref<number | null>(null);
const validationErrors = ref<Record<string, string>>({});

const notesRequired = computed(() => selectedAction.value === 'DECLINE' || selectedAction.value === 'RESCOPE');
const actionLabel = computed(() => (selectedAction.value ? ACTION_LABEL[selectedAction.value] : ''));

const ticketUrl = computed(() => {
  if (!commission.value?.discordTicketChannelId) return null;
  const guildId = import.meta.env.VITE_DISCORD_GUILD_ID;
  if (!guildId) return null;
  return `https://discord.com/channels/${guildId}/${commission.value.discordTicketChannelId}`;
});

const formatStatus = (status: string): string =>
    COMMISSION_STATUSES.find((s) => s.value === status)?.label || status;

const formatDate = (dateString: string): string => new Date(dateString).toLocaleString();

const formatTypeSummary = (c: AdminCommissionResponseDto): string => {
  const parts: string[] = [];
  if (c.majorChanges.length > 0) parts.push(`${c.majorChanges.length} major`);
  if (c.minorChanges.length > 0) parts.push(`${c.minorChanges.length} minor`);
  return parts.join(', ') || '–';
};

const selectAction = (action: ReviewAction) => {
  selectedAction.value = action;
  staffNotes.value = commission.value?.staffNotes || '';
  assignedDeveloper.value = commission.value?.assignedDeveloper || '';
  commissionsRequired.value = commission.value?.commissionsRequired || null;
  validationErrors.value = {};
};

const submitReview = async () => {
  if (!commission.value || !selectedAction.value) return;

  const errors: Record<string, string> = {};
  if (notesRequired.value && !staffNotes.value.trim()) {
    errors.staffNotes = 'Staff notes are required for this action.';
  }
  validationErrors.value = errors;
  if (Object.keys(errors).length > 0) return;

  const status = ACTION_STATUS[selectedAction.value];

  if (!confirm(`${actionLabel.value} ${commission.value.playerIgn}'s commission request?`)) {
    return;
  }

  submitting.value = true;
  try {
    const response = await commissionsAPI.adminReview(commission.value.id, {
      status,
      staffNotes: staffNotes.value || null,
      assignedDeveloper: assignedDeveloper.value || null,
      commissionsRequired: selectedAction.value === 'RESCOPE' ? commissionsRequired.value : commission.value.commissionsRequired,
    });
    commission.value = response.data;
    selectedAction.value = null;
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  loading.value = true;
  try {
    const response = await commissionsAPI.adminGetById(id);
    if (!response.data) {
      loadError.value = 'Commission request not found.';
    } else {
      commission.value = response.data;
    }
  } catch {
    loadError.value = 'Failed to load commission request.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-commission-detail {
  padding: 24px;
  max-width: 900px;
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
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-ink);
}

.loading {
  text-align: center;
  padding: 32px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  background: var(--myst-bg-2);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
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

.error-message {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #ef4444 35%, transparent);
  font-size: 13px;
  font-weight: 500;
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

.form-card {
  background: var(--myst-bg-2);
  padding: 22px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.detail-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  flex-wrap: wrap;
}

.type-badge,
.status-badge {
  display: inline-block;
  padding: 3px 9px;
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

.ticket-link {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: color-mix(in srgb, #5865f2 18%, transparent);
  border: 1px solid color-mix(in srgb, #5865f2 45%, transparent);
  border-radius: 7px;
  color: #a3b1ff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.ticket-link:hover {
  background: color-mix(in srgb, #5865f2 30%, transparent);
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

.detail-section {
  margin-bottom: 16px;
}

.detail-section label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--myst-gold);
  margin-bottom: 6px;
}

.detail-section p {
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

.major-change-card {
  padding: 12px 14px;
  background: color-mix(in srgb, var(--myst-gold) 6%, transparent);
  border-left: 2px solid var(--myst-gold);
  border-radius: 4px;
}

.minor-changes-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 12.5px;
}

.minor-changes-table th {
  text-align: left;
  padding: 8px 10px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--myst-ink-muted);
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.minor-changes-table td {
  padding: 10px;
  color: var(--myst-ink);
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 12%, transparent);
  vertical-align: top;
}

.minor-changes-table tr:last-child td {
  border-bottom: none;
}

.touches-warning {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  border: 1px solid color-mix(in srgb, #f59e0b 35%, transparent);
  color: #f59e0b;
  font-size: 12px;
  border-radius: 8px;
}

.prior-notes {
  padding: 14px;
  background: color-mix(in srgb, #60a5fa 10%, transparent);
  border-left: 3px solid #60a5fa;
  border-radius: 4px;
}

.prior-notes label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #60a5fa;
  margin-bottom: 6px;
}

.prior-notes p {
  margin: 0;
  font-size: 13px;
  color: var(--myst-ink);
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.action-select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 7px;
  color: var(--myst-ink-muted);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-select-btn:hover {
  color: var(--myst-ink);
}

.action-select-btn.approve.active {
  background: color-mix(in srgb, #10b981 18%, transparent);
  border-color: #10b981;
  color: #34d399;
}

.action-select-btn.decline.active {
  background: color-mix(in srgb, #ef4444 18%, transparent);
  border-color: #ef4444;
  color: #f87171;
}

.action-select-btn.rescope.active {
  background: color-mix(in srgb, #3b82f6 18%, transparent);
  border-color: #3b82f6;
  color: #60a5fa;
}

.action-select-btn.complete.active {
  background: color-mix(in srgb, #8b5cf6 18%, transparent);
  border-color: #8b5cf6;
  color: #a78bfa;
}

.action-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

.form-group {
  margin-bottom: 18px;
}

.form-group:last-of-type {
  margin-bottom: 0;
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
.form-group textarea:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.field-error {
  color: #ef4444;
  font-size: 11px;
  font-weight: 500;
  margin-top: 5px;
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

.action-btn.secondary {
  background: var(--myst-bg);
  color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.action-btn.secondary:hover:not(:disabled) {
  color: var(--myst-ink);
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
  margin: 16px 0 0;
  font-size: 11px;
  color: var(--myst-ink-muted);
}
</style>
