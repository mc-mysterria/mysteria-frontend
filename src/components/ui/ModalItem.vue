<template>
  <div v-if="isVisible" class="background" @click.self="onCancel">
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
import {computed, ref, watch} from "vue";
import {useBalanceStore} from "@/stores/balance";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import {Decimal} from "decimal.js";
import DropdownSelect from "@/components/ui/DropdownSelect.vue";

const {t} = useI18n();
const isVisible = ref(false);
const modalText = ref("");
const confirmText = ref("");
const cancelText = ref("");
const selectedServer = ref<string>("");
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

const isConfirmDisabled = computed(() => {
  const needsServer = showServerSelection.value;
  const hasServer =
      selectedServer.value || balanceStore.currentPurchase?.selectedServer;

  console.log("Button disabled check:", {
    needsServer,
    hasServer,
    selectedValue: selectedServer.value,
  });

  if (needsServer && !hasServer) {
    return true;
  }
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

  // Sync with store state instead of resetting
  selectedServer.value = balanceStore.currentPurchase?.selectedServer || "";
  console.log("Modal opened, initial server value:", selectedServer.value);

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

      show("Відкриваємо сторінку платежу...", {
        type: "info",
        duration: 3000,
      });

      window.open(urlWithAmount, "_blank");
      balanceStore.startBalanceCheck(price);
    }
  } else if (confirmText.value === t("purchase")) {
    const itemId = balanceStore.currentPurchase?.id;
    if (itemId) {
      try {
        await balanceStore.initiatePurchase(itemId);
      } finally {
        balanceStore.cancelCurrentPurchase();
      }
    }
  }
  isVisible.value = false;
}

function onCancel() {
  if (balanceStore.currentPurchase) {
    show(t("purchaseCancelled"), {
      type: "info",
      duration: 2000,
    });
  }
  balanceStore.cancelCurrentPurchase();
  isVisible.value = false;
}

defineExpose({
  showModal,
  onConfirm,
  onCancel,
  isVisible,
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
  margin-bottom: 24px;
  font-size: clamp(16px, 2.5vw, 18px);
  word-wrap: break-word;
  color: var(--myst-ink-strong);
  line-height: 1.6;
}

.card div {
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
  margin: 24px 0;
  text-align: left;
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

  .card div {
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

  .card div {
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
  0 0 30px rgba(217, 119, 6, 0.1);
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
