<template>
  <div class="shop-items">
    <!-- Back to Categories Button -->
    <div v-if="selectedCategory" class="back-to-categories">
      <button class="back-button" @click="emit('back-to-categories')">
        <i class="fa-solid fa-arrow-left"></i>
        {{ t('backToCategories') }}
      </button>
    </div>

    <!-- Comparison Table (Modal/Overlay) - Hidden by default, kept for potential future use -->
    <ComparisonTable
        v-if="showComparisonTable"
        :items="getComparisonItems()"
        @close="showComparisonTable = false"
        @purchase="handlePurchase"
        @remove="removeFromComparison"
    />

    <!-- Items Grid -->
    <div class="items-grid">
      <ShopItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="item"
          class="shop-item-card"
          @purchase="handlePurchase"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useBalanceStore} from "@/stores/balance";
import {useUserStore} from "@/stores/user";
import {useAuthStore} from "@/stores/auth";
import {useNotification} from "@/services/useNotification";
import {useI18n} from "@/composables/useI18n";
import ShopItemCard from "./ShopItemCard.vue";
import ComparisonTable from "./ComparisonTable.vue";
import Decimal from "decimal.js";
import type {ServiceResponse} from "@/types/services";

const props = defineProps<{
  selectedCategory?: string | null;
}>();

const emit = defineEmits<{
  (e: 'back-to-categories'): void;
}>();

const shopStore = useBalanceStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const {t} = useI18n();
const items = computed(() => shopStore.items);
const profile = computed(() => userStore.currentUser);

// State management
const activeTab = ref<string>(props.selectedCategory || 'all');

// Watch for prop changes
watch(() => props.selectedCategory, (newCategory) => {
  if (newCategory) {
    activeTab.value = newCategory;
  }
}, {immediate: true});
const comparisonItems = ref<Set<string>>(new Set());
const showComparisonTable = ref(false);

// Filtered items based on active tab
const filteredItems = computed(() => {
  let filtered: ServiceResponse[];

  if (activeTab.value === 'all') {
    filtered = items.value;
  } else {
    // Category filter
    filtered = items.value.filter(item => item.category === activeTab.value);
  }

  // Sort alphabetically
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

const removeFromComparison = (itemId: string) => {
  comparisonItems.value.delete(itemId);
  if (comparisonItems.value.size < 2) {
    showComparisonTable.value = false;
  }
};

const getComparisonItems = (): ServiceResponse[] => {
  return items.value.filter(item => comparisonItems.value.has(item.id));
};

// Purchase handler
const handlePurchase = (itemId: string) => {
  const {show} = useNotification();

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    show(
        t('shopLoginRequired') || "Please log in to make purchases",
        {
          type: "warn",
          duration: 5000,
        },
    );
    return;
  }

  // Check if account is verified (has nickname) before allowing purchase
  if (!profile.value?.verified || !profile.value?.nickname) {
    show(
        t('profileSetupRequired') || "Please verify your account and set up your profile to make purchases",
        {
          type: "warn",
          duration: 5000,
        },
    );
    return;
  }

  // Find item
  const item = items.value.find(i => i.id === itemId);

  console.log("Purchase button clicked for item:", itemId, item);

  if (!item) {
    console.log("Item not found, showing error notification");
    show(t('itemNotFound') || "Item not found", {type: "error", duration: 3000});
    return;
  }

  if (!item.is_active) {
    console.log("Item not active, showing warning notification");
    show(t('itemNotAvailable') || "This item is currently unavailable for purchase", {
      type: "warn",
      duration: 4000,
    });
    return;
  }

  console.log("Showing purchase preparation notification");

  const requiresServerSelection =
      item.server_availability?.mode === "selectable";

  const existingServer =
      shopStore.currentPurchase?.id === item.id
          ? shopStore.currentPurchase.selectedServer
          : undefined;

  shopStore.currentPurchase = {
    id: item.id,
    price: new Decimal(item.price),
    requiresServerSelection,
    selectedServer: existingServer,
  };
};

</script>

<style scoped>
.shop-items {
  padding: 20px 0;
  overflow: visible;
}

/* Back to Categories Button */
.back-to-categories {
  margin-top: 8px;
  margin-bottom: 24px;
  padding-left: 8px;
  overflow: visible;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  border-radius: 8px;
  color: var(--myst-ink-strong);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  will-change: transform;
}

.back-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
  transform: translateX(-4px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myst-bg) 40%, transparent);
}

.back-button i {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.back-button:hover i {
  transform: translateX(-2px);
}

/* Items Grid */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 0;
}

.shop-item-card {
  opacity: 1;
  transform: translateY(0);
  animation: fadeInUp 0.4s ease-out backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .shop-items {
    padding: 16px 0;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .back-to-categories {
    margin-top: 4px;
    margin-bottom: 16px;
    padding-left: 0;
  }

  .back-button {
    padding: 10px 16px;
    font-size: 13px;
    width: 100%;
    justify-content: center;
  }

  .back-button:hover {
    transform: translateY(-2px);
  }

  .back-button:hover i {
    transform: translateX(0);
  }
}
</style>
