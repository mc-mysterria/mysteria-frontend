<template>
  <div class="commission-form-card">
    <div class="form-header">
      <span class="form-eyebrow">{{ t('commissions.form.eyebrow') }}</span>
      <h2 class="form-title">{{ t('commissions.form.title') }}</h2>
    </div>

    <div v-if="staffNoticeText" class="staff-notice">
      <i class="fa-solid fa-circle-info"></i>
      <div>
        <strong>{{ t('commissions.form.staffNotesLabel') }}</strong>
        <p>{{ staffNoticeText }}</p>
      </div>
    </div>

    <div v-if="loadingSlots" class="state-block">
      <div class="loading-sigil"></div>
    </div>

    <template v-else>
      <div v-if="buyMoreNeeded > 0" class="buy-more-notice">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>{{ buyMoreMessage }}</p>
        <RouterLink class="buy-more-link" to="/services/spell-rework">
          {{ t('commissions.form.buyMoreCta') }}
        </RouterLink>
      </div>

      <template v-else>
        <div v-if="slots.length > neededSlotCount" class="form-group">
          <label>{{ t('commissions.form.slotsLabel') }}</label>
          <div class="slot-checklist">
            <label v-for="slot in slots" :key="slot.id" class="slot-check-item">
              <input
                  :checked="selectedSlotIds.includes(slot.id)"
                  type="checkbox"
                  @change="toggleSlot(slot.id)"
              />
              <span>{{ formatSlotLabel(slot) }}</span>
            </label>
          </div>
          <small>{{ t('commissions.form.slotsNeeded').replace('{count}', String(neededSlotCount)) }}</small>
        </div>

        <div class="form-group">
          <label>{{ t('commissions.form.requestTypeLabel') }}</label>
          <div class="type-toggle">
            <button
                :class="{ active: requestType === 'MAJOR' }"
                type="button"
                @click="requestType = 'MAJOR'"
            >
              {{ t('commissions.form.typeMajor') }}
            </button>
            <button
                :class="{ active: requestType === 'MINOR_BUNDLE' }"
                type="button"
                @click="requestType = 'MINOR_BUNDLE'"
            >
              {{ t('commissions.form.typeMinorBundle') }}
            </button>
          </div>
        </div>

        <!-- MAJOR fields -->
        <template v-if="requestType === 'MAJOR'">
          <div class="form-group">
            <label>{{ t('commissions.form.targetNameLabel') }} *</label>
            <input
                v-model="majorTargetName"
                :class="{ error: validationErrors.majorTargetName }"
                :maxlength="LIMITS.targetName"
                type="text"
            />
            <div v-if="validationErrors.majorTargetName" class="field-error">
              {{ validationErrors.majorTargetName }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('commissions.form.majorTypeLabel') }} *</label>
            <select v-model="majorType" :class="{ error: validationErrors.majorType }">
              <option :value="null">{{ t('commissions.form.selectPlaceholder') }}</option>
              <option v-for="opt in MAJOR_TYPES" :key="opt.value" :value="opt.value">
                {{ t(`commissions.majorType.${opt.value}`) }}
              </option>
            </select>
            <div v-if="validationErrors.majorType" class="field-error">
              {{ validationErrors.majorType }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('commissions.form.requestedChangeLabel') }} *</label>
            <textarea
                v-model="majorRequestedChange"
                :class="{ error: validationErrors.majorRequestedChange }"
                :maxlength="LIMITS.majorRequestedChange"
                rows="4"
            ></textarea>
            <small>{{ majorRequestedChange.length }} / {{ LIMITS.majorRequestedChange }}</small>
            <div v-if="validationErrors.majorRequestedChange" class="field-error">
              {{ validationErrors.majorRequestedChange }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('commissions.form.motivationLabel') }} *</label>
            <textarea
                v-model="majorMotivation"
                :class="{ error: validationErrors.majorMotivation }"
                :maxlength="LIMITS.majorMotivation"
                rows="4"
            ></textarea>
            <small>{{ majorMotivation.length }} / {{ LIMITS.majorMotivation }}</small>
            <div v-if="validationErrors.majorMotivation" class="field-error">
              {{ validationErrors.majorMotivation }}
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('commissions.form.loreReferenceLabel') }}</label>
            <textarea
                v-model="majorLoreReference"
                :class="{ error: validationErrors.majorLoreReference }"
                :maxlength="LIMITS.majorLoreReference"
                rows="3"
            ></textarea>
            <small>{{ majorLoreReference.length }} / {{ LIMITS.majorLoreReference }}</small>
            <div v-if="validationErrors.majorLoreReference" class="field-error">
              {{ validationErrors.majorLoreReference }}
            </div>
          </div>
        </template>

        <!-- MINOR_BUNDLE fields -->
        <template v-else>
          <div
              v-for="(change, index) in minorChanges"
              :key="index"
              class="minor-change-row"
          >
            <div class="minor-change-header">
              <span>{{ t('commissions.form.minorChangeLabel') }} #{{ index + 1 }}</span>
              <button
                  v-if="minorChanges.length > LIMITS.minorChangesMin"
                  class="remove-minor-btn"
                  type="button"
                  @click="removeMinorChange(index)"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="form-group">
              <label>{{ t('commissions.form.targetNameLabel') }} *</label>
              <input
                  v-model="change.targetName"
                  :class="{ error: validationErrors[`minor.${index}.targetName`] }"
                  :maxlength="LIMITS.targetName"
                  type="text"
              />
              <div v-if="validationErrors[`minor.${index}.targetName`]" class="field-error">
                {{ validationErrors[`minor.${index}.targetName`] }}
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('commissions.form.changeDescriptionLabel') }} *</label>
              <textarea
                  v-model="change.changeDescription"
                  :class="{ error: validationErrors[`minor.${index}.changeDescription`] }"
                  :maxlength="LIMITS.minorChangeDescription"
                  rows="2"
              ></textarea>
              <small>{{ change.changeDescription.length }} / {{ LIMITS.minorChangeDescription }}</small>
              <div v-if="validationErrors[`minor.${index}.changeDescription`]" class="field-error">
                {{ validationErrors[`minor.${index}.changeDescription`] }}
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('commissions.form.motivationLabel') }} *</label>
              <textarea
                  v-model="change.motivation"
                  :class="{ error: validationErrors[`minor.${index}.motivation`] }"
                  :maxlength="LIMITS.minorMotivation"
                  rows="2"
              ></textarea>
              <small>{{ change.motivation.length }} / {{ LIMITS.minorMotivation }}</small>
              <div v-if="validationErrors[`minor.${index}.motivation`]" class="field-error">
                {{ validationErrors[`minor.${index}.motivation`] }}
              </div>
            </div>
          </div>

          <button
              v-if="minorChanges.length < LIMITS.minorChangesMax"
              class="add-minor-btn"
              type="button"
              @click="addMinorChange"
          >
            <i class="fa-solid fa-plus"></i>
            {{ t('commissions.form.addMinorChange') }}
          </button>
        </template>

        <!-- Confirmations -->
        <div class="confirmations">
          <label class="confirm-item">
            <input v-model="confirmLoreGrounded" type="checkbox"/>
            <span>{{ t('commissions.form.confirmLoreGrounded') }}</span>
          </label>
          <label class="confirm-item">
            <input v-model="confirmNoFundamentalRework" type="checkbox"/>
            <span>{{ t('commissions.form.confirmNoFundamentalRework') }}</span>
          </label>
          <label class="confirm-item">
            <input v-model="confirmNoNerfOtherCommission" type="checkbox"/>
            <span>{{ t('commissions.form.confirmNoNerfOtherCommission') }}</span>
          </label>
          <label class="confirm-item">
            <input v-model="confirmUnderstandsScope" type="checkbox"/>
            <span>{{ t('commissions.form.confirmUnderstandsScope') }}</span>
          </label>
          <div v-if="validationErrors.confirmations" class="field-error">
            {{ validationErrors.confirmations }}
          </div>
        </div>

        <div v-if="validationErrors.slots" class="field-error slots-error">
          {{ validationErrors.slots }}
        </div>

        <div class="form-actions">
          <button :disabled="submitting" class="submit-btn" type="button" @click="submit">
            <span v-if="submitting" class="button-spinner"></span>
            {{ submitting ? t('commissions.form.submitting') : t('commissions.form.submit') }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute} from 'vue-router';
import {useI18n} from '@/composables/useI18n';
import {useNotification} from '@/services/useNotification';
import {commissionsAPI} from '@/utils/api/commissions';
import {COMMISSION_LIMITS as LIMITS, MAJOR_TYPES} from '@/types/commissions';
import type {
  CommissionRequestType,
  CommissionSlotDto,
  MajorType,
  MinorChangeDto,
  SubmitCommissionRequestDto,
} from '@/types/commissions';

const emit = defineEmits<{ (e: 'submitted'): void }>();

const route = useRoute();
const {t} = useI18n();
const {show} = useNotification();

const loadingSlots = ref(true);
const submitting = ref(false);
const slots = ref<CommissionSlotDto[]>([]);
const selectedSlotIds = ref<string[]>([]);
const neededSlotCount = ref(1);
const staffNoticeText = ref<string | null>(null);
const validationErrors = ref<Record<string, string>>({});

const requestType = ref<CommissionRequestType>('MAJOR');

const majorTargetName = ref('');
const majorType = ref<MajorType | null>(null);
const majorRequestedChange = ref('');
const majorMotivation = ref('');
const majorLoreReference = ref('');

const minorChanges = ref<MinorChangeDto[]>([
  {targetName: '', changeDescription: '', motivation: ''},
]);

const confirmLoreGrounded = ref(false);
const confirmNoFundamentalRework = ref(false);
const confirmNoNerfOtherCommission = ref(false);
const confirmUnderstandsScope = ref(false);

const buyMoreNeeded = computed(() => Math.max(0, neededSlotCount.value - slots.value.length));
const buyMoreMessage = computed(() =>
    t('commissions.form.buyMoreNotice').replace('{count}', String(buyMoreNeeded.value)),
);

const formatSlotLabel = (slot: CommissionSlotDto): string => {
  const date = new Date(slot.createdAt).toLocaleDateString();
  return `${t('commissions.form.slotLabel')} · ${date}`;
};

const loadSlots = async () => {
  loadingSlots.value = true;
  try {
    const response = await commissionsAPI.getSlots();
    slots.value = response.data;
  } finally {
    loadingSlots.value = false;
  }
};

const autoSelectSlots = () => {
  const preselected = route.query.slot as string | undefined;
  const picked: string[] = [];
  if (preselected && slots.value.some((s) => s.id === preselected)) {
    picked.push(preselected);
  }
  for (const s of slots.value) {
    if (picked.length >= neededSlotCount.value) break;
    if (!picked.includes(s.id)) picked.push(s.id);
  }
  selectedSlotIds.value = picked.slice(0, neededSlotCount.value);
};

const toggleSlot = (id: string) => {
  if (selectedSlotIds.value.includes(id)) {
    selectedSlotIds.value = selectedSlotIds.value.filter((s) => s !== id);
  } else if (selectedSlotIds.value.length < neededSlotCount.value) {
    selectedSlotIds.value = [...selectedSlotIds.value, id];
  }
};

const addMinorChange = () => {
  if (minorChanges.value.length < LIMITS.minorChangesMax) {
    minorChanges.value.push({targetName: '', changeDescription: '', motivation: ''});
  }
};

const removeMinorChange = (index: number) => {
  if (minorChanges.value.length > LIMITS.minorChangesMin) {
    minorChanges.value.splice(index, 1);
  }
};

const resetForm = () => {
  requestType.value = 'MAJOR';
  majorTargetName.value = '';
  majorType.value = null;
  majorRequestedChange.value = '';
  majorMotivation.value = '';
  majorLoreReference.value = '';
  minorChanges.value = [{targetName: '', changeDescription: '', motivation: ''}];
  confirmLoreGrounded.value = false;
  confirmNoFundamentalRework.value = false;
  confirmNoNerfOtherCommission.value = false;
  confirmUnderstandsScope.value = false;
  validationErrors.value = {};
  staffNoticeText.value = null;
  neededSlotCount.value = 1;
};

const validate = (): boolean => {
  const errors: Record<string, string> = {};

  if (requestType.value === 'MAJOR') {
    if (!majorTargetName.value.trim()) errors.majorTargetName = t('commissions.form.errorRequired');
    if (!majorType.value) errors.majorType = t('commissions.form.errorRequired');
    if (!majorRequestedChange.value.trim()) errors.majorRequestedChange = t('commissions.form.errorRequired');
    if (!majorMotivation.value.trim()) errors.majorMotivation = t('commissions.form.errorRequired');
  } else {
    minorChanges.value.forEach((change, index) => {
      if (!change.targetName.trim()) errors[`minor.${index}.targetName`] = t('commissions.form.errorRequired');
      if (!change.changeDescription.trim()) errors[`minor.${index}.changeDescription`] = t('commissions.form.errorRequired');
      if (!change.motivation.trim()) errors[`minor.${index}.motivation`] = t('commissions.form.errorRequired');
    });
  }

  if (
      !confirmLoreGrounded.value ||
      !confirmNoFundamentalRework.value ||
      !confirmNoNerfOtherCommission.value ||
      !confirmUnderstandsScope.value
  ) {
    errors.confirmations = t('commissions.form.errorConfirmations');
  }

  if (selectedSlotIds.value.length !== neededSlotCount.value) {
    errors.slots = t('commissions.form.errorSlots');
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const submit = async () => {
  if (!validate()) return;

  const shared = {
    slotIds: selectedSlotIds.value,
    confirmLoreGrounded: confirmLoreGrounded.value,
    confirmNoFundamentalRework: confirmNoFundamentalRework.value,
    confirmNoNerfOtherCommission: confirmNoNerfOtherCommission.value,
    confirmUnderstandsScope: confirmUnderstandsScope.value,
  };

  const body: SubmitCommissionRequestDto =
      requestType.value === 'MAJOR'
          ? {
            requestType: 'MAJOR',
            majorTargetName: majorTargetName.value.trim(),
            majorType: majorType.value,
            majorRequestedChange: majorRequestedChange.value.trim(),
            majorMotivation: majorMotivation.value.trim(),
            majorLoreReference: majorLoreReference.value.trim() || null,
            minorChanges: null,
            ...shared,
          }
          : {
            requestType: 'MINOR_BUNDLE',
            majorTargetName: null,
            majorType: null,
            majorRequestedChange: null,
            majorMotivation: null,
            majorLoreReference: null,
            minorChanges: minorChanges.value.map((m) => ({
              targetName: m.targetName.trim(),
              changeDescription: m.changeDescription.trim(),
              motivation: m.motivation.trim(),
            })),
            ...shared,
          };

  submitting.value = true;
  try {
    await commissionsAPI.submit(body);
    show(t('commissions.form.submitSuccess'), {type: 'success', duration: 5000});
    resetForm();
    await loadSlots();
    autoSelectSlots();
    emit('submitted');
  } catch {
    // base.ts request() already surfaces a toast for 4xx/5xx
  } finally {
    submitting.value = false;
  }
};

const applyResubmitQuery = async () => {
  const resubmitParam = route.query.resubmit as string | undefined;
  if (resubmitParam) {
    try {
      const response = await commissionsAPI.getById(resubmitParam);
      neededSlotCount.value = response.data.commissionsRequired || 1;
      staffNoticeText.value = response.data.staffNotes || null;
    } catch {
      neededSlotCount.value = 1;
      staffNoticeText.value = null;
    }
  } else {
    neededSlotCount.value = 1;
    staffNoticeText.value = null;
  }
  autoSelectSlots();
};

onMounted(async () => {
  await loadSlots();
  await applyResubmitQuery();
});

// Re-applies when a "Resubmit" CTA elsewhere on the page pushes a new ?resubmit= query
// without remounting this component.
watch(() => route.query.resubmit, () => {
  if (!loadingSlots.value) applyResubmitQuery();
});
</script>

<style scoped>
.commission-form-card {
  background: rgba(13, 16, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 4px;
}

.form-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.form-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.form-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: var(--myst-offwhite);
}

.staff-notice {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 24px;
  background: rgba(96, 165, 250, 0.08);
  border-left: 3px solid #60a5fa;
  color: #cdd8ea;
  font-size: 13px;
}

.staff-notice i {
  color: #60a5fa;
  padding-top: 2px;
}

.staff-notice strong {
  display: block;
  margin-bottom: 4px;
  color: #93c5fd;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.staff-notice p {
  margin: 0;
}

.state-block {
  padding: 60px 0;
  text-align: center;
}

.loading-sigil {
  width: 32px;
  height: 32px;
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

.buy-more-notice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.buy-more-notice i {
  font-size: 22px;
  color: #f87171;
}

.buy-more-notice p {
  margin: 0;
  color: #ddd;
  font-size: 14px;
}

.buy-more-link {
  padding: 10px 24px;
  background: var(--myst-gold);
  color: #05070a;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.buy-more-link:hover {
  background: var(--myst-gold-soft);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--myst-offwhite);
  font-size: 13px;
  margin-bottom: 8px;
}

.form-group small {
  display: block;
  color: #666;
  font-size: 11px;
  margin-top: 5px;
  text-align: right;
}

.form-group input[type='text'],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.25);
  color: #eee;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px rgba(200, 178, 115, 0.15);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.field-error {
  color: #f87171;
  font-size: 11px;
  font-weight: 500;
  margin-top: 5px;
}

.slots-error {
  margin-bottom: 16px;
}

.slot-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-check-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 13px;
  color: #ccc;
  cursor: pointer;
}

.type-toggle {
  display: flex;
  gap: 8px;
}

.type-toggle button {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-toggle button.active {
  background: rgba(200, 178, 115, 0.1);
  border-color: var(--myst-gold);
  color: var(--myst-gold);
}

.minor-change-row {
  padding: 16px;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.minor-change-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.remove-minor-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.remove-minor-btn:hover {
  color: #f87171;
}

.add-minor-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 20px;
  background: transparent;
  border: 1px dashed rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-minor-btn:hover {
  background: rgba(200, 178, 115, 0.05);
}

.confirmations {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  margin: 24px 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.confirm-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12.5px;
  color: #bbb;
  cursor: pointer;
}

.confirm-item input {
  margin-top: 2px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 32px;
  background: var(--myst-gold);
  color: #05070a;
  border: none;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-spinner {
  width: 13px;
  height: 13px;
  border: 1.5px solid rgba(0, 0, 0, 0.3);
  border-top: 1.5px solid #05070a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@media (max-width: 600px) {
  .commission-form-card {
    padding: 20px;
  }
}
</style>
