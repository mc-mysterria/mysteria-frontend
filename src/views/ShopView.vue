<template>
  <div class="shop-view-wrapper">
    <HeaderItem/>

    <main class="shop-main">
      <div class="shop-container">

        <!-- Loading state -->
        <div v-if="isShopLoading" class="shop-loading">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">{{ t('shopLoading') }}</p>
        </div>

        <!-- Error state -->
        <div v-else-if="shopError" class="shop-error">
          <div class="error-content">
            <i class="fa-solid fa-triangle-exclamation error-icon"></i>
            <h3>{{ t('shopLoadFailed') }}</h3>
            <p>{{ shopError }}</p>
            <button class="retry-btn" @click="retryLoading">
              <i class="fa-solid fa-rotate-right"></i>
              {{ t('tryAgain') }}
            </button>
          </div>
        </div>

        <!-- Shop content -->
        <div v-else class="shop-content">
          <CategorySelector
              v-if="!selectedCategory"
              @select-category="handleCategorySelect"
          />
          <ShopItems
              v-else
              :selected-category="selectedCategory"
              @back-to-categories="handleBackToCategories"
          />
        </div>

        <!-- Purchase Confirmation Modal -->
        <ModalItem ref="confirmModal" :title="t('confirmPurchase') || 'Confirm Purchase'" size="md">
          <PurchaseModalContent
              v-if="selectedItem"
              v-model:amount="purchaseAmount"
              v-model:isGift="isGift"
              v-model:recipientId="recipientId"
              :item="selectedItem"
          />

          <template #footer>
            <button class="btn-ritual-secondary" @click="cancelPurchase">
              {{ t('cancel') }}
            </button>
            <button
                :disabled="isProcessing || insufficientFunds || (isGift && !recipientId)"
                class="btn-ritual-primary"
                @click="confirmPurchase"
            >
              <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
              {{ t('confirmPurchase') || 'Confirm Purchase' }}
            </button>
          </template>
        </ModalItem>
      </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import {useBalanceStore} from "@/stores/balance";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "@/composables/useI18n";
import ShopItems from "@/components/shop/ShopItems.vue";
import CategorySelector from "@/components/shop/CategorySelector.vue";
import ModalItem from "@/components/ui/ModalItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import PurchaseModalContent from "@/components/shop/PurchaseModalContent.vue";
import Decimal from "decimal.js";

const authStore = useAuthStore();
const shopStore = useBalanceStore();
const {t, currentLanguage} = useI18n();
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);
const isShopLoading = ref(true);
const shopError = ref<string | null>(null);
const selectedCategory = ref<string | null>(null);

// Purchase state
const purchaseAmount = ref(1);
const isGift = ref(false);
const recipientId = ref('');
const isProcessing = ref(false);

const selectedItem = computed(() => {
  if (!shopStore.currentPurchase) return null;
  return shopStore.items.find(item => item.id === shopStore.currentPurchase?.id) || null;
});

const insufficientFunds = computed(() => {
  if (!selectedItem.value || !shopStore.balance) return true;
  const totalPrice = new Decimal(selectedItem.value.price).mul(purchaseAmount.value);
  return shopStore.balance.amount.lessThan(totalPrice);
});

const handleCategorySelect = (categoryId: string) => {
  selectedCategory.value = categoryId;
};

const handleBackToCategories = () => {
  selectedCategory.value = null;
};

const confirmPurchase = async () => {
  if (!selectedItem.value) return;

  try {
    isProcessing.value = true;
    const success = await shopStore.initiatePurchase(
        selectedItem.value.id,
        purchaseAmount.value,
        isGift.value ? recipientId.value : undefined
    );

    if (success) {
      shopStore.currentPurchase = null;
      confirmModal.value?.closeModal();
    }
  } catch (error) {
    console.error('Purchase failed:', error);
  } finally {
    isProcessing.value = false;
  }
};

const cancelPurchase = () => {
  shopStore.currentPurchase = null;
  confirmModal.value?.closeModal();
};

// Initialize shop data when component mounts
onMounted(async () => {
  try {
    console.log('ShopView mounted, auth state:', authStore.isAuthenticated);

    // Always fetch services (public access)
    if (shopStore.items.length === 0) {
      console.log('No items in store, fetching services');
      await shopStore.fetchServices(false); // false = no auth required
    }

    // Fetch balance only if authenticated
    if (authStore.isAuthenticated && !shopStore.balance) {
      console.log('User authenticated, fetching balance');
      await shopStore.fetchBalance();
    }

    console.log('Shop data loaded:', {
      itemsCount: shopStore.items.length,
      hasBalance: !!shopStore.balance,
      isAuthenticated: authStore.isAuthenticated
    });
  } catch (error) {
    console.error('Error loading shop data:', error);
    shopError.value = error instanceof Error ? error.message : 'Unknown error loading shop';
  } finally {
    isShopLoading.value = false;
  }
});

// Watch for auth state changes and reload data if needed
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  console.log('Auth state changed in ShopView:', isAuthenticated);

  if (isAuthenticated) {
    console.log('User authenticated, fetching balance');

    try {
      // Always fetch balance when user authenticates
      await shopStore.fetchBalance();

      // Re-fetch services with auth to get user-specific data if needed
      await shopStore.fetchServices(true);
    } catch (error) {
      console.error('Error reloading shop data after auth change:', error);
    }
  }
}, {immediate: false});

// Watch for language changes and reload services
watch(currentLanguage, async (newLanguage, oldLanguage) => {
  if (oldLanguage && newLanguage !== oldLanguage) {
    console.log('Language changed, reloading services:', oldLanguage, '->', newLanguage);

    isShopLoading.value = true;
    shopError.value = null;

    try {
      // Re-fetch services with new language
      const requireAuth = authStore.isAuthenticated;
      await shopStore.fetchServices(requireAuth);

      console.log('Services reloaded for language:', newLanguage);
    } catch (error) {
      console.error('Error reloading services after language change:', error);
      shopError.value = error instanceof Error ? error.message : 'Failed to reload services for new language';
    } finally {
      isShopLoading.value = false;
    }
  }
}, {immediate: false});

// Retry loading function
const retryLoading = async () => {
  console.log('Retrying shop data loading');
  shopError.value = null;
  isShopLoading.value = true;

  try {
    await Promise.all([
      shopStore.fetchServices(),
      shopStore.fetchBalance()
    ]);

    console.log('Retry successful, items:', shopStore.items.length);
  } catch (error) {
    console.error('Retry failed:', error);
    shopError.value = error instanceof Error ? error.message : 'Retry failed';
  } finally {
    isShopLoading.value = false;
  }
};

watch(
    () => shopStore.currentPurchase,
    async (newPurchase) => {
      if (newPurchase && confirmModal.value) {
        // Reset local state
        purchaseAmount.value = 1;
        isGift.value = false;
        recipientId.value = '';
        
        await shopStore.fetchBalance();
        confirmModal.value.showModal({
          title: t("confirmPurchase") || "Confirm Purchase"
        });
      }
    },
    {deep: true},
);
</script>

<script lang="ts">
export default {
  name: "ShopView",
};
</script>

<style scoped>
/* Layout wrapper to ensure footer stays at bottom */
.shop-view-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.shop-main {
  flex: 1 0 auto;
  background-color: #111218;
}

.shop-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.shop-content {
  margin-top: 30px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: visible;
}

@media (max-width: 576px) {
  .shop-container {
    padding: 10px;
    max-width: 100%;
  }

  .shop-content {
    margin-top: 20px;
  }
}

/* Loading state styles */
.shop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}

.shop-loading .loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.shop-loading .spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top: 3px solid var(--myst-gold, #4ade80);
  animation: spin 1s linear infinite;
}

.shop-loading .loading-text {
  color: var(--myst-ink-strong);
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

/* Error state styles */
.shop-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 40px;
}

.error-content {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 20px;
}

.error-content h3 {
  color: var(--myst-ink-strong);
  font-size: 24px;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 600;
  margin-bottom: 15px;
}

.error-content p {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Purchase Ritual Footer Buttons */
.btn-ritual-primary {
  padding: 12px 24px;
  background: var(--myst-gold);
  color: #05070a;
  border: none;
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-ritual-primary:hover:not(:disabled) {
  background: #fff;
}

.btn-ritual-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ritual-secondary {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  font-family: 'Playfair Display', serif;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-ritual-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}
</style>
