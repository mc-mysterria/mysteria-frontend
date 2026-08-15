<template>
  <div class="shop-page">
    <HeaderItem/>

    <section class="shop-hero">
      <div class="shop-hero-glow" aria-hidden="true"></div>
      <div class="myst-shell shop-hero-inner">
        <p class="myst-eyebrow">{{ t('shopPage.eyebrow') }}</p>
        <h1 class="myst-h1 shop-title">{{ t('shopPage.title') }}</h1>
        <p class="shop-lede">{{ t('shopPage.lede') }}</p>

        <div v-if="!isShopLoading && !shopError" class="myst-segmented shop-tabs">
          <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="{ active: tab.id === activeTab }"
              type="button"
              @click="activeTab = tab.id"
          >
            {{ tab.label }}<span class="count">{{ tab.count }}</span>
          </button>
        </div>
      </div>
    </section>

    <main class="shop-main myst-shell">
      <!-- Loading -->
      <div v-if="isShopLoading" class="shop-state">
        <div class="state-spinner" aria-hidden="true"></div>
        <p>{{ t('shopLoading') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="shopError" class="shop-state error">
        <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        <h3>{{ t('shopLoadFailed') }}</h3>
        <p>{{ shopError }}</p>
        <button class="myst-btn-outline" type="button" @click="retryLoading">
          <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
          {{ t('tryAgain') }}
        </button>
      </div>

      <template v-else>
        <div class="shop-meta">
          <span class="meta-count">{{ showingLabel }}</span>
          <span class="meta-gift">
            <i class="fa-solid fa-gift" aria-hidden="true"></i>
            {{ t('shopPage.giftable') }}
          </span>
        </div>

        <div v-if="visibleItems.length" class="ware-grid">
          <ShopItemCard
              v-for="(item, index) in visibleItems"
              :key="item.id"
              :image-priority="index < 4 ? 'high' : 'auto'"
              :item="item"
              @purchase="handlePurchase"
          />
        </div>
        <div v-else class="shop-empty">
          <i class="fa-solid fa-box-open" aria-hidden="true"></i>
          <p>{{ t('noItemsFound') }}</p>
        </div>

        <div class="myst-callout fair-play">
          <i class="fa-solid fa-scale-balanced" aria-hidden="true"></i>
          <p><strong>{{ t('shopPage.fairPlayLabel') }}</strong>{{ t('shopPage.fairPlay') }}</p>
        </div>
      </template>

      <!-- Purchase confirmation -->
      <ModalItem ref="confirmModal" :title="t('confirmPurchase')" size="md">
        <PurchaseModalContent
            v-if="selectedItem"
            v-model:amount="purchaseAmount"
            v-model:isGift="isGift"
            v-model:recipientId="recipientId"
            :item="selectedItem"
        />

        <template #footer>
          <button class="myst-btn-outline" @click="cancelPurchase">{{ t('cancel') }}</button>
          <button
              :disabled="isProcessing || insufficientFunds || (isGift && !recipientId)"
              class="myst-btn-gold"
              @click="confirmPurchase"
          >
            <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            {{ t('confirmPurchase') }}
          </button>
        </template>
      </ModalItem>
    </main>

    <FooterItem/>
    <DailyBonusCat page="shop"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import ModalItem from "@/components/ui/ModalItem.vue";
import DailyBonusCat from "@/components/ui/DailyBonusCat.vue";
import ShopItemCard from "@/components/shop/ShopItemCard.vue";
import PurchaseModalContent from "@/components/shop/PurchaseModalContent.vue";
import {useBalanceStore} from "@/stores/balance";
import {useAuthStore} from "@/stores/auth";
import {useUserStore} from "@/stores/user";
import {useI18n} from "@/composables/useI18n";
import {useNotification} from "@/services/useNotification";
import {breadcrumbLd, useSeo} from "@/composables/useSeo";
import Decimal from "decimal.js";

const authStore = useAuthStore();
const userStore = useUserStore();
const shopStore = useBalanceStore();
const {t, currentLanguage} = useI18n();
const {show} = useNotification();

const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);
const isShopLoading = ref(true);
const shopError = ref<string | null>(null);
const activeTab = ref<string>("all");

useSeo(() => ({
  title: t("shopPage.title"),
  description: t("shopPage.lede"),
  path: "/store",
  jsonLd: [breadcrumbLd([{name: "Home", path: "/"}, {name: "Shop", path: "/store"}])],
}));

const purchaseAmount = ref(1);
const isGift = ref(false);
const recipientId = ref("");
const isProcessing = ref(false);

const activeItems = computed(() => shopStore.items.filter(item => item.is_active));

/** Category label, translated when a `shopCategory*` key exists. */
const categoryLabel = (categoryId: string) => {
  const normalized = categoryId
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  const key = `shopCategory${normalized}`;
  const translated = t(key);
  return translated === key ? categoryId : translated;
};

const categories = computed(() => {
  const counts = new Map<string, number>();
  activeItems.value.forEach(item => {
    if (!item.category) return;
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  return [...counts.entries()]
      .map(([id, count]) => ({id, label: categoryLabel(id), count}))
      .sort((a, b) => a.label.localeCompare(b.label));
});

const tabs = computed(() => [
  {id: "all", label: t("shopPage.tabAll"), count: activeItems.value.length},
  ...categories.value,
]);

const visibleItems = computed(() => {
  const items = activeTab.value === "all"
      ? activeItems.value
      : activeItems.value.filter(item => item.category === activeTab.value);
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
});

const showingLabel = computed(() =>
    t("shopPage.showing")
        .replace("{shown}", String(visibleItems.value.length))
        .replace("{total}", String(activeItems.value.length)),
);

/* Fall back to "all" when the active category disappears (e.g. language reload). */
watch(categories, list => {
  if (activeTab.value !== "all" && !list.some(category => category.id === activeTab.value)) {
    activeTab.value = "all";
  }
});

/* ---------------- Purchase flow ---------------- */

const selectedItem = computed(() => {
  if (!shopStore.currentPurchase) return null;
  return shopStore.items.find(item => item.id === shopStore.currentPurchase?.id) || null;
});

const insufficientFunds = computed(() => {
  if (!selectedItem.value || !shopStore.balance) return true;
  const totalPrice = new Decimal(selectedItem.value.price).mul(purchaseAmount.value);
  return shopStore.balance.amount.lessThan(totalPrice);
});

const handlePurchase = (itemId: string) => {
  if (!authStore.isAuthenticated) {
    show(t("shopLoginRequired"), {type: "warn", duration: 5000});
    return;
  }

  const profile = userStore.currentUser;
  if (!profile?.verified || !profile?.nickname) {
    show(t("profileSetupRequired"), {type: "warn", duration: 5000});
    return;
  }

  const item = shopStore.items.find(candidate => candidate.id === itemId);
  if (!item) {
    show(t("itemNotFound"), {type: "error", duration: 3000});
    return;
  }
  if (!item.is_active) {
    show(t("itemNotAvailable"), {type: "warn", duration: 4000});
    return;
  }

  const existingServer = shopStore.currentPurchase?.id === item.id
      ? shopStore.currentPurchase.selectedServer
      : undefined;

  shopStore.currentPurchase = {
    id: item.id,
    price: new Decimal(item.price),
    requiresServerSelection: item.server_availability?.mode === "selectable",
    selectedServer: existingServer,
  };
};

const confirmPurchase = async () => {
  if (!selectedItem.value) return;
  try {
    isProcessing.value = true;
    const success = await shopStore.initiatePurchase(
        selectedItem.value.id,
        purchaseAmount.value,
        isGift.value ? recipientId.value : undefined,
    );
    if (success) {
      shopStore.currentPurchase = null;
      confirmModal.value?.closeModal();
    }
  } catch (error) {
    console.error("Purchase failed:", error);
  } finally {
    isProcessing.value = false;
  }
};

const cancelPurchase = () => {
  shopStore.currentPurchase = null;
  confirmModal.value?.closeModal();
};

watch(
    () => shopStore.currentPurchase,
    async newPurchase => {
      if (newPurchase && confirmModal.value) {
        purchaseAmount.value = 1;
        isGift.value = false;
        recipientId.value = "";
        await shopStore.fetchBalance();
        confirmModal.value.showModal({title: t("confirmPurchase")});
      }
    },
    {deep: true},
);

/* ---------------- Data loading ---------------- */

onMounted(async () => {
  try {
    if (shopStore.items.length === 0) {
      await shopStore.fetchServices(false);
    }
    if (authStore.isAuthenticated && !shopStore.balance) {
      await shopStore.fetchBalance();
    }
  } catch (error) {
    shopError.value = error instanceof Error ? error.message : "Unknown error loading shop";
  } finally {
    isShopLoading.value = false;
  }
});

watch(() => authStore.isAuthenticated, async isAuthenticated => {
  if (!isAuthenticated) return;
  try {
    await shopStore.fetchBalance();
    await shopStore.fetchServices(true);
  } catch (error) {
    console.error("Error reloading shop data after auth change:", error);
  }
});

watch(currentLanguage, async (newLanguage, oldLanguage) => {
  if (!oldLanguage || newLanguage === oldLanguage) return;
  isShopLoading.value = true;
  shopError.value = null;
  try {
    await shopStore.fetchServices(authStore.isAuthenticated);
  } catch (error) {
    shopError.value = error instanceof Error ? error.message : "Failed to reload services";
  } finally {
    isShopLoading.value = false;
  }
});

const retryLoading = async () => {
  shopError.value = null;
  isShopLoading.value = true;
  try {
    await Promise.all([shopStore.fetchServices(), shopStore.fetchBalance()]);
  } catch (error) {
    shopError.value = error instanceof Error ? error.message : "Retry failed";
  } finally {
    isShopLoading.value = false;
  }
};
</script>

<script lang="ts">
export default {name: "ShopView"};
</script>

<style scoped>
.shop-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

/* Hero */
.shop-hero {
  position: relative;
  padding: 80px 24px 0;
  background: linear-gradient(180deg, var(--myst-bg-deep), var(--myst-bg));
  overflow: hidden;
}

.shop-hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 55% 65% at 50% 0%, rgba(200, 178, 115, 0.07), transparent 65%);
}

.shop-hero-inner {
  position: relative;
  text-align: center;
}

.shop-title {
  margin: 16px 0 18px;
}

.shop-lede {
  margin: 0 auto 44px;
  max-width: 62ch;
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.7;
}

/* No backdrop-filter here: the tab bar sits on a flat vertical gradient, so a
   blur of that backdrop is pixel-identical to the backdrop itself — it only
   bought an extra compositing layer. */
.shop-tabs {
  background: rgba(8, 10, 18, 0.72);
}

/* Main */
.shop-main {
  flex: 1 0 auto;
  width: 100%;
  padding: 56px 24px 90px;
}

.shop-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.meta-count,
.meta-gift {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.meta-count {
  letter-spacing: 0.24em;
}

.meta-gift {
  letter-spacing: 0.18em;
}

.meta-gift i {
  margin-right: 7px;
  color: var(--myst-gold);
  font-size: 10px;
}

.ware-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 24px;
  align-items: stretch;
}

.fair-play {
  margin-top: 64px;
}

/* States */
.shop-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 320px;
  color: var(--myst-ink-muted);
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
}

.shop-state.error i {
  color: var(--myst-red);
  font-size: 36px;
}

.shop-state h3 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 22px;
  color: var(--myst-offwhite);
  text-transform: none;
  letter-spacing: normal;
}

.state-spinner {
  width: 34px;
  height: 34px;
  border: 2px solid var(--myst-line-20);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: shopSpin 0.9s linear infinite;
}

@keyframes shopSpin {
  to {
    transform: rotate(360deg);
  }
}

.shop-empty {
  min-height: 280px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  padding: 30px;
  border: 1px dashed var(--myst-line-20);
  color: var(--myst-ink-muted);
  text-align: center;
}

.shop-empty i {
  color: rgba(200, 178, 115, 0.5);
  font-size: 34px;
}

@media (max-width: 700px) {
  .shop-hero {
    padding: 60px 20px 0;
  }

  .shop-main {
    padding: 40px 20px 70px;
  }

  .ware-grid {
    grid-template-columns: 1fr;
  }

  .myst-segmented button {
    padding: 12px 20px;
    font-size: 10.5px;
    letter-spacing: 0.12em;
  }
}
</style>
