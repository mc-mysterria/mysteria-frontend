<template>
  <div class="service-page">
    <HeaderItem />
    <main class="service-detail-container">
      <div v-if="service">
        <!-- Back Button -->
        <div class="back-button-container">
          <button @click="goBack" class="back-button">
            <i class="fa-solid fa-arrow-left"></i>
            {{ t('back') }}
          </button>
        </div>
        
        <div class="service-header">
          <div class="service-image-wrapper" v-if="service.imageUrl">
            <img 
              :src="service.imageUrl" 
              :alt="service.name"
              class="service-image"
            />
          </div>
          <div class="service-title-section">
            <h1 class="service-title">{{ service.name }}</h1>
            <div class="service-meta">
              <span class="service-type">{{ getTypeLabel(service.type) }}</span>
              <span class="service-price">{{ service.price }} Mysterria</span>
              <span v-if="service.isSubscription" class="service-subscription">{{ t('subscription') }}</span>
            </div>
          </div>
        </div>
        
        <div class="service-content" v-dompurify-html="renderedContent"></div>
        
        <div class="service-actions">
          <button 
            @click="handlePurchase" 
            class="purchase-btn"
            :disabled="!authStore.isAuthenticated || purchasing"
            :class="{ 'purchasing': purchasing }"
          >
            <i v-if="purchasing" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-shopping-cart"></i>
            {{ purchasing ? t('processing') : t('purchase') }}
          </button>
          
          <p v-if="!authStore.isAuthenticated" class="auth-notice">
            {{ t('loginToPurchase') }}
          </p>
        </div>
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
            {{ t('serviceContentNotCreated') || 'The detailed information for this service has not been created yet.' }}
          </p>
          <router-link to="/store" class="back-to-shop-btn">
            <i class="fa-solid fa-arrow-left"></i>
            {{ t('backToShop') || 'Back to Shop' }}
          </router-link>
        </div>
      </div>
    </main>
    <FooterItem />
    
    <!-- Confirmation Modal -->
    <ModalItem ref="confirmModal" @confirm="confirmPurchase" @cancel="cancelPurchase" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { shopAPI } from '@/utils/api/shop';
import type { ServiceMarkdownDto } from '@/types/services';
import { ServiceType } from '@/types/services';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import { useI18n } from '@/composables/useI18n';
import { useAuthStore } from '@/stores/auth';
import { useBalanceStore } from '@/stores/balance';
import { useUserStore } from '@/stores/user';
import { useNotification } from '@/services/useNotification';
import ModalItem from '@/components/ui/ModalItem.vue';
import MarkdownIt from 'markdown-it';
import Decimal from 'decimal.js';

const route = useRoute();
const router = useRouter();
const service = ref<ServiceMarkdownDto | null>(null);
const loading = ref(true);
const purchasing = ref(false);
const { t, currentLanguage } = useI18n();
const authStore = useAuthStore();
const shopStore = useBalanceStore();
const userStore = useUserStore();
const { show } = useNotification();
const profile = computed(() => userStore.currentUser);
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);
const pendingPurchase = ref<{serviceId: number, price: number} | null>(null);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const renderedContent = computed(() => {
  if (!service.value?.markdownContent) return '';
  return md.render(service.value.markdownContent);
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

const handlePurchase = async () => {
  if (!service.value || !authStore.isAuthenticated) {
    show(
      t('shopLoginRequired') || 'Log in to your account to access the Shop!',
      { type: 'warn', duration: 5000 }
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
  
  try {
    // Fetch latest balance
    await shopStore.fetchBalance();
    
    const servicePrice = new Decimal(service.value.price);
    
    // Store pending purchase info
    pendingPurchase.value = {
      serviceId: service.value.id,
      price: service.value.price
    };
    
    if (!shopStore.balance || shopStore.balance.amount.lessThan(servicePrice)) {
      const missingAmount = Math.ceil(
        Number(servicePrice.minus(shopStore.balance?.amount || 0))
      );
      confirmModal.value?.showModal(
        `${t('insufficientFundsMessage')} ${missingAmount} Mysterria?`,
        t('topUp'),
        t('cancel')
      );
    } else {
      confirmModal.value?.showModal(
        t('confirmPurchaseMessage'),
        t('purchase'),
        t('cancel')
      );
    }
    
  } catch (error) {
    show(t('purchaseError') || 'Failed to prepare purchase', { type: 'error' });
  }
};

const confirmPurchase = async () => {
  if (!pendingPurchase.value) return;
  
  purchasing.value = true;
  
  try {
    const servicePrice = new Decimal(pendingPurchase.value.price);
    
    // Check if it's insufficient funds case (topUp button)
    if (!shopStore.balance || shopStore.balance.amount.lessThan(servicePrice)) {
      // Handle top-up logic here if needed
      show('Please top up your balance to continue', { type: 'info' });
      return;
    }
    
    // Make the actual purchase API call
    await shopAPI.purchaseService({
      serviceId: pendingPurchase.value.serviceId
    });
    
    // Purchase was successful if we get here without an error
    show(t('purchaseSuccess') || 'Purchase successful!', { type: 'success' });
    // Refresh balance after successful purchase
    await shopStore.fetchBalance();
    
  } catch (error) {
    show(t('purchaseError') || 'Failed to complete purchase', { type: 'error' });
  } finally {
    purchasing.value = false;
    pendingPurchase.value = null;
  }
};

const cancelPurchase = () => {
  pendingPurchase.value = null;
};

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  const slugParam = route.params.slug as string;
  
  if (slugParam) {
    try {
      loading.value = true;
      
      // Extract the actual slug from the parameter
      // Format is "service-name-123" where 123 is the ID
      let slug = slugParam;
      
      // If the slug contains an ID at the end, remove it for the API call
      const lastDashIndex = slugParam.lastIndexOf('-');
      if (lastDashIndex !== -1 && !isNaN(Number(slugParam.substring(lastDashIndex + 1)))) {
        slug = slugParam.substring(0, lastDashIndex);
      }
      
      
      // Make sure we have a valid slug before making the API call
      if (!slug || slug.trim() === '') {
        service.value = null;
        return;
      }
      
      const response = await shopAPI.getServiceContent(slug, currentLanguage.value);
      service.value = response.data;
    } catch (error) {
      service.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
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
  margin-bottom: 25px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
</style>