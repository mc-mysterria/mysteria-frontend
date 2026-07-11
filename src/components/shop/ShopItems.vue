<template>
  <div class="shop-items">
    <div v-if="selectedCategory" class="catalog-toolbar">
      <button class="back-button" @click="emit('back-to-categories')">
        <i class="fa-solid fa-arrow-left"></i>
        {{ t('backToCategories') }}
      </button>
      <div class="category-context">
        <span>{{ selectedCategory }}</span>
        <small>{{ filteredItems.length }} {{ t('itemsCount') || 'items' }}</small>
      </div>
    </div>

    <TransitionGroup v-if="filteredItems.length" name="catalog" tag="div" class="items-grid">
      <ShopItemCard
          v-for="(item, index) in filteredItems"
          :key="item.id"
          :item="item"
          :image-priority="index < 4 ? 'high' : 'auto'"
          class="shop-item-card"
          @purchase="handlePurchase"
      />
    </TransitionGroup>
    <div v-else class="empty-state">
      <i class="fa-solid fa-box-open"></i>
      <p>{{ t('noItemsFound') || 'No items are available in this category yet.' }}</p>
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
  return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
});

const resolveImagePath = (path?: string) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
  if (path.startsWith('@/assets/')) return new URL(path.replace('@/assets/', '/src/assets/'), import.meta.url).href;
  if (path.startsWith('src/')) return new URL(`/${path}`, import.meta.url).href;
  return path;
};

watch(filteredItems, (visibleItems) => {
  visibleItems.forEach(item => {
    const src = resolveImagePath(item.image);
    if (!src) return;
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
}, {immediate: true});

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
  padding: 20px 0 48px;
  overflow: visible;
}

/* Back to Categories Button */
.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 8px 0 28px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, .07);
}

.category-context {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  text-align: right;
}

.category-context span {
  max-width: 55vw;
  overflow: hidden;
  color: var(--myst-offwhite);
  font: 700 22px/1.2 'Playfair Display', serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-context small {
  color: #767c8c;
  font: 600 10px 'JetBrains Mono', monospace;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 17px;
  background: rgba(255, 255, 255, .035);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 9px;
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
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}

.shop-item-card {
  min-width: 0;
}

.catalog-enter-active, .catalog-leave-active {
  transition: opacity .3s ease, transform .3s ease;
}

.catalog-enter-from, .catalog-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.empty-state {
  min-height: 280px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  padding: 30px;
  border: 1px dashed rgba(200, 178, 115, .2);
  border-radius: 14px;
  color: #777d8c;
  text-align: center;
}

.empty-state i {
  color: rgba(200, 178, 115, .5);
  font-size: 34px;
}

.empty-state p {
  margin: 0;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .catalog-toolbar {
    margin: 4px 0 20px;
    gap: 12px;
    padding-bottom: 14px;
  }

  .back-button {
    padding: 10px 16px;
    font-size: 13px;
    flex: 0 0 44px;
    width: 44px;
    padding: 0;
    justify-content: center;
  }

  .back-button {
    font-size: 0;
  }

  .back-button i {
    font-size: 14px;
  }

  .category-context span {
    font-size: 19px;
  }

  .back-button:hover {
    transform: translateY(-2px);
  }

  .back-button:hover i {
    transform: translateX(0);
  }
}
</style>
