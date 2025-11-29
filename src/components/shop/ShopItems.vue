<template>
  <div class="shop-items">
    <!-- Tab Navigation -->
    <div class="shop-tabs">
      <div class="tabs-wrapper">
        <button
          v-for="tab in availableTabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Comparison Mode Toggle -->
    <div v-if="filteredItems.length > 0" class="comparison-toolbar">
      <button @click="toggleComparisonMode" class="comparison-toggle-btn">
        <i class="fa-solid fa-code-compare"></i>
        {{ comparisonMode ? t('exitComparisonMode') : t('compareItems') }}
      </button>
      <div v-if="comparisonMode" class="comparison-info">
        {{ t('selectItemsToCompare') }} ({{ comparisonItems.size }}/{{ MAX_COMPARISON_ITEMS }})
      </div>
      <button
        v-if="comparisonMode && comparisonItems.size >= 2"
        @click="showComparisonTable = true"
        class="compare-now-btn"
      >
        {{ t('compareNow') }}
      </button>
    </div>

    <!-- Comparison Table (Modal/Overlay) -->
    <ComparisonTable
      v-if="showComparisonTable"
      :items="getComparisonItems()"
      @close="showComparisonTable = false"
      @purchase="handlePurchase"
      @remove="removeFromComparison"
    />

    <!-- Items Grid -->
    <div v-if="!showComparisonTable" class="items-grid">
      <ShopItemCard
        v-for="item in filteredItems"
        :key="item.id"
        :item="item"
        :comparison-mode="comparisonMode"
        :in-comparison="comparisonItems.has(item.id)"
        :comparison-disabled="!comparisonItems.has(item.id) && comparisonItems.size >= MAX_COMPARISON_ITEMS"
        class="shop-item-card"
        @purchase="handlePurchase"
        @toggle-comparison="toggleItemComparison(item.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import { useNotification } from "@/services/useNotification";
import { useI18n } from "@/composables/useI18n";
import ShopItemCard from "./ShopItemCard.vue";
import ComparisonTable from "./ComparisonTable.vue";
import Decimal from "decimal.js";
import type { ServiceResponse } from "@/types/services";
import { ServiceType } from "@/types/services";

const shopStore = useBalanceStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const { t } = useI18n();
const items = computed(() => shopStore.items);
const profile = computed(() => userStore.currentUser);

// State management
const activeTab = ref<string>('all');
const comparisonMode = ref(false);
const comparisonItems = ref<Set<string>>(new Set());
const showComparisonTable = ref(false);
const MAX_COMPARISON_ITEMS = 3;

// Helper functions for smart categorization
const isNewItem = (item: ServiceResponse): boolean => {
  if (!item.created_at) return false;
  const createdDate = new Date(item.created_at);
  const now = new Date();
  const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff < 30;
};

const hasActiveDiscount = (item: ServiceResponse): boolean => {
  if (!item.discounts?.length) return false;
  const now = new Date();
  return item.discounts.some((discount) => {
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
};

const isPopular = (item: ServiceResponse): boolean => {
  // Check if popular flag exists in service_metadata.data
  if (item.service_metadata?.data) {
    return item.service_metadata.data.popular === true;
  }
  return false;
};

// Category title and description helpers
const getCategoryTitle = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.ITEM:
      return t('shopCategoryItems') || 'Items';
    case ServiceType.COSMETIC:
      return t('shopCategoryCosmetics') || 'Cosmetics';
    case ServiceType.PERMISSION:
      return t('shopCategoryPermissions') || 'Permissions';
    case ServiceType.SUBSCRIPTION:
      return t('shopCategorySubscriptions') || 'Subscriptions';
    case ServiceType.DISCORD_ROLE:
      return t('shopCategoryDiscordRoles') || 'Discord Roles';
    case ServiceType.APPEAL:
      return t('shopCategoryAppeals') || 'Appeals';
    default:
      return t('shopCategoryOther') || 'Other';
  }
};

// Available tabs computed property
const availableTabs = computed(() => {
  const tabs = [
    { id: 'all', label: t('shopCategoryAll'), count: items.value.length }
  ];

  // Smart filters
  const newItems = items.value.filter(isNewItem);
  if (newItems.length > 0) {
    tabs.push({ id: 'new', label: t('shopCategoryNew'), count: newItems.length });
  }

  const discountedItems = items.value.filter(hasActiveDiscount);
  if (discountedItems.length > 0) {
    tabs.push({ id: 'discounted', label: t('shopCategoryDiscounted'), count: discountedItems.length });
  }

  const popularItems = items.value.filter(isPopular);
  if (popularItems.length > 0) {
    tabs.push({ id: 'popular', label: t('shopCategoryPopular'), count: popularItems.length });
  }

  // Category tabs (dynamic from actual items)
  const categoriesWithItems = new Set(items.value.map(item => item.type));
  const categoryOrder = [
    ServiceType.ITEM,
    ServiceType.COSMETIC,
    ServiceType.PERMISSION,
    ServiceType.SUBSCRIPTION,
    ServiceType.DISCORD_ROLE,
    ServiceType.APPEAL
  ];

  categoryOrder.forEach(type => {
    if (categoriesWithItems.has(type)) {
      const count = items.value.filter(item => item.type === type).length;
      tabs.push({
        id: type,
        label: getCategoryTitle(type),
        count
      });
    }
  });

  return tabs;
});

// Filtered items based on active tab
const filteredItems = computed(() => {
  let filtered: ServiceResponse[];

  switch (activeTab.value) {
    case 'all':
      filtered = items.value;
      break;
    case 'new':
      filtered = items.value.filter(isNewItem);
      break;
    case 'discounted':
      filtered = items.value.filter(hasActiveDiscount);
      break;
    case 'popular':
      filtered = items.value.filter(isPopular);
      break;
    default:
      // Category filter
      filtered = items.value.filter(item => item.type === activeTab.value);
      break;
  }

  // Sort alphabetically
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

// Comparison functions
const toggleComparisonMode = () => {
  comparisonMode.value = !comparisonMode.value;
  if (!comparisonMode.value) {
    comparisonItems.value.clear();
    showComparisonTable.value = false;
  }
};

const toggleItemComparison = (itemId: string) => {
  if (comparisonItems.value.has(itemId)) {
    comparisonItems.value.delete(itemId);
  } else if (comparisonItems.value.size < MAX_COMPARISON_ITEMS) {
    comparisonItems.value.add(itemId);
  }
};

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
  const { show } = useNotification();

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
    show(t('itemNotFound') || "Item not found", { type: "error", duration: 3000 });
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

/* Tab Navigation */
.shop-tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--myst-bg) 95%, transparent);
  backdrop-filter: blur(10px);
  padding: 16px 0;
  margin-bottom: 24px;
  margin-top: -4px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  overflow: visible;
}

.tabs-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  overflow-y: visible;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--myst-gold) transparent;
}

.tabs-wrapper::-webkit-scrollbar {
  height: 6px;
}

.tabs-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-wrapper::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 3px;
}

.tabs-wrapper::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--myst-gold) 50%, transparent);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: color-mix(in srgb, var(--myst-bg-2) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  border-radius: 8px;
  color: var(--myst-ink);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 70%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.tab-button.active {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border-color: var(--myst-gold);
  color: var(--myst-ink-strong);
  box-shadow: 0 0 12px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.tab-count {
  background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-button.active .tab-count {
  background: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-ink-strong);
}

/* Comparison Toolbar */
.comparison-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.comparison-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 8px;
  color: var(--myst-ink-strong);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comparison-toggle-btn:hover {
  background: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  border-color: var(--myst-gold);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.comparison-info {
  color: var(--myst-ink);
  font-size: 14px;
  font-weight: 500;
}

.compare-now-btn {
  margin-left: auto;
  padding: 10px 20px;
  background: var(--myst-gold);
  border: none;
  border-radius: 8px;
  color: var(--myst-bg);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compare-now-btn:hover {
  background: color-mix(in srgb, var(--myst-gold) 120%, #fff);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myst-gold) 40%, transparent);
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
  .shop-tabs {
    padding: 12px 0;
    margin-bottom: 20px;
  }

  .tabs-wrapper {
    gap: 8px;
  }

  .tab-button {
    padding: 8px 16px;
    font-size: 13px;
  }

  .tab-count {
    font-size: 11px;
    padding: 2px 6px;
  }

  .comparison-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }

  .comparison-info {
    text-align: center;
  }

  .compare-now-btn {
    margin-left: 0;
    width: 100%;
  }

  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .shop-items {
    padding: 16px 0;
  }

  .shop-tabs {
    padding: 10px 0;
    margin-bottom: 16px;
  }

  .tab-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .items-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
