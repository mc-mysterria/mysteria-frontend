<template>
  <div class="shop-items">
    <div class="items-grid" ref="itemsGridRef">
      <ShopItemCard
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :class="[
          'shop-item-card',
          { 'item-visible': visibleItems.includes(index) },
        ]"
        :style="{ '--animation-delay': `${index * 0.1}s` }"
        @purchase="handlePurchase"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useNotification } from "@/services/useNotification";
import ShopItemCard from "./ShopItemCard.vue";
import Decimal from "decimal.js";
import type { ServiceResponse } from "@/types/services";

const shopStore = useBalanceStore();
const userStore = useUserStore();
const items = computed(() => shopStore.items);
const itemsGridRef = ref<HTMLElement>();
const visibleItems = ref<number[]>([]);
const profile = computed(() => userStore.currentUser);

const handlePurchase = (itemId: string) => {
  const { show } = useNotification();

  // Check if account is verified (has nickname) before allowing purchase
  if (!profile.value?.nickname) {
    show("Для покупки необхідно налаштувати профіль. Перейдіть до профілю та додайте нікнейм.", { 
      type: "error", 
      duration: 5000 
    });
    return;
  }

  const item = items.value.find((item) => item.id === itemId);

  console.log("Purchase button clicked for item:", itemId, item);

  if (!item) {
    console.log("Item not found, showing error notification");
    show("Товар не знайдено", { type: "error", duration: 3000 });
    return;
  }

  if (!item.is_active) {
    console.log("Item not active, showing warning notification");
    show("Цей товар наразі недоступний для покупки", { type: "warn", duration: 4000 });
    return;
  }

  console.log("Showing purchase preparation notification");

  const requiresServerSelection = item.server_availability?.mode === "selectable";

  const existingServer = shopStore.currentPurchase?.id === item.id
    ? shopStore.currentPurchase.selectedServer
    : undefined;

  shopStore.currentPurchase = {
    id: item.id,
    price: new Decimal(item.price),
    requiresServerSelection,
    selectedServer: existingServer,
  };
};

const getCardOrder = (item: ServiceResponse) => {
  // Order by service type: ROLE, ITEM, PERMISSION, COSMETIC
  switch (item.type) {
    case "ROLE":
      return 0;
    case "ITEM":
      return 1;
    case "PERMISSION":
      return 2;
    case "COSMETIC":
      return 3;
    default:
      return 4;
  }
};

const animateItems = () => {
  visibleItems.value = [];

  const sortedItems = items.value
    .map((item, originalIndex) => ({
      originalIndex,
      order: getCardOrder(item),
    }))
    .sort((a, b) => a.order - b.order);

  sortedItems.forEach((item, displayIndex) => {
    setTimeout(() => {
      visibleItems.value.push(item.originalIndex);
    }, displayIndex * 67);
  });
};

watch(
  () => items.value.length,
  () => {
    if (items.value.length > 0) {
      nextTick(() => {
        animateItems();
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (items.value.length > 0) {
    nextTick(() => {
      animateItems();
    });
  }
});
</script>

<style scoped>
.shop-items {
  padding: 20px 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 0 10px;
}

.shop-item-card {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: var(--animation-delay);
}

.shop-item-card.item-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 576px) {
  .items-grid {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>
