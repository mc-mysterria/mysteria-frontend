<template>
  <div v-if="item.is_active" class="myst-product-card group">
    <!-- Image container -->
    <router-link :to="getServiceDetailPath(item)" class="image-link">
      <div
          class="image-container relative h-48 rounded-t-lg bg-gradient-to-br from-[color-mix(in_srgb,var(--myst-bg)_90%,transparent)] to-[color-mix(in_srgb,var(--myst-bg-2)_70%,transparent)]">
        <img
            v-if="item.image"
            :alt="item.display_name || item.name"
            :src="getImagePath(item.image)"
            class="shop-item-image opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div
            v-else
            class="h-full w-full bg-gradient-to-br from-[color-mix(in_srgb,var(--myst-bg)_80%,transparent)] to-[color-mix(in_srgb,var(--myst-bg-2)_60%,transparent)] flex items-center justify-center opacity-60"
        >
          <i class="fa-solid fa-image text-4xl" style="color: var(--myst-ink-muted)"></i>
        </div>

        <!-- Badge -->
        <div v-if="getItemBadge()" class="absolute left-3 top-3">
          <div class="myst-badge">
            {{ getItemBadge() }}
          </div>
        </div>

        <!-- Discount ribbon -->
        <div v-if="hasDiscount" class="absolute right-3 top-3">
          <div class="myst-discount-badge">-{{ discountPercent }}%</div>
        </div>

        <!-- Feature badges -->
        <div class="feature-badges">
          <div v-if="item.is_giftable" :title="t('giftable')" class="feature-badge giftable">
            <i class="fa-solid fa-gift"></i>
          </div>
          <div v-if="item.is_bulkable" :title="t('bulkAvailable')" class="feature-badge bulkable">
            <i class="fa-solid fa-layer-group"></i>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Comparison toggle (only in comparison mode) - outside image container -->
    <div v-if="comparisonMode" class="comparison-toggle">
      <button
          :class="['comparison-checkbox', { selected: inComparison, disabled: comparisonDisabled }]"
          :disabled="comparisonDisabled"
          :title="inComparison ? t('removeFromComparison') : t('addToComparison')"
          @click.stop.prevent="$emit('toggle-comparison', item.id)"
      >
        <i :class="inComparison ? 'fa-solid fa-square-check' : 'fa-regular fa-square'"></i>
      </button>
    </div>

    <!-- Card header -->
    <div class="myst-card-header">
      <h3 class="myst-card-title">{{ item.display_name || item.name }}</h3>
    </div>

    <!-- Card content -->
    <div class="myst-card-content">
      <p v-if="item.description" class="myst-card-description">
        {{ item.description }}
      </p>

      <!-- Features list -->
      <ul v-if="item.points" class="myst-features-list">
        <li
            v-for="(point, pIndex) in item.points"
            :key="pIndex"
            class="myst-feature-item"
        >
          <i class="fa-solid fa-check myst-feature-check"></i>
          <span>{{ point.text }}</span>
          <span v-if="point.tooltip" class="myst-tooltip-container">
            <i class="fa-solid fa-circle-info myst-info-icon"></i>
            <div class="myst-tooltip-content" v-html="point.tooltip"></div>
          </span>
        </li>
      </ul>
    </div>

    <!-- Card footer -->
    <div class="myst-card-footer">
      <div class="myst-price-section">
        <div v-if="hasDiscount" class="myst-original-price">
          <span v-if="showCurrencySymbol" class="price-currency-symbol">{{ currencySymbol }}</span>
          <span>{{ displayOriginalPrice }}</span>
          <IconBalance v-if="!showCurrencySymbol" class="myst-currency-small"/>
        </div>
        <div class="myst-current-price">
          <span v-if="showCurrencySymbol" class="price-currency-symbol">{{ currencySymbol }}</span>
          <span>{{ displayPrice }}</span>
          <IconBalance v-if="!showCurrencySymbol" class="myst-currency"/>
        </div>
      </div>

      <div class="myst-actions">
        <router-link :to="getServiceDetailPath(item)" class="myst-details-btn">
          <i class="fa-solid fa-eye"></i>
          {{ t("viewDetails") || "Details" }}
        </router-link>

        <button
            :disabled="!item.is_active || isProcessing"
            class="myst-purchase-btn"
            @click="handlePurchase"
        >
          <i class="fa-solid fa-shopping-cart mr-2"></i>
          {{
            isProcessing
                ? t("processing")
                : item.is_active
                    ? t("purchase")
                    : t("unavailable")
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import type {ServiceResponse} from "@/types/services";
import {Decimal} from "decimal.js";
import IconBalance from "@/assets/icons/IconBalance.vue";
import {getServiceDetailPath} from "@/utils/slug";

const props = defineProps<{
  item: ServiceResponse;
  isProcessing?: boolean;
  comparisonMode?: boolean;
  inComparison?: boolean;
  comparisonDisabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "purchase", itemId: string): void;
  (e: "toggle-comparison", itemId: string): void;
}>();

const {t, currentLanguage} = useI18n();
const {currentCurrency, formatCurrency, getCurrencySymbol} = useCurrency();

const getItemBadge = () => {
  return props.item.category;
};

const getImagePath = (path: string | undefined) => {
  if (!path) return "";

  // Handle HTTP/HTTPS URLs (from API)
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Handle relative API paths
  if (path.startsWith("/")) {
    // If it's an absolute path from the API, prepend the API base URL or serve as static file
    return path;
  }

  // Handle local assets (fallback for legacy compatibility)
  try {
    if (path.startsWith("@/assets/")) {
      return new URL(path.replace("@/assets/", "/src/assets/"), import.meta.url)
          .href;
    }
    if (path.startsWith("src/")) {
      return new URL("/" + path, import.meta.url).href;
    }
    return path; // Return as-is if it doesn't match any pattern
  } catch (error) {
    console.error("Image loading error:", error);
    return path;
  }
};

const hasDiscount = computed(() => {
  if (!props.item.discounts?.length) return false;
  const now = new Date();
  return props.item.discounts.some((discount) => {
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
});

const discountPercent = computed(() => {
  if (!hasDiscount.value) return 0;
  const activeDiscount = props.item.discounts?.find((discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
  return activeDiscount?.discount_percent || 0;
});

const finalPrice = computed(() => {
  const price = new Decimal(props.item.price);
  if (!hasDiscount.value) return price;
  return price
      .mul(new Decimal(1).minus(new Decimal(discountPercent.value).div(100)));
});

const displayPrice = computed(() => {
  if (currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS') {
    return formatCurrency(finalPrice.value, {showSymbol: false, decimals: 2});
  }
  return finalPrice.value.toString();
});

const displayOriginalPrice = computed(() => {
  const price = new Decimal(props.item.price);
  if (currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS') {
    return formatCurrency(price, {showSymbol: false, decimals: 2});
  }
  return price.toString();
});

const showCurrencySymbol = computed(() => {
  return currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS';
});

const currencySymbol = computed(() => {
  if (showCurrencySymbol.value) {
    return getCurrencySymbol();
  }
  return '';
});

const handlePurchase = () => {
  emit("purchase", props.item.id);
};
</script>

<style scoped>
/* Product Card Styles */
.myst-product-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  border-radius: 12px;
  overflow: visible;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

/* Image Container */
.image-container {
  position: relative;
  z-index: 1;
  overflow: visible;
}

/* Image Styles */
.shop-item-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 12px 12px 0 0;
}

.myst-product-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--myst-bg) 60%, transparent);
}

/* Badge */
.myst-badge {
  background: color-mix(in srgb, var(--myst-gold) 20%, transparent);
  color: var(--myst-ink-strong);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  backdrop-filter: blur(5px);
}

/* Discount Badge */
.myst-discount-badge {
  background: var(--myst-gold);
  color: var(--myst-bg);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

/* Feature Badges */
.feature-badges {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 5;
}

.feature-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 14px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.feature-badge.giftable {
  background: color-mix(in srgb, #10b981 80%, transparent);
  color: white;
  border: 2px solid #10b981;
}

.feature-badge.bulkable {
  background: color-mix(in srgb, #3b82f6 80%, transparent);
  color: white;
  border: 2px solid #3b82f6;
}

.feature-badge:hover {
  transform: scale(1.1);
}

/* Comparison Toggle */
.comparison-toggle {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 15;
}

.comparison-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: color-mix(in srgb, var(--myst-bg-2) 90%, transparent);
  border: 2px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 8px;
  color: var(--myst-ink);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

/* Card Header */
.myst-card-header {
  padding: 20px 20px 0;
}

.myst-card-title {
  color: var(--myst-ink-strong);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

/* Card Content */
.myst-card-content {
  padding: 8px 20px 0;
  flex-grow: 1;
}

.myst-card-description {
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

/* Features List */
.myst-features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.myst-feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--myst-ink);
}

.myst-feature-check {
  color: var(--myst-gold);
  margin-right: 8px;
  flex-shrink: 0;
  font-size: 12px;
}

/* Tooltip */
.myst-tooltip-container {
  position: relative;
  margin-left: auto;
  display: flex;
  align-items: center;
}

.myst-info-icon {
  color: var(--myst-gold);
  font-size: 12px;
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.myst-info-icon:hover {
  opacity: 1;
}

.myst-tooltip-content {
  position: absolute;
  visibility: hidden;
  width: 250px;
  max-width: calc(100vw - 40px);
  background: var(--myst-bg-2);
  color: var(--myst-ink-strong);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  border-radius: 8px;
  padding: 12px;
  z-index: 1000;
  opacity: 0;
  transition: all 0.3s ease;
  bottom: calc(100% + 8px);
  right: 0;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--myst-bg) 40%, transparent);
  font-size: 13px;
  line-height: 1.4;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.myst-tooltip-container:hover .myst-tooltip-content {
  visibility: visible;
  opacity: 1;
}

/* Image link */
.image-link {
  display: block;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.image-link:hover {
  transform: scale(1.02);
}

/* Card Footer */
.myst-card-footer {
  padding: 16px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Actions container */
.myst-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Price Section */
.myst-price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.myst-original-price {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--myst-ink-muted);
  text-decoration: line-through;
  font-size: 14px;
  margin-bottom: 2px;
  opacity: 0.7;
}

.myst-current-price {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--myst-gold);
  font-weight: 600;
  font-size: 16px;
}

.price-currency-symbol {
  font-weight: 600;
  margin-right: 2px;
}

.myst-currency {
  width: 20px !important;
  height: 20px !important;
  color: var(--myst-gold);
}

.myst-currency-small {
  width: 16px !important;
  height: 16px !important;
  opacity: 0.7;
}

/* Details Button */
.myst-details-btn {
  background: color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  color: var(--myst-ink-strong);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  text-decoration: none;
}

.myst-details-btn:hover {
  background: color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  transform: translateY(-1px);
}

/* Purchase Button */
.myst-purchase-btn {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-ink-strong);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  backdrop-filter: blur(5px);
}

.myst-purchase-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 50%, transparent);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.myst-purchase-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  color: var(--myst-ink-muted);
}

/* Responsive Design */
@media (max-width: 768px) {
  .myst-card-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .myst-price-section {
    align-items: center;
  }

  .myst-actions {
    justify-content: space-between;
  }

  .myst-details-btn,
  .myst-purchase-btn {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 576px) {
  .myst-card-header {
    padding: 16px 16px 0;
  }

  .myst-card-content {
    padding: 8px 16px 0;
  }

  .myst-card-footer {
    padding: 12px 16px 16px;
  }

  .myst-card-title {
    font-size: 16px;
  }

  .myst-card-description {
    font-size: 13px;
  }

  .myst-tooltip-content {
    width: 200px;
    max-width: 85vw;
    font-size: 12px;
    padding: 10px;
    right: -100px;
  }
}
</style>
