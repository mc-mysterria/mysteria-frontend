<template>
  <div v-if="profile" class="dollar">
    <button
      v-if="currentLanguage === 'en'"
      @click="showCurrencyModal = true"
      class="addMoney currency-info-btn"
      type="button"
      title="Currency conversion info"
    >
      i
    </button>
    <a v-else :href="donatelloUrl" target="_blank" class="addMoney">+</a>
    <IconBalance />{{ balanceStore.currentBalance?.amount ?? 0 }}
  </div>

  <!-- Currency Conversion Modal -->
  <Teleport to="body">
    <div v-if="showCurrencyModal" class="modal-overlay" @click="closeCurrencyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Currency Conversion</h3>
          <button @click="closeCurrencyModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">
            Currency may be converted into project marks via the following distribution:
          </p>
          <div class="conversion-table">
            <div class="conversion-row">
              <span class="currency">UAH</span>
              <span class="rate">1:1</span>
            </div>
            <div class="conversion-row">
              <span class="currency">USD</span>
              <span class="rate">1:40</span>
            </div>
            <div class="conversion-row">
              <span class="currency">EUR</span>
              <span class="rate">1:44</span>
            </div>
            <div class="conversion-row">
              <span class="currency">USDT</span>
              <span class="rate">1:40</span>
            </div>
          </div>
          <div class="modal-actions">
            <a :href="donatelloUrl" target="_blank" class="top-up-button">
              Top Up
            </a>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useI18n } from "@/composables/useI18n";
import { computed, ref } from "vue";
import IconBalance from "@/assets/icons/IconBalance.vue";

const balanceStore = useBalanceStore();
const userStore = useUserStore();
const { currentLanguage } = useI18n();

const profile = computed(() => userStore.currentUser);
const donatelloUrl = computed(() => balanceStore.donatelloUrl);
const showCurrencyModal = ref(false);

const closeCurrencyModal = () => {
  showCurrencyModal.value = false;
};
</script>

<style scoped>
.dollar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 40px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  color: var(--myst-ink);
  backdrop-filter: blur(8px);
}

.dollar:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

:root[data-theme="parchment"] .dollar {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  color: var(--myst-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

:root[data-theme="parchment"] .dollar:hover {
  background: var(--myst-bg);
  border-color: var(--myst-ink-muted);
}

.addMoney {
  position: absolute;
  top: 0;
  right: -8px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--myst-gold);
  cursor: pointer;
  text-decoration: none;
  color: var(--myst-bg);
  transition: all 0.3s ease;
  box-shadow:
    0 4px 16px rgba(16, 185, 129, 0.4),
    0 0 20px rgba(16, 185, 129, 0.3);
  border: 2px solid rgba(23, 26, 33, 1);
  backdrop-filter: blur(5px);
}

.addMoney:hover {
  background: linear-gradient(135deg, #22c55e 0%, #10b981 50%, #a0dc8e 100%);
  transform: translateY(-50%) scale(1.15) rotate(5deg);
  box-shadow:
    0 6px 25px rgba(16, 185, 129, 0.6),
    0 0 30px rgba(16, 185, 129, 0.4);
}

.addMoney:active {
  transform: translateY(-50%) scale(0.95);
}

.currency-info-btn {
  font-style: italic;
  font-weight: 700;
  font-size: 14px;
}

.dollar svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .dollar {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .addMoney {
    width: 28px;
    height: 28px;
    font-size: 16px;
    right: -6px;
  }

  .dollar svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .dollar {
    padding: 8px 14px;
    font-size: 0.85rem;
  }

  .addMoney {
    width: 24px;
    height: 24px;
    font-size: 14px;
    right: -4px;
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
</style>
