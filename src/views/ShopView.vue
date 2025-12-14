<template>
  <div class="min-h-screen relative">
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
            <button @click="retryLoading" class="retry-btn">
              <i class="fa-solid fa-rotate-right"></i>
              {{ t('tryAgain') }}
            </button>
          </div>
        </div>

        <!-- Shop content -->
        <div v-else class="shop-content">
          <ShopItems/>
        </div>

        <ModalItem ref="confirmModal"/>
      </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import {useBalanceStore} from "@/stores/balance";
import {useAuthStore} from "@/stores/auth";
import {useI18n} from "@/composables/useI18n";
import ShopItems from "@/components/shop/ShopItems.vue";
import ModalItem from "@/components/ui/ModalItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";

const authStore = useAuthStore();
const shopStore = useBalanceStore();
const {t, currentLanguage} = useI18n();
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);
const isShopLoading = ref(true);
const shopError = ref<string | null>(null);

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
        await shopStore.fetchBalance();

        if (newPurchase.requiresServerSelection) {
          confirmModal.value.showModal(
              t("selectServerForItem"),
              t("purchase"),
              t("cancel"),
          );
          return;
        }

        if (
            !shopStore.balance ||
            shopStore.balance.amount.lessThan(newPurchase.price)
        ) {
          const amount = Math.ceil(
              Number(newPurchase.price.minus(shopStore.balance?.amount || 0)),
          );
          const currencyName = currentLanguage.value === 'uk' ? 'Марок' : 'Marks';
          confirmModal.value.showModal(
              `${t("insufficientFundsMessage")} ${amount} ${currencyName}?`,
              t("topUp"),
              t("cancel"),
          );
        } else {
          confirmModal.value.showModal(
              t("confirmPurchaseMessage"),
              t("purchase"),
              t("cancel"),
          );
        }
      } else if (confirmModal.value && confirmModal.value.isVisible) {
        // Call the modal's own cancellation/closing logic, which is now safe to use
        // after a successful purchase.
        confirmModal.value.onCancel();
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
/* Basic info wrapper removed - shop simplified */

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
}

.unauthorized-message p {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 20px;
}

.setup-content h2 {
  color: var(--myst-ink-strong);
  font-size: 28px;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 600;
  margin-bottom: 20px;
}

.setup-content p {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.setup-btn i {
  font-size: 14px;
}

/* Mobile basic info styles removed */

@media (max-width: 576px) {
  .shop-container {
    padding: 10px;
    max-width: 100%;
  }

  .shop-content {
    margin-top: 20px;
  }

  .setup-content h2 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .setup-content p {
    font-size: 14px;
    margin-bottom: 12px;
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
</style>
