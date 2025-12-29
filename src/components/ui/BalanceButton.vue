<template>
  <button
      v-if="profile"
      :title="currentLanguage === 'en' ? 'View currency settings and top up' : 'Top up your balance'"
      class="balance-button"
      type="button"
      @click="handleTopUpClick"
  >
    <div class="balance-info">
      <span v-if="displayCurrencySymbol" class="currency-symbol">{{ displayCurrencySymbol }}</span>
      <IconBalance v-if="currentLanguage !== 'en' || currentCurrency === 'POINTS'" class="balance-icon"/>
      <span class="balance-amount">{{ displayBalance }}</span>
    </div>
    <svg class="plus-icon" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-linecap="round" stroke-width="2.5"/>
    </svg>
  </button>

  <!-- Currency Conversion Modal -->
  <Teleport to="body">
    <div v-if="showCurrencyModal" class="modal-overlay" @click="closeCurrencyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Currency Settings</h3>
          <button class="modal-close" @click="closeCurrencyModal">×</button>
        </div>
        <div class="modal-body">
          <div class="currency-selector">
            <h4 class="section-title">Display Currency</h4>
            <p class="section-description">Display balance &amp; prices in:</p>
            <div class="currency-options">
              <button
                  :class="['currency-option', { active: currentCurrency === 'USD' }]"
                  @click="selectCurrency('USD')"
              >
                <span class="currency-symbol-large">$</span>
                <span class="currency-name">USD</span>
                <span class="currency-info">1 USD = 40 Marks</span>
              </button>
              <button
                  :class="['currency-option', { active: currentCurrency === 'EUR' }]"
                  @click="selectCurrency('EUR')"
              >
                <span class="currency-symbol-large">€</span>
                <span class="currency-name">EUR</span>
                <span class="currency-info">1 EUR = 44 Marks</span>
              </button>
              <button
                  :class="['currency-option', { active: currentCurrency === 'POINTS' }]"
                  @click="selectCurrency('POINTS')"
              >
                <IconBalance class="currency-icon-large"/>
                <span class="currency-name">Marks</span>
                <span class="currency-info">Show actual points</span>
              </button>
            </div>
          </div>

          <div class="conversion-info">
            <h4 class="section-title">Payment Conversion Rates</h4>
            <p class="section-description">Top-up conversion rates:</p>
            <div class="conversion-table">
              <!--              <div class="conversion-row">-->
              <!--                <span class="currency">UAH</span>-->
              <!--                <span class="rate">1:1</span>-->
              <!--              </div>-->
              <div class="conversion-row">
                <span class="currency">USD</span>
                <span class="rate">1:40</span>
              </div>
              <div class="conversion-row">
                <span class="currency">EUR</span>
                <span class="rate">1:44</span>
              </div>
            </div>
          </div>

          <div v-if="currentLanguage === 'en'" class="donation-warning">
            <p class="warning-text">
              ⚠️ Important: When making a donation, please set your name to your in-game nickname so we can credit your
              account.
            </p>
          </div>

          <div class="modal-actions">
            <a :href="topUpUrl" class="top-up-button" target="_blank">
              Top Up Balance
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import {useBalanceStore} from "@/stores/balance";
import {useUserStore} from "@/stores/user";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import {computed, ref} from "vue";
import IconBalance from "@/assets/icons/IconBalance.vue";

const balanceStore = useBalanceStore();
const userStore = useUserStore();
const {currentLanguage} = useI18n();
const {currentCurrency, setCurrency, formatCurrency, getCurrencySymbol} = useCurrency();

const profile = computed(() => userStore.currentUser);
const donatelloUrl = computed(() => balanceStore.donatelloUrl);
const topUpUrl = computed(() =>
    currentLanguage.value === 'en'
        ? 'https://buymeacoffee.com/mysterria'
        : donatelloUrl.value
);
const showCurrencyModal = ref(false);

const displayBalance = computed(() => {
  const balance = balanceStore.currentBalance?.amount ?? 0;
  if (currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS') {
    return formatCurrency(balance, {showSymbol: false, decimals: 2});
  }
  return balance.toString();
});

const displayCurrencySymbol = computed(() => {
  if (currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS') {
    return getCurrencySymbol();
  }
  return '';
});

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
.balance-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px 8px 16px;
  height: 40px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--myst-ink);
  font-weight: 500;
  font-size: 14px;
}

.balance-button:hover {
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 50%, transparent);
}

.balance-button:active {
  transform: scale(0.98);
}

.balance-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.currency-symbol {
  font-weight: 600;
  font-size: 14px;
  color: var(--myst-ink);
  flex-shrink: 0;
}

.balance-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--myst-ink);
}

.balance-amount {
  font-size: 14px;
  font-weight: 500;
  color: var(--myst-ink);
  white-space: nowrap;
}

.plus-icon {
  width: 18px;
  height: 18px;
  color: var(--myst-gold);
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.balance-button:hover .plus-icon {
  color: color-mix(in srgb, var(--myst-gold) 120%, white 20%);
}

/* Parchment theme adjustments */
:root[data-theme="parchment"] .balance-button {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

:root[data-theme="parchment"] .balance-button:hover {
  background: var(--myst-bg);
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
}

@media (max-width: 768px) {
  .balance-button {
    height: 38px;
    padding: 6px 10px 6px 12px;
    gap: 10px;
  }

  .balance-info {
    gap: 5px;
  }

  .balance-amount,
  .currency-symbol {
    font-size: 13px;
  }

  .balance-icon {
    width: 16px;
    height: 16px;
  }

  .plus-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .balance-button {
    height: 36px;
    padding: 6px 8px 6px 10px;
    gap: 8px;
  }

  .balance-info {
    gap: 4px;
  }

  .balance-amount,
  .currency-symbol {
    font-size: 12px;
  }

  .balance-icon {
    width: 14px;
    height: 14px;
  }

  .plus-icon {
    width: 15px;
    height: 15px;
  }
}
</style>

<!-- Global modal styles -->
<style>
/* Currency Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}

.modal-content {
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, white 20%, transparent);
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--myst-ink-muted);
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--myst-ink-strong);
}

.modal-body {
  padding: 20px 24px 24px;
}

.modal-description {
  margin: 0 0 20px;
  color: var(--myst-ink);
  line-height: 1.5;
}

/* Currency Selector Section */
.currency-selector {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
}

.section-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.section-description {
  margin: 0 0 16px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.5;
}

.currency-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.currency-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border: 2px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.currency-option:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
}

.currency-option.active {
  border-color: var(--myst-gold);
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.currency-symbol-large {
  font-size: 22px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.currency-icon-large {
  width: 22px;
  height: 22px;
  color: var(--myst-gold);
}

.currency-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.currency-info {
  font-size: 10px;
  color: var(--myst-ink-muted);
  text-align: center;
  line-height: 1.3;
}

.conversion-info {
  margin-bottom: 16px;
}

.conversion-table {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.conversion-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, white 8%, transparent);
}

.conversion-row:last-child {
  border-bottom: none;
}

.currency {
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.rate {
  font-family: monospace;
  color: var(--myst-gold);
  font-weight: 500;
}

.donation-warning {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 8px;
}

.warning-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--myst-ink-strong);
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.top-up-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.3);
}

.top-up-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 120%, white 20%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(200, 178, 115, 0.4);
}

/* Responsive styles */
@media (max-width: 480px) {
  .currency-options {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .currency-option {
    padding: 14px 12px;
  }

  .modal-content {
    max-width: 95vw;
  }
}
</style>
