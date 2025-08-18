<template>
  <div class="shop-items">
    <div v-for="category in categories" :key="category.type" class="category-section">
      <div v-if="category.items.length > 0" class="category-header">
        <h3 class="category-title">{{ getCategoryTitle(category.type) }}</h3>
        <p class="category-description">{{ getCategoryDescription(category.type) }}</p>
      </div>
      
      <div v-if="category.items.length > 0" class="items-grid">
        <ShopItemCard
          v-for="item in category.items"
          :key="item.id"
          :item="item"
          :class="[
            'shop-item-card',
            { 'item-visible': visibleItems.includes(item.originalIndex) },
          ]"
          :style="{ '--animation-delay': `${item.originalIndex * 0.1}s` }"
          @purchase="handlePurchase"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import { useNotification } from "@/services/useNotification";
import { useI18n } from "@/composables/useI18n";
import ShopItemCard from "./ShopItemCard.vue";
import Decimal from "decimal.js";
import type { ServiceResponse } from "@/types/services";
import { ServiceType } from "@/types/services";

const shopStore = useBalanceStore();
const userStore = useUserStore();
const authStore = useAuthStore();
const { t } = useI18n();
const items = computed(() => shopStore.items);
const visibleItems = ref<number[]>([]);
const profile = computed(() => userStore.currentUser);

interface CategoryItem extends ServiceResponse {
  originalIndex: number;
}

const categories = computed(() => {
  const categoryMap = new Map<ServiceType, CategoryItem[]>();
  
  // Initialize categories in desired order
  const categoryOrder: ServiceType[] = [
    ServiceType.ITEM,
    ServiceType.PERMISSION, 
    ServiceType.SUBSCRIPTION,
    ServiceType.DISCORD_ROLE
  ];
  
  categoryOrder.forEach(type => {
    categoryMap.set(type, []);
  });
  
  // Distribute items into categories
  items.value.forEach((item, index) => {
    const categoryItems = categoryMap.get(item.type);
    if (categoryItems) {
      categoryItems.push({ ...item, originalIndex: index });
    } else {
      // Handle unknown types by adding them to a default category
      if (!categoryMap.has(item.type)) {
        categoryMap.set(item.type, []);
      }
      categoryMap.get(item.type)!.push({ ...item, originalIndex: index });
    }
  });
  
  // Convert to array format for template
  return Array.from(categoryMap.entries()).map(([type, items]) => ({
    type,
    items: items.sort((a, b) => a.name.localeCompare(b.name))
  }));
});

const getCategoryTitle = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.ITEM:
      return t('shopCategoryItems') || 'Items';
    case ServiceType.PERMISSION:
      return t('shopCategoryPermissions') || 'Permissions';
    case ServiceType.SUBSCRIPTION:
      return t('shopCategorySubscriptions') || 'Subscriptions';
    case ServiceType.DISCORD_ROLE:
      return t('shopCategoryDiscordRoles') || 'Discord Roles';
    default:
      return t('shopCategoryOther') || 'Other';
  }
};

const getCategoryDescription = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.ITEM:
      return t('shopCategoryItemsDesc') || 'In-game items and equipment';
    case ServiceType.PERMISSION:
      return t('shopCategoryPermissionsDesc') || 'Special permissions and abilities';
    case ServiceType.SUBSCRIPTION:
      return t('shopCategorySubscriptionsDesc') || 'Recurring premium services';
    case ServiceType.DISCORD_ROLE:
      return t('shopCategoryDiscordRolesDesc') || 'Discord server roles and benefits';
    default:
      return t('shopCategoryOtherDesc') || 'Miscellaneous services';
  }
};

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

  // Find item across all categories
  let item: ServiceResponse | undefined;
  for (const category of categories.value) {
    item = category.items.find((item) => item.id === itemId);
    if (item) break;
  }

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

const animateItems = () => {
  visibleItems.value = [];
  
  let delay = 0;
  categories.value.forEach((category) => {
    category.items.forEach((item) => {
      setTimeout(() => {
        visibleItems.value.push(item.originalIndex);
      }, delay * 67);
      delay++;
    });
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

.category-section {
  margin-bottom: 48px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid color-mix(in srgb, var(--myst-gold, #4ade80) 20%, transparent);
}

.category-title {
  color: var(--myst-ink-strong);
  font-size: 28px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  font-weight: 600;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--myst-gold, #4ade80), var(--myst-ink-strong));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-description {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.8;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 0;
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

@media (max-width: 768px) {
  .category-section {
    margin-bottom: 36px;
  }
  
  .category-title {
    font-size: 24px;
  }
  
  .category-description {
    font-size: 14px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 576px) {
  .category-section {
    margin-bottom: 32px;
  }
  
  .category-header {
    margin-bottom: 20px;
    padding-bottom: 12px;
  }
  
  .category-title {
    font-size: 22px;
    margin-bottom: 6px;
  }
  
  .category-description {
    font-size: 13px;
  }
  
  .items-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 0;
  }
}
</style>
