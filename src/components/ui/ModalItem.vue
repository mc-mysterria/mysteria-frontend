<template>
  <div v-if="isVisible" class="background" @click.self="onCancel" @keydown="handleKeydown">
    <div class="card">
      <p>{{ modalText }}</p>

      <!-- Server Selection Dropdown -->
      <div v-if="showServerSelection" class="server-selection">
        <DropdownSelect
            v-model="selectedServer"
            :options="serverOptions"
            placeholder="Оберіть сервер..."
            display-key="label"
            value-key="value"
            :form-field-style="true"
            @change="handleServerChange"
        />
      </div>

      <!-- Quantity Input (for bulk purchases) - only show during purchase, not top-up -->
      <div v-if="showQuantityInput && confirmText === t('purchase')" class="quantity-section">
        <label class="input-label">{{ t('quantity') || 'Quantity' }}</label>
        <input
            v-model.number="quantity"
            type="number"
            min="1"
            class="quantity-input"
            :disabled="!currentService?.is_bulkable"
        />
      </div>

      <!-- Price Breakdown - only show during purchase -->
      <div v-if="confirmText === t('purchase')" class="price-breakdown">
        <div class="price-row">
          <span class="price-label">{{ t('unitPrice') || 'Unit Price' }}:</span>
          <span class="price-value">{{ formattedUnitPrice }}</span>
        </div>
        <div v-if="quantity > 1" class="price-row">
          <span class="price-label">{{ t('quantity') || 'Quantity' }}:</span>
          <span class="price-value">× {{ quantity }}</span>
        </div>
        <div class="price-row total">
          <span class="price-label">{{ t('totalPrice') || 'Total' }}:</span>
          <span class="price-value">{{ formattedTotalPrice }}</span>
        </div>
      </div>

      <!-- Gift Mode Toggle - only show during purchase, not top-up -->
      <div v-if="showGiftOption && confirmText === t('purchase')" class="gift-section">
        <label class="gift-toggle">
          <input
              v-model="isGiftMode"
              type="checkbox"
              :disabled="!currentService?.is_giftable"
          />
          <span class="toggle-label">
            <i class="fa-solid fa-gift"></i>
            {{ t('giftToUser') || 'Gift to another user' }}
          </span>
        </label>
      </div>

      <!-- User Selector (for gifts) - only show during purchase -->
      <div v-if="isGiftMode && confirmText === t('purchase')" class="recipient-section">
        <UserSelector
            v-model="selectedRecipient"
            :placeholder="t('selectRecipient') || 'Search for user...'"
        />
      </div>

      <div
          class="buttonYes"
          :class="{ disabled: isConfirmDisabled }"
          @click="onConfirm"
      >
        {{ confirmText }}
      </div>
      <div class="buttonNo" @click="onCancel">{{ cancelText }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch, nextTick} from "vue";
import {useBalanceStore} from "@/stores/balance";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import {Decimal} from "decimal.js";
import DropdownSelect from "@/components/ui/DropdownSelect.vue";
import UserSelector from "@/components/shop/UserSelector.vue";

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const {t} = useI18n();
const {formatCurrency, getCurrencySymbol, currentCurrency} = useCurrency();
const isVisible = ref(false);
const modalText = ref("");
const confirmText = ref("");
const cancelText = ref("");
const selectedServer = ref<string>("");
const quantity = ref<number>(1);
const isGiftMode = ref<boolean>(false);
const selectedRecipient = ref<string>("");
const balanceStore = useBalanceStore();
const {show} = useNotification();

// Server selection logic
const showServerSelection = computed(() => {
  return balanceStore.currentPurchase?.requiresServerSelection === true;
});

const currentService = computed(() => {
  if (!balanceStore.currentPurchase) return null;
  return balanceStore.items.find(
      (s) => s.id === balanceStore.currentPurchase?.id,
  );
});

const serverOptions = computed(() => {
  if (!currentService.value?.server_availability?.servers) return [];

  return currentService.value.server_availability.servers.map((server) => ({
    label: server.charAt(0).toUpperCase() + server.slice(1),
    value: server,
  }));
});

// Bulk purchase support
const showQuantityInput = computed(() => {
  return currentService.value?.is_bulkable === true;
});

// Gift support
const showGiftOption = computed(() => {
  return currentService.value?.is_giftable === true;
});

// Price calculations
const unitPrice = computed(() => {
  return balanceStore.currentPurchase?.price || new Decimal(0);
});

const totalPrice = computed(() => {
  return unitPrice.value.mul(quantity.value);
});

// Formatted prices based on selected currency
const formattedUnitPrice = computed(() => {
  const price = unitPrice.value;
  if (currentCurrency.value === 'POINTS') {
    return `${price.toString()} ${t('marks') || 'Marks'}`;
  }
  const symbol = getCurrencySymbol();
  return `${symbol}${formatCurrency(price, {showSymbol: false, decimals: 2})}`;
});

const formattedTotalPrice = computed(() => {
  const total = totalPrice.value;
  if (currentCurrency.value === 'POINTS') {
    return `${total.toString()} ${t('marks') || 'Marks'}`;
  }
  const symbol = getCurrencySymbol();
  return `${symbol}${formatCurrency(total, {showSymbol: false, decimals: 2})}`;
});

const isConfirmDisabled = computed(() => {
  const needsServer = showServerSelection.value;
  const hasServer =
      selectedServer.value || balanceStore.currentPurchase?.selectedServer;

  // Check if gift mode requires recipient
  const needsRecipient = isGiftMode.value;
  const hasRecipient = selectedRecipient.value;

  // Check if balance is sufficient for total price
  const balance = balanceStore.currentBalance?.amount || new Decimal(0);
  const hasSufficientBalance = balance.greaterThanOrEqualTo(totalPrice.value);

  console.log("Button disabled check:", {
    needsServer,
    hasServer,
    needsRecipient,
    hasRecipient,
    hasSufficientBalance,
    balance: balance.toString(),
    totalPrice: totalPrice.value.toString(),
  });

  // Disable if any required field is missing or insufficient balance
  if (needsServer && !hasServer) return true;
  if (needsRecipient && !hasRecipient) return true;
  if (!hasSufficientBalance && confirmText.value === t("purchase")) return true;

  return false;
});

const handleServerChange = (value: string | number | string[]) => {
  const serverValue = String(value);
  console.log("Server selected in modal:", serverValue);
  selectedServer.value = serverValue;
  balanceStore.setSelectedServer(serverValue);
  console.log("Selected server state:", selectedServer.value);
  console.log(
      "Store selected server:",
      balanceStore.currentPurchase?.selectedServer,
  );
};

function showModal(text: string, confirmLabel?: string, cancelLabel?: string) {
  modalText.value = text;
  confirmText.value = confirmLabel || t("yes");
  cancelText.value = cancelLabel || t("no");

  selectedServer.value = balanceStore.currentPurchase?.selectedServer || "";
  quantity.value = 1;  // Reset to default quantity
  isGiftMode.value = false;  // Reset gift mode
  selectedRecipient.value = "";  // Reset recipient

  console.log("Modal opened, initial values:", {
    server: selectedServer.value,
    quantity: quantity.value,
    giftMode: isGiftMode.value,
  });

  isVisible.value = true;
}

// Watch for changes in the store's selected server and sync with local state
watch(
    () => balanceStore.currentPurchase?.selectedServer,
    (newServerValue) => {
      if (newServerValue !== selectedServer.value) {
        console.log("Store server changed, syncing local state:", newServerValue);
        selectedServer.value = newServerValue || "";
      }
    },
    {immediate: true},
);

async function onConfirm() {
  // Prevent action if server selection is required but not provided
  if (isConfirmDisabled.value) {
    return;
  }

  if (confirmText.value === t("topUp")) {
    const price = balanceStore.currentPurchase?.price;
    const balance = balanceStore.currentBalance?.amount || new Decimal(0);
    if (price) {
      const amount = new Decimal(Math.ceil(Number(price.minus(balance))));
      const urlWithAmount = `${balanceStore.donatelloUrl}&a=${amount}`;

      show(t("topUpping"), {
        type: "info",
        duration: 3000,
      });

      window.open(urlWithAmount, "_blank");
      balanceStore.startBalanceCheck(price);
    }
    isVisible.value = false;
    emit('confirm');
  } else if (confirmText.value === t("purchase")) {
    const itemId = balanceStore.currentPurchase?.id;
    if (itemId) {
      try {
        await balanceStore.initiatePurchase(
            itemId,
            quantity.value,
            selectedRecipient.value || undefined,
        );
        // After a successful purchase, the store updates the balance but not the
        // currentPurchase state. We manually cancel it here to reset the UI.
        balanceStore.cancelCurrentPurchase();
      } catch (error) {
        console.error("Purchase initiation failed:", error);
        show(t('purchaseFailed'), { type: 'error', duration: 5000 });
        // Close the modal on failure to allow the user to try again.
        isVisible.value = false;
      }
    } else {
      // This handles the "zero-value" modal case; clicking Purchase should just close it.
      isVisible.value = false;
      emit('confirm');
    }
  }
}

function onCancel() {
  // If there's an active purchase in the store, show cancellation message and clear it.
  if (balanceStore.currentPurchase) {
    show(t("purchaseCancelled"), {
      type: "info",
      duration: 2000,
    });
    balanceStore.cancelCurrentPurchase();
  }
  // Always hide the modal when onCancel is called.
  isVisible.value = false;

  emit('cancel');
}

function handleKeydown(event: KeyboardEvent) {
  // Close on Escape
  if (event.key === 'Escape') {
    onCancel();
    return;
  }

  // Prevent closing when Backspace is pressed in an input
  if (event.key === 'Backspace') {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea') {
      // If the input is empty and backspace is pressed, the browser might navigate back.
      // We prevent this default behavior to avoid closing the modal unexpectedly.
      if ((target as HTMLInputElement).value === '') {
        event.preventDefault();
      }
      return; // Do not close the modal
    }
    // If not in an input, allow default behavior (which might be nothing, or could be cancel)
    onCancel();
  }
}

defineExpose({
  showModal,
  onConfirm,
  onCancel,
  isVisible,
  quantity,
  selectedRecipient,
  isGiftMode,
});
</script>

<style scoped>
.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  backdrop-filter: blur(20px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
}

.card {
  background: color-mix(in srgb, var(--myst-bg-2) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4),
  0 0 30px rgba(200, 178, 115, 0.1);
  padding: clamp(24px, 4vw, 32px);
  border-radius: 16px;
  font-family: "Inter", system-ui, sans-serif;
  max-width: 480px;
  width: 90%;
  text-align: center;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5),
  0 0 40px rgba(200, 178, 115, 0.2);
}

p {
  margin: 0 0 28px 0;
  font-size: clamp(16px, 2.5vw, 18px);
  word-wrap: break-word;
  color: var(--myst-ink-strong);
  line-height: 1.6;
  font-weight: 500;
}

/* Base button styles */
.card .buttonYes,
.card .buttonNo {
  text-align: center;
  border-radius: 10px;
  padding: clamp(12px, 2vw, 16px) clamp(20px, 3vw, 24px);
  width: 100%;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: clamp(14px, 2vw, 16px);
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buttonYes {
  background: var(--myst-gold);
  color: var(--myst-bg);
  margin-top: 8px;
  margin-bottom: 16px;
  border: 1px solid var(--myst-gold);
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.3);
}

.buttonYes:hover:not(.disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(200, 178, 115, 0.4);
}

.buttonYes:active:not(.disabled) {
  transform: translateY(0);
}

.buttonYes.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: color-mix(in srgb, var(--myst-gold) 50%, var(--myst-ink-muted));
  color: var(--myst-ink-muted);
  box-shadow: none;
}

.buttonYes.disabled:hover {
  transform: none;
  background: color-mix(in srgb, var(--myst-gold) 50%, var(--myst-ink-muted));
  box-shadow: none;
}

.server-selection {
  width: 100%;
  margin: 0 0 24px 0;
  text-align: left;
  padding: 0;
  cursor: default;
}

/* Quantity Section */
.quantity-section {
  width: 100%;
  margin: 0 0 24px 0;
  text-align: left;
  padding: 0;
  cursor: default;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quantity-input {
  width: 100%;
  padding: 13px 16px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 10px;
  color: var(--myst-ink-strong);
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quantity-input:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.quantity-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Price Breakdown */
.price-breakdown {
  width: 100%;
  margin: 0 0 24px 0;
  padding: 18px;
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 25%, transparent);
  border-radius: 10px;
  text-align: left;
  cursor: default;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.price-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  font-size: 16px;
  font-weight: 600;
}

.price-label {
  color: var(--myst-ink);
}

.price-value {
  color: var(--myst-gold);
  font-weight: 600;
}

/* Gift Section */
.gift-section {
  width: 100%;
  margin: 0 0 24px 0;
  text-align: left;
  padding: 0;
  cursor: default;
}

.gift-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 10px;
  transition: all 0.3s ease;
  user-select: none;
}

.gift-toggle:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.gift-toggle:has(input[type="checkbox"]:checked) {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
}

.gift-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--myst-gold);
}

.gift-toggle input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-ink-strong);
  font-size: 14px;
  font-weight: 500;
}

.toggle-label i {
  color: var(--myst-gold);
}

/* Recipient Section */
.recipient-section {
  width: 100%;
  margin: 0 0 24px 0;
  text-align: left;
  padding: 0;
  cursor: default;
}

.buttonNo {
  background: transparent;
  color: var(--myst-ink);
  border: 2px solid color-mix(in srgb, var(--myst-ink) 30%, transparent);
  backdrop-filter: blur(10px);
}

.buttonNo:hover {
  background: color-mix(in srgb, var(--myst-ink) 10%, transparent);
  border-color: color-mix(in srgb, var(--myst-ink) 50%, transparent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.buttonNo:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .background {
    padding: 15px;
  }

  .card {
    padding: clamp(20px, 5vw, 28px);
    max-width: 400px;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .card .buttonYes,
  .card .buttonNo {
    padding: clamp(12px, 3vw, 14px) clamp(16px, 4vw, 20px);
    font-size: 15px;
  }

  .buttonYes {
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .card {
    width: 95%;
    padding: 20px;
    border-radius: 12px;
  }

  p {
    font-size: 15px;
    margin-bottom: 18px;
  }

  .card .buttonYes,
  .card .buttonNo {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }

  .buttonYes {
    margin-bottom: 10px;
  }
}

/* Theme support */
:root[data-theme="parchment"] .card {
  background: color-mix(in srgb, var(--myst-bg) 95%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15),
  0 0 30px rgba(217, 119, 6, 0.15);
}

:root[data-theme="parchment"] .card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2),
  0 0 40px rgba(217, 119, 6, 0.15);
}

:root[data-theme="parchment"] .buttonYes {
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.25);
}

:root[data-theme="parchment"] .buttonYes:hover:not(.disabled) {
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.35);
}
</style>
