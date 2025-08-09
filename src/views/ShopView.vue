<template>
  <div class="min-h-screen relative">
    <HeaderItem />

    <UnauthorizedMessage v-if="!profile" :message="t('shopLoginRequired')" />

    <main class="shop-main" v-if="profile">
      <div class="shop-container">
        <SectionTitle
          eyebrow="Shop"
          title="Wares of the Evernight"
          subtitle="Clean, elegant, and fair. Your support sustains the city's lamps."
        />

        <!-- Loading state -->
        <div v-if="isShopLoading" class="shop-loading">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">Loading shop...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="shopError" class="shop-error">
          <div class="error-content">
            <i class="fa-solid fa-triangle-exclamation error-icon"></i>
            <h3>Failed to load shop</h3>
            <p>{{ shopError }}</p>
            <button @click="retryLoading" class="retry-btn">
              <i class="fa-solid fa-rotate-right"></i>
              Try Again
            </button>
          </div>
        </div>

        <!-- Profile setup required message -->
        <div v-else-if="!profile.nickname" class="profile-setup-message">
          <div class="setup-content">
            <i class="fa-solid fa-user-gear setup-icon"></i>
            <h2>{{ t("accountSetupRequired") }}</h2>
            <p>{{ t("shopAccessDescription") }}</p>
            <p>{{ t("profileSetupInstructions") }}</p>
            <router-link to="/profile" class="setup-btn">
              <i class="fa-solid fa-arrow-right"></i>
              {{ t("goToProfile") }}
            </router-link>
          </div>
        </div>

        <!-- Shop content -->
        <div v-else class="shop-content">
          <ShopItems />
        </div>

        <ModalItem ref="confirmModal" />
      </div>
    </main>

    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "@/composables/useI18n";
import UnauthorizedMessage from "@/components/ui/UnauthorizedMessage.vue";
import ShopItems from "@/components/shop/ShopItems.vue";
import ModalItem from "@/components/ui/ModalItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";

const userStore = useUserStore();
const authStore = useAuthStore();
const profile = computed(() => userStore.currentUser);
const shopStore = useBalanceStore();
const { t } = useI18n();
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);
const isShopLoading = ref(true);
const shopError = ref<string | null>(null);

// Initialize shop data when component mounts
onMounted(async () => {
  try {
    console.log('ShopView mounted, auth state:', authStore.isAuthenticated);
    
    if (authStore.isAuthenticated) {
      console.log('User authenticated, fetching shop data');
      
      // Wait for services to be fetched if not already loaded
      if (shopStore.items.length === 0) {
        console.log('No items in store, fetching services');
        await shopStore.fetchServices();
      }
      
      // Fetch balance if not already loaded
      if (!shopStore.balance) {
        console.log('No balance in store, fetching balance');
        await shopStore.fetchBalance();
      }
      
      console.log('Shop data loaded:', {
        itemsCount: shopStore.items.length,
        hasBalance: !!shopStore.balance
      });
    } else {
      console.log('User not authenticated, skipping shop data fetch');
    }
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
  
  if (isAuthenticated && shopStore.items.length === 0) {
    console.log('User authenticated and no items, refetching shop data');
    isShopLoading.value = true;
    
    try {
      await Promise.all([
        shopStore.fetchServices(),
        shopStore.fetchBalance()
      ]);
    } catch (error) {
      console.error('Error reloading shop data after auth change:', error);
      shopError.value = error instanceof Error ? error.message : 'Failed to reload shop data';
    } finally {
      isShopLoading.value = false;
    }
  }
}, { immediate: false });

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
        confirmModal.value.showModal(
          `${t("insufficientFundsMessage")} ${amount} Mysterria?`,
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
    }
  },
  { deep: true },
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

.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background-color: #23262c;
  border-radius: 7px;
  margin: 0 auto;
  max-width: 600px;
  padding: 30px;
  text-align: center;
}

.unauthorized-message p {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 20px;
}

.profile-setup-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.setup-content.wide {
  max-width: 100%;
  width: 100%;
  margin: 0;
}
.profile-setup-message.wide {
  padding: 0;
}

.setup-content {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.setup-content:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.setup-icon {
  font-size: 48px;
  color: var(--myst-gold);
  margin-bottom: 24px;
}

.setup-content h2 {
  color: var(--myst-ink-strong);
  font-size: 28px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  font-weight: 600;
  margin-bottom: 20px;
}

.setup-content p {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.setup-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  text-decoration: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.setup-btn:hover {
  background: color-mix(in srgb, var(--myst-gold) 90%, var(--myst-ink));
  transform: translateY(-2px);
  box-shadow: 0 8px 16px color-mix(in srgb, var(--myst-gold) 30%, transparent);
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

  .profile-setup-message {
    min-height: 300px;
    padding: 10px;
  }

  .setup-content {
    padding: 25px;
    border-radius: 10px;
  }

  .setup-icon {
    font-size: 36px;
    margin-bottom: 15px;
  }

  .setup-content h2 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .setup-content p {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .setup-btn {
    padding: 12px 24px;
    font-size: 14px;
    margin-top: 15px;
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
  font-family: "MontserratSemiBold", system-ui, sans-serif;
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
