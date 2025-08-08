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
import { ref, computed, watch } from "vue";
import { useBalanceStore } from "@/stores/balance";
import { useNotification } from "@/services/useNotification";
import { useI18n } from "@/composables/useI18n";
import { Decimal } from "decimal.js";
import DropdownSelect from "@/components/ui/DropdownSelect.vue";

const { t } = useI18n();
const isVisible = ref(false);
const modalText = ref("");
const confirmText = ref("");
const cancelText = ref("");
const selectedServer = ref<string>("");
const balanceStore = useBalanceStore();
const { show } = useNotification();

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
  { immediate: true },
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
@font-face {
  font-family: "MontserratSemiBold";
  src: url("@assets/fonts/Montserrat-SemiBold.ttf");
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.card {
  background-color: #4ade80;
  box-shadow: 0 12px 20px 0 rgba(0, 0, 0, 0.24);
  padding: 24px;
  border-radius: 12px;
  font-family: "MontserratSemiBold";
  max-width: 424px;
  width: 90%;
  text-align: center;
  margin: 0 20px;
}

p {
  margin-bottom: 24px;
  font-size: 18px;
  word-wrap: break-word;
}

.card div {
  text-align: center;
  border-radius: 7px;
  padding: 10px 0;
  width: 100%;
  max-width: 376px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.buttonYes {
  color: black;
  background-color: white;
  margin-bottom: 15px;
}

.buttonYes:hover:not(.disabled) {
  background-color: #f0f0f0;
}

.buttonYes.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #cccccc;
}

.buttonYes.disabled:hover {
  background-color: #cccccc;
}

.server-selection {
  width: 100%;
  margin: 20px 0;
  text-align: left;
}

.buttonNo {
  border: 2px solid white;
}

.buttonNo:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (max-width: 576px) {
  .card {
    padding: 20px;
    margin: 0 15px;
  }

  p {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .card div {
    padding: 8px 0;
  }

  .buttonYes {
    margin-bottom: 10px;
  }
}
</style>
