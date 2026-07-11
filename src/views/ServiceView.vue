<template>
  <div class="service-page">
    <HeaderItem/>
    <main class="service-detail-container">
      <div v-if="service" class="service-layout">
        <div class="back-button-container">
          <button class="back-button" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            {{ t('back') }}
          </button>
        </div>

        <section class="service-hero">
          <div class="service-image-wrapper" :class="{ loaded: imageLoaded, failed: imageFailed }">
            <div class="service-image-placeholder" aria-hidden="true">
              <i class="fa-solid fa-key"></i>
            </div>
            <img
                v-if="service.imageUrl && !imageFailed"
                :alt="service.name"
                :src="service.imageUrl"
                class="service-image"
                fetchpriority="high"
                loading="eager"
                decoding="async"
                @load="imageLoaded = true"
                @error="imageFailed = true"
            />
          </div>
          <div class="service-title-section">
            <span class="service-eyebrow">{{ getTypeLabel(service.type) }}</span>
            <h1 class="service-title">{{ service.name }}</h1>
            <div class="service-meta">
              <span v-if="service.isSubscription" class="service-subscription">{{ t('subscription') }}</span>
              <span v-if="service.isGiftable" class="service-feature giftable">
                <i class="fa-solid fa-gift"></i>
                {{ t('giftable') || 'Giftable' }}
              </span>
              <span v-if="service.isBulkable" class="service-feature bulkable">
                <i class="fa-solid fa-layer-group"></i>
                {{ t('bulkPurchase') || 'Bulk' }}
              </span>
            </div>

            <div class="purchase-panel">
              <div class="purchase-price">
                <span>{{ t('price') || 'Price' }}</span>
                <strong>{{ formattedPrice }}</strong>
              </div>
              <button
                  :class="{ purchasing }"
                  :disabled="!authStore.isAuthenticated || purchasing"
                  class="purchase-btn"
                  @click="openPurchaseModal"
              >
                <i v-if="purchasing" class="fa-solid fa-spinner fa-spin"></i>
                <i v-else class="fa-solid fa-bag-shopping"></i>
                {{ purchasing ? t('processing') : t('purchase') }}
              </button>
              <p v-if="!authStore.isAuthenticated" class="auth-notice">
                <i class="fa-solid fa-lock"></i>{{ t('loginToPurchase') }}
              </p>
            </div>
          </div>
        </section>

        <article class="service-content-card">
          <div class="content-label"><span></span>{{ t('details') || 'Details' }}<span></span></div>
          <div v-if="renderedContent" v-dompurify-html="renderedContent" class="service-content"></div>
          <p v-else class="content-empty">{{ t('serviceContentNotCreated') }}</p>
        </article>
      </div>

      <div v-else-if="loading" class="service-loading">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <p class="loading-text">{{ t('loadingService') }}</p>
      </div>

      <div v-else class="service-error">
        <div class="error-content">
          <i class="fa-solid fa-triangle-exclamation error-icon"></i>
          <h3>{{ t('serviceNotFound') || 'Service Not Found' }}</h3>
          <p>{{ t('serviceNotFoundMessage') || 'This service content is not available yet or has been moved.' }}</p>
          <p class="error-details">
            {{
              t('serviceContentNotCreated') || 'The detailed description for this service has not been created yet. You can still purchase it from the shop page.'
            }}
          </p>
          <div class="error-actions">
            <router-link class="back-to-shop-btn" to="/store">
              <i class="fa-solid fa-arrow-left"></i>
              {{ t('backToShop') || 'Back to Shop' }}
            </router-link>
          </div>
        </div>
      </div>
    </main>
    <FooterItem/>

    <!-- Purchase Confirmation Modal -->
    <ModalItem ref="confirmModal" :title="t('confirmPurchase') || 'Confirm Purchase'" size="md">
      <PurchaseModalContent
          v-if="service"
          v-model:amount="purchaseAmount"
          v-model:isGift="isGift"
          v-model:recipientId="recipientId"
          :item="service"
      />

      <template #footer>
        <button class="btn-ritual-secondary" @click="confirmModal?.closeModal()">
          {{ t('cancel') }}
        </button>
        <button
          :disabled="purchasing || insufficientFunds || (isGift && !recipientId)"
          class="btn-ritual-primary"
          @click="confirmPurchase"
        >
          <i v-if="purchasing" class="fa-solid fa-spinner fa-spin"></i>
          {{ t('confirmPurchase') || 'Confirm Purchase' }}
        </button>
      </template>
    </ModalItem>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {shopAPI} from '@/utils/api/shop';
import type {ServiceMarkdownDto} from '@/types/services';
import {ServiceType} from '@/types/services';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useI18n} from '@/composables/useI18n';
import {useAuthStore} from '@/stores/auth';
import {useBalanceStore} from '@/stores/balance';
import {useUserStore} from '@/stores/user';
import {useNotification} from '@/services/useNotification';
import {useCurrency} from '@/composables/useCurrency';
import ModalItem from '@/components/ui/ModalItem.vue';
import PurchaseModalContent from '@/components/shop/PurchaseModalContent.vue';
import MarkdownIt from 'markdown-it';
import Decimal from 'decimal.js';

const route = useRoute();
const router = useRouter();
const service = ref<ServiceMarkdownDto | null>(null);
const loading = ref(true);
const purchasing = ref(false);
const {t, currentLanguage} = useI18n();
const {formatCurrency, currentCurrency} = useCurrency();
const authStore = useAuthStore();
const balanceStore = useBalanceStore();
const userStore = useUserStore();
const {show} = useNotification();
const profile = computed(() => userStore.currentUser);
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);

// Purchase state
const purchaseAmount = ref(1);
const isGift = ref(false);
const recipientId = ref('');
const imageLoaded = ref(false);
const imageFailed = ref(false);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const renderedContent = computed(() => {
  if (!service.value?.markdownContent) return '';
  return md.render(service.value.markdownContent);
});

const formattedPrice = computed(() => {
  if (!service.value) return '';
  if (currentCurrency.value === 'POINTS') {
    return `${service.value.price} ${t('marks')}`;
  }
  return formatCurrency(service.value.price);
});

const totalPrice = computed(() => {
  if (!service.value) return new Decimal(0);
  return new Decimal(service.value.price).mul(purchaseAmount.value);
});

const insufficientFunds = computed(() => {
  if (!balanceStore.currentBalance) return true;
  return balanceStore.currentBalance.amount.lessThan(totalPrice.value);
});

const getTypeLabel = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.ITEM:
      return t('serviceTypeItem') || 'Item';
    case ServiceType.PERMISSION:
      return t('serviceTypePermission') || 'Permission';
    case ServiceType.SUBSCRIPTION:
      return t('serviceTypeSubscription') || 'Subscription';
    case ServiceType.DISCORD_ROLE:
      return t('serviceTypeDiscordRole') || 'Discord Role';
    default:
      return type;
  }
};

const goBack = () => {
  router.push('/store');
};

const openPurchaseModal = async () => {
  if (!service.value || !authStore.isAuthenticated) {
    show(
        t('shopLoginRequired') || 'Log in to your account to access the Shop!',
        {type: 'warn', duration: 5000}
    );
    return;
  }

  // Check if account is verified (has nickname) before allowing purchase
  if (!profile.value?.verified || !profile.value?.nickname) {
    show(
        t('profileSetupRequired') || 'Please verify your account and set up your profile to make purchases',
        {
          type: 'warn',
          duration: 5000,
        }
    );
    return;
  }

  // Reset modal state
  purchaseAmount.value = 1;
  isGift.value = false;
  recipientId.value = '';
  
  await balanceStore.fetchBalance();
  confirmModal.value?.showModal({
    title: t('confirmPurchase') || 'Confirm Purchase'
  });
};

const confirmPurchase = async () => {
  if (!service.value) return;

  try {
    purchasing.value = true;
    const success = await balanceStore.initiatePurchase(
      service.value.id.toString(),
      purchaseAmount.value,
      isGift.value ? recipientId.value : undefined
    );

    if (success) {
      confirmModal.value?.closeModal();
    }
  } catch (error) {
    show(t('purchaseError') || 'Failed to complete purchase', {type: 'error'});
  } finally {
    purchasing.value = false;
  }
};

const loadService = async () => {
  const slug = route.params.slug as string;

  if (slug) {
    try {
      loading.value = true;
      console.log('Loading service with slug:', slug);

      const response = await shopAPI.getServiceContent(slug, currentLanguage.value);
      service.value = response.data;
      imageLoaded.value = false;
      imageFailed.value = false;
      if (service.value.imageUrl) {
        const image = new Image();
        image.decoding = 'async';
        image.src = service.value.imageUrl;
      }
      console.log('Service loaded successfully:', service.value);
    } catch (error) {
      console.error('Failed to load service:', error);
      service.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
};

// Watch for route changes to handle navigation between services
watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    // Immediately scroll to top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    await loadService();

    // Scroll again after content loads
    await nextTick();
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}, {immediate: false});

onMounted(async () => {
  // Ensure scroll to top happens immediately
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);

  await loadService();

  // Scroll again after content loads
  await nextTick();
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
});
</script>

<script lang="ts">
export default {
  name: "ServiceView",
};
</script>

<style scoped>
/* Page layout with sticky footer */
.service-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--myst-bg);
}

.service-detail-container {
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 120px 16px 40px 16px; /* Increased top padding to prevent header overlap */
  width: 100%;
}

.back-button-container {
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--myst-bg-2);
  color: var(--myst-ink);
  border: 1px solid var(--myst-ink-muted);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.back-button:hover {
  background: var(--myst-ink-muted);
  color: var(--myst-bg);
  transform: translateX(-2px);
}

/* Service header */
.service-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  align-items: flex-start;
}

.service-image-wrapper {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--myst-bg-2);
  border: 2px solid var(--myst-ink-muted);
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.service-title-section {
  flex: 1;
}

.service-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--myst-ink-strong);
  line-height: 1.2;
  background: linear-gradient(135deg, var(--myst-gold), var(--myst-ink-strong));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.service-meta {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.service-type,
.service-price,
.service-subscription {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.service-type {
  background: var(--myst-bg-2);
  color: var(--myst-ink-muted);
  border: 1px solid var(--myst-ink-muted);
}

.service-price {
  background: linear-gradient(135deg, var(--myst-gold), var(--myst-gold-soft));
  color: var(--myst-bg);
}

.service-subscription {
  background: #10b981;
  color: white;
}

.service-feature {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.service-feature.giftable {
  background: color-mix(in srgb, #10b981 20%, transparent);
  color: #10b981;
  border: 1px solid #10b981;
}

.service-feature.bulkable {
  background: color-mix(in srgb, #3b82f6 20%, transparent);
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.service-feature i {
  font-size: 0.75rem;
}

/* Service content */
.service-content {
  line-height: 1.75;
  color: var(--myst-ink);
  margin-bottom: 40px;
}

/* Content styling (same as NewsView) */
.service-content :deep(h1),
.service-content :deep(h2),
.service-content :deep(h3),
.service-content :deep(h4),
.service-content :deep(h5),
.service-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.service-content :deep(h1) {
  font-size: 2.25rem;
  color: var(--myst-gold);
}

.service-content :deep(h2) {
  font-size: 1.875rem;
}

.service-content :deep(h3) {
  font-size: 1.5rem;
}

.service-content :deep(p) {
  margin-bottom: 1.5rem;
  color: var(--myst-ink);
}

.service-content :deep(strong) {
  color: var(--myst-ink-strong);
  font-weight: 600;
}

.service-content :deep(ul),
.service-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  color: var(--myst-ink);
}

.service-content :deep(li) {
  margin-bottom: 0.5rem;
}

.service-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--myst-gold);
  background-color: var(--myst-bg-2);
  font-style: italic;
  color: var(--myst-ink-muted);
}

.service-content :deep(code) {
  background-color: var(--myst-bg-2);
  color: var(--myst-gold);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid var(--myst-ink-muted);
}

.service-content :deep(pre) {
  background-color: var(--myst-bg-2);
  color: var(--myst-ink);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--myst-ink-muted);
}

/* Service actions */
.service-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 30px;
  background: var(--myst-bg-2);
  border-radius: 16px;
  border: 1px solid var(--myst-ink-muted);
}

.purchase-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--myst-gold), var(--myst-gold-soft));
  color: var(--myst-bg);
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  justify-content: center;
}

.purchase-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(74, 222, 128, 0.4);
}

.purchase-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.purchase-btn.purchasing {
  background: var(--myst-ink-muted);
}

.auth-notice {
  color: var(--myst-ink-muted);
  font-size: 14px;
  text-align: center;
  margin: 0;
}

.back-to-shop-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-to-shop-btn:hover {
  background: var(--myst-gold-soft);
  transform: translateY(-2px);
}

/* Loading and error states */
.service-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top: 3px solid var(--myst-gold);
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--myst-ink-strong);
  font-size: 16px;
  font-weight: 500;
  opacity: 0.8;
}

.service-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
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
}

.error-icon {
  font-size: 48px;
  color: #ef4444;
  margin-bottom: 20px;
}

.error-content h3 {
  color: var(--myst-ink-strong);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 15px;
}

.error-content p {
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.error-details {
  font-size: 14px;
  opacity: 0.8;
}

.error-actions {
  margin-top: 25px;
  display: flex;
  justify-content: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Purchase Ritual Modal Styles */
.purchase-ritual-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.purchase-item-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.item-name {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #fff;
  margin: 0 0 4px 0;
}

.item-price-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
}

.ritual-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ritual-label {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ritual-checkbox-field {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.ritual-checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(200, 178, 115, 0.3);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--myst-gold);
  font-size: 12px;
  transition: all 0.3s;
}

.ritual-checkbox.active {
  background: rgba(200, 178, 115, 0.1);
  border-color: var(--myst-gold);
}

.ritual-label-inline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #aaa;
}

.amount-stepper {
  display: flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: 4px;
}

.step-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.step-btn:hover {
  background: var(--myst-gold);
  color: #000;
}

.amount-input {
  width: 60px;
  height: 32px;
  background: transparent;
  border: none;
  color: #fff;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
}

.amount-input::-webkit-inner-spin-button,
.amount-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.total-ritual-price {
  margin-top: 8px;
  padding: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: #888;
}

.total-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-gold);
}

.insufficient-funds-warning {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
  color: #f87171;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

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

/* Responsive design */
@media (max-width: 768px) {
  .service-detail-container {
    padding: 100px 16px 20px 16px;
  }

  .service-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .service-image-wrapper {
    align-self: center;
    width: 150px;
    height: 150px;
  }

  .service-title {
    font-size: 2rem;
  }

  .service-meta {
    justify-content: center;
  }

  .service-content :deep(h1) {
    font-size: 1.875rem;
  }

  .service-content :deep(h2) {
    font-size: 1.5rem;
  }

  .purchase-btn {
    font-size: 16px;
    padding: 14px 28px;
    min-width: 180px;
  }
}

@media (max-width: 576px) {
  .service-header {
    gap: 16px;
  }

  .service-image-wrapper {
    width: 120px;
    height: 120px;
  }

  .service-title {
    font-size: 1.75rem;
  }

  .service-meta {
    flex-direction: column;
    gap: 10px;
  }

  .service-actions {
    padding: 20px;
  }

  .purchase-btn {
    width: 100%;
    font-size: 16px;
    padding: 12px 20px;
  }
}

/* Modern product detail composition */
.service-page {
  background:
    radial-gradient(circle at 78% 12%, rgba(200, 178, 115, 0.07), transparent 28rem),
    linear-gradient(180deg, #111218, #090b13 70%);
}

.service-detail-container {
  max-width: 1180px;
  padding: 110px 24px 72px;
}

.back-button-container { margin-bottom: 22px; }
.back-button {
  min-height: 44px;
  padding: 0 16px;
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.035);
  color: #b9bdc8;
  backdrop-filter: blur(10px);
}
.back-button:hover { border-color: rgba(200, 178, 115, 0.38); background: rgba(200, 178, 115, 0.08); color: var(--myst-gold); }
.back-button:focus-visible, .purchase-btn:focus-visible { outline: 2px solid var(--myst-gold); outline-offset: 3px; }

.service-hero {
  display: grid;
  grid-template-columns: minmax(320px, 1.08fr) minmax(340px, 0.92fr);
  min-height: 470px;
  overflow: hidden;
  border: 1px solid rgba(200, 178, 115, 0.18);
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(24, 28, 47, 0.94), rgba(10, 12, 23, 0.98));
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.34);
}

.service-image-wrapper {
  position: relative;
  width: auto;
  height: auto;
  min-height: 470px;
  border: 0;
  border-radius: 0;
  background: linear-gradient(110deg, #111525 30%, #20263d 45%, #111525 60%);
  background-size: 250% 100%;
  animation: serviceShimmer 1.6s linear infinite;
}
.service-image-placeholder { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(200, 178, 115, 0.28); font-size: 58px; }
.service-image-wrapper.loaded, .service-image-wrapper.failed { animation: none; background: #111525; }
.service-image { position: absolute; inset: 0; opacity: 0; filter: saturate(0.88) contrast(1.05); transition: opacity 0.5s ease; }
.service-image-wrapper.loaded .service-image { opacity: 1; }
.service-image-wrapper::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 58%, rgba(10, 12, 23, 0.3)), linear-gradient(0deg, rgba(5, 7, 14, 0.42), transparent 50%); pointer-events: none; }

.service-title-section { display: flex; flex-direction: column; justify-content: center; min-width: 0; padding: clamp(30px, 5vw, 58px); }
.service-eyebrow { margin-bottom: 13px; color: var(--myst-gold); font: 700 11px/1 'JetBrains Mono', monospace; letter-spacing: 2.4px; text-transform: uppercase; }
.service-title { margin: 0; color: var(--myst-offwhite); font: 700 clamp(36px, 5vw, 58px)/1.04 'Playfair Display', serif; background: none; -webkit-text-fill-color: initial; overflow-wrap: anywhere; }
.service-meta { gap: 9px; margin: 22px 0 0; }
.service-feature, .service-subscription { padding: 7px 10px; border-radius: 7px; font: 600 11px 'JetBrains Mono', monospace; }
.service-feature.giftable, .service-feature.bulkable { border-color: rgba(200, 178, 115, 0.23); background: rgba(200, 178, 115, 0.07); color: #d8cba9; }

.purchase-panel { margin-top: 34px; padding-top: 26px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
.purchase-price { display: flex; align-items: flex-end; justify-content: space-between; gap: 18px; margin-bottom: 16px; }
.purchase-price span { color: #777e8e; font: 600 10px 'JetBrains Mono', monospace; letter-spacing: 1.5px; text-transform: uppercase; }
.purchase-price strong { color: var(--myst-gold); font: 800 clamp(24px, 3vw, 32px)/1 'JetBrains Mono', monospace; text-align: right; }
.purchase-btn { width: 100%; min-height: 52px; padding: 0 24px; border: 1px solid var(--myst-gold); border-radius: 10px; background: var(--myst-gold); color: #10121a; font: 800 12px 'JetBrains Mono', monospace; letter-spacing: 1.3px; text-transform: uppercase; }
.purchase-btn:hover:not(:disabled) { background: #eee4c6; box-shadow: 0 10px 30px rgba(200, 178, 115, 0.2); }
.purchase-btn:disabled { border-color: rgba(255, 255, 255, 0.11); background: rgba(255, 255, 255, 0.06); color: #777d8b; }
.auth-notice { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 12px 0 0; color: #767c8b; font-size: 12px; }

.service-content-card { margin-top: 28px; padding: clamp(24px, 5vw, 58px); border: 1px solid rgba(255, 255, 255, 0.075); border-radius: 18px; background: rgba(16, 19, 32, 0.76); box-shadow: 0 20px 55px rgba(0, 0, 0, 0.2); }
.content-label { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; color: var(--myst-gold); font: 700 10px 'JetBrains Mono', monospace; letter-spacing: 2px; text-transform: uppercase; }
.content-label span { height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(200, 178, 115, 0.3)); }
.content-label span:last-child { transform: scaleX(-1); }
.service-content { max-width: 780px; margin: 0 auto; color: #b9bdc7; font-size: 16px; line-height: 1.82; }
.service-content :deep(h1), .service-content :deep(h2), .service-content :deep(h3) { font-family: 'Playfair Display', serif; line-height: 1.25; }
.service-content :deep(h2) { padding-bottom: 10px; border-bottom: 1px solid rgba(200, 178, 115, 0.14); color: var(--myst-offwhite); }
.service-content :deep(a) { color: var(--myst-gold); text-underline-offset: 3px; }
.service-content :deep(img) { display: block; max-width: 100%; height: auto; margin: 26px auto; border-radius: 12px; }
.service-content :deep(table) { display: block; width: 100%; overflow-x: auto; border-collapse: collapse; }
.service-content :deep(th), .service-content :deep(td) { padding: 10px 12px; border: 1px solid rgba(255, 255, 255, 0.1); }
.content-empty { margin: 0; color: #777d8b; text-align: center; }

@keyframes serviceShimmer { to { background-position: -250% 0; } }

@media (max-width: 800px) {
  .service-detail-container { padding: 96px 16px 48px; }
  .service-hero { grid-template-columns: 1fr; min-height: 0; }
  .service-image-wrapper { min-height: 0; aspect-ratio: 16 / 10; }
  .service-image-wrapper::after { background: linear-gradient(0deg, rgba(10, 12, 23, 0.55), transparent 45%); }
  .service-title-section { padding: 28px; text-align: left; }
  .service-meta { justify-content: flex-start; flex-direction: row; }
}

@media (max-width: 520px) {
  .service-detail-container { padding-inline: 10px; }
  .back-button { width: 44px; padding: 0; justify-content: center; font-size: 0; }
  .back-button i { font-size: 14px; }
  .service-hero, .service-content-card { border-radius: 13px; }
  .service-image-wrapper { width: auto; height: auto; aspect-ratio: 4 / 3; }
  .service-title-section { padding: 22px 18px; }
  .service-title { font-size: 34px; }
  .purchase-panel { margin-top: 25px; padding-top: 20px; }
  .service-content-card { margin-top: 16px; padding: 25px 18px; }
  .content-label { margin-bottom: 24px; }
  .service-content { font-size: 15px; line-height: 1.72; }
}

@media (prefers-reduced-motion: reduce) {
  .service-image-wrapper { animation: none; }
  .service-image, .back-button, .purchase-btn { transition: none; }
}
</style>
