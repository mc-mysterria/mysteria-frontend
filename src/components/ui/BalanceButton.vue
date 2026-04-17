<template>
  <button
      v-if="profile"
      :class="['topup-ritual-btn', { 'is-icon-only': iconMode }]"
      :title="t('topUpBalance')"
      type="button"
      @click="handleTopUpClick"
  >
    <i class="fa-solid fa-plus-ritual fa-plus"></i>
    <span v-if="!iconMode" class="btn-text">{{ t('topUpBalance') }}</span>
  </button>

  <!-- Currency Conversion Modal -->
  <Teleport to="body">
    <Transition name="ritual-fade">
      <div v-if="showCurrencyModal" class="modal-ritual-overlay" @click="closeCurrencyModal">
        <div class="modal-ritual-content compact" @click.stop>
          <div class="modal-ritual-header">
            <h3 class="ritual-title">{{ t('currencySettings') }}</h3>
            <button class="modal-ritual-close" @click="closeCurrencyModal">†</button>
          </div>
          
          <div class="modal-ritual-body no-scrollbar">
            <div class="ritual-section">
              <h4 class="ritual-section-title">{{ t('displayCurrency') }}</h4>
              <p class="ritual-section-desc">{{ t('displayCurrencyDesc') }}</p>
              <div class="currency-ritual-grid">
                <button
                    v-for="curr in currencies"
                    :key="curr.code"
                    :class="['currency-ritual-option', { active: currentCurrency === curr.code }]"
                    @click="selectCurrency(curr.code)"
                >
                  <span v-if="curr.symbol" class="curr-symbol">{{ curr.symbol }}</span>
                  <IconBalance v-else class="curr-icon"/>
                  <span class="curr-name">{{ curr.code === 'POINTS' ? t('marks') : curr.code }}</span>
                  <span class="curr-rate">{{ getRateText(curr.code) }}</span>
                </button>
              </div>
            </div>

            <div class="ritual-section">
              <h4 class="ritual-section-title">{{ t('paymentConversionRates') }}</h4>
              <div class="conversion-ledger">
                <div class="ledger-row">
                  <span class="ledger-label">USD</span>
                  <span class="ledger-val">1:40</span>
                </div>
                <div class="ledger-row">
                  <span class="ledger-label">EUR</span>
                  <span class="ledger-val">1:44</span>
                </div>
              </div>
            </div>

            <div v-if="currentLanguage === 'en'" class="ritual-warning-box">
              <p class="warning-ritual-text">
                † {{ t('donationWarning') }}
              </p>
            </div>

            <div class="modal-ritual-actions">
              <a :href="topUpUrl" class="btn-ritual-primary" target="_blank">
                {{ t('topUpBalance') }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import {useBalanceStore} from "@/stores/balance";
import {useUserStore} from "@/stores/user";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import {computed, ref} from "vue";
import IconBalance from "@/assets/icons/IconBalance.vue";

const props = defineProps<{
  iconMode?: boolean;
}>();

const balanceStore = useBalanceStore();
const userStore = useUserStore();
const {t, currentLanguage} = useI18n();
const {currentCurrency, setCurrency} = useCurrency();

const profile = computed(() => userStore.currentUser);
const donatelloUrl = computed(() => balanceStore.donatelloUrl);
const topUpUrl = computed(() =>
    currentLanguage.value === 'en'
        ? 'https://buymeacoffee.com/mysterria'
        : donatelloUrl.value
);
const showCurrencyModal = ref(false);

const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'POINTS', symbol: null }
] as const;

const getRateText = (code: string) => {
  if (code === 'POINTS') return t('showActualPoints');
  const rate = code === 'USD' ? '40' : '44';
  return t('oneCurrencyRate').replace('{currency}', code).replace('{rate}', rate);
};

const closeCurrencyModal = () => {
  showCurrencyModal.value = false;
};

const selectCurrency = (currency: 'USD' | 'EUR' | 'POINTS') => {
  setCurrency(currency);
};

const handleTopUpClick = () => {
  if (currentLanguage.value === 'en') {
    showCurrencyModal.value = true;
  } else {
    window.open(donatelloUrl.value, '_blank');
  }
};
</script>

<style scoped>
.topup-ritual-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: 40px;
  background: rgba(200, 178, 115, 0.1);
  border: 1px solid rgba(200, 178, 115, 0.3);
  border-radius: 4px;
  color: var(--myst-gold);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.topup-ritual-btn:hover {
  background: var(--myst-gold);
  color: #05070a;
}

.topup-ritual-btn.is-icon-only {
  width: 40px;
  padding: 0;
  justify-content: center;
}

/* Modal Ritual Styles - Compact */
.modal-ritual-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}

.modal-ritual-content.compact {
  background: #080a14;
  border: 1px solid rgba(200, 178, 115, 0.2);
  width: 100%; max-width: 440px;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.modal-ritual-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex; align-items: center; justify-content: space-between;
}

.ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px; color: var(--myst-gold); margin: 0;
}

.modal-ritual-close {
  background: none; border: none;
  color: #444; font-size: 20px;
  cursor: pointer; transition: color 0.3s;
}
.modal-ritual-close:hover { color: var(--myst-gold); }

.modal-ritual-body { padding: 24px; }

.ritual-section { margin-bottom: 24px; }

.ritual-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 14px; color: #fff; margin-bottom: 6px;
}

.ritual-section-desc {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: #666; margin-bottom: 12px;
}

.currency-ritual-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}

.currency-ritual-option {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 4px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; transition: all 0.3s;
}

.currency-ritual-option:hover { border-color: rgba(200, 178, 115, 0.3); }
.currency-ritual-option.active {
  border-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.05);
}

.curr-symbol { font-size: 18px; color: #fff; }
.curr-icon { width: 18px; height: 18px; color: var(--myst-gold); }
.curr-name { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #aaa; }
.curr-rate { font-size: 8px; color: #555; text-align: center; }

.conversion-ledger {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.ledger-row {
  display: flex; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.ledger-label { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #888; }
.ledger-val { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--myst-gold); }

.ritual-warning-box {
  background: rgba(200, 178, 115, 0.03);
  border-left: 2px solid var(--myst-gold);
  padding: 12px; margin-bottom: 24px;
}

.warning-ritual-text { font-size: 11px; color: #666; line-height: 1.4; margin: 0; }

.btn-ritual-primary {
  width: 100%; display: flex; align-items: center; justify-content: center;
  padding: 12px; background: var(--myst-gold); color: #05070a;
  text-decoration: none; font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 700; transition: all 0.3s;
}

.btn-ritual-primary:hover { background: #fff; }

.ritual-fade-enter-active, .ritual-fade-leave-active { transition: all 0.4s ease; }
.ritual-fade-enter-from, .ritual-fade-leave-to { opacity: 0; transform: scale(0.95); }

.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
