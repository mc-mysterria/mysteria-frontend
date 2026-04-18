<template>
  <div v-if="item.is_active" class="reliquary-card" :class="{ 'has-discount': hasDiscount }">
    <!-- Card Frame Decoration -->
    <div class="card-frame-outer"></div>
    <div class="card-frame-inner"></div>

    <!-- Image / Visual Section -->
    <router-link :to="getServiceDetailPath(item)" class="visual-area">
      <div class="image-wrapper">
        <img
            v-if="item.image"
            :alt="item.display_name || item.name"
            :src="getImagePath(item.image)"
            class="item-image"
        />
        <div v-else class="image-placeholder">
          <i class="fa-solid fa-scroll placeholder-icon"></i>
        </div>
        <div class="image-overlay"></div>
        <div class="image-grain"></div>
      </div>

      <!-- Badges and Ribbons -->
      <div class="badge-container">
        <div v-if="getItemBadge()" class="category-badge">
          {{ getItemBadge() }}
        </div>
        <div v-if="hasDiscount" class="discount-seal">
          <span class="discount-val">-{{ discountPercent }}%</span>
        </div>
      </div>
      
      <!-- Ritual Status Indicators -->
      <div class="ritual-icons">
        <div v-if="item.is_giftable" :title="t('giftable')" class="ritual-icon gift">
          <i class="fa-solid fa-dove"></i>
        </div>
        <div v-if="item.is_bulkable" :title="t('bulkAvailable')" class="ritual-icon bulk">
          <i class="fa-solid fa-layer-group"></i>
        </div>
      </div>
    </router-link>

    <!-- Content Section -->
    <div class="card-body">
      <div class="title-section">
        <h3 class="item-title">{{ item.display_name || item.name }}</h3>
        <div class="title-underline"></div>
      </div>

      <div class="description-section">
        <p v-if="item.description" class="item-desc">
          {{ item.description }}
        </p>

        <!-- Manifestation Points -->
        <ul v-if="item.points" class="points-list">
          <li
              v-for="(point, pIndex) in item.points"
              :key="pIndex"
              class="point-item"
          >
            <div class="point-marker"></div>
            <span class="point-text">{{ point.text }}</span>
            <div v-if="point.tooltip" class="point-info">
              <i class="fa-solid fa-circle-nodes info-trigger"></i>
              <div class="info-bubble" v-html="point.tooltip"></div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Purchase / Action Section -->
    <div class="card-footer">
      <div class="price-display">
        <div v-if="hasDiscount" class="original-price">
          <span v-if="currentCurrency !== 'POINTS'" class="curr-symbol-mini">{{ getCurrencySymbol() }}</span>
          <span class="price-val">{{ displayOriginalPrice }}</span>
          <IconBalance v-if="currentCurrency === 'POINTS'" class="currency-sigil-tiny"/>
        </div>
        <div class="current-price">
          <span v-if="currentCurrency !== 'POINTS'" class="curr-symbol">{{ getCurrencySymbol() }}</span>
          <span class="price-val">{{ displayPrice }}</span>
          <IconBalance v-if="currentCurrency === 'POINTS'" class="currency-sigil"/>
        </div>
      </div>

      <div class="action-grid">
        <router-link :to="getServiceDetailPath(item)" class="btn-inspect">
          <i class="fa-solid fa-magnifying-glass"></i>
        </router-link>

        <button
            :disabled="!item.is_active || isProcessing"
            class="btn-purchase"
            @click="handlePurchase"
        >
          <span class="btn-text">
            {{ isProcessing ? t("processing") : t("purchase") }}
          </span>
          <div class="btn-glow"></div>
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

const getItemBadge = () => props.item.category;

const getImagePath = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  try {
    if (path.startsWith("@/assets/")) return new URL(path.replace("@/assets/", "/src/assets/"), import.meta.url).href;
    if (path.startsWith("src/")) return new URL("/" + path, import.meta.url).href;
    return path;
  } catch {
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
  return price.mul(new Decimal(1).minus(new Decimal(discountPercent.value).div(100)));
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

const handlePurchase = () => {
  emit("purchase", props.item.id);
};
</script>

<style scoped>
/* ENCHANTED RELIQUARY CARD */

.reliquary-card {
  position: relative;
  background: rgba(12, 14, 26, 0.7);
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 8px;
  min-height: 100%;
}

.reliquary-card:hover {
  transform: translateY(-8px) scale(1.01);
  background: rgba(18, 22, 42, 0.9);
}

/* Framing */
.card-frame-outer {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(200, 178, 115, 0.1);
  pointer-events: none;
  z-index: 5;
}

.card-frame-inner {
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  pointer-events: none;
  z-index: 5;
}

.reliquary-card:hover .card-frame-outer {
  border-color: rgba(200, 178, 115, 0.4);
  box-shadow: inset 0 0 20px rgba(200, 178, 115, 0.05);
}

/* Visual Area */
.visual-area {
  position: relative;
  height: 200px;
  margin-bottom: 24px;
  overflow: hidden;
  display: block;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background: #05070a;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  filter: sepia(0.3) contrast(1.1);
}

.reliquary-card:hover .item-image {
  opacity: 1;
  transform: scale(1.1);
  filter: sepia(0) contrast(1.2);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12, 14, 26, 1) 0%, transparent 40%);
}

.image-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.1;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Badges */
.badge-container {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
}

.category-badge {
  background: rgba(0, 0, 0, 0.6);
  color: var(--myst-gold);
  border: 1px solid rgba(200, 178, 115, 0.3);
  padding: 4px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  backdrop-filter: blur(4px);
}

.discount-seal {
  width: 40px;
  height: 40px;
  background: var(--myst-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(200, 178, 115, 0.4);
  transform: rotate(15deg);
}

.discount-val {
  color: #000;
  font-weight: 900;
  font-size: 11px;
}

/* Ritual Icons */
.ritual-icons {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.ritual-icon {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 14px;
  transition: all 0.3s ease;
}

.ritual-icon:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.1);
}

/* Body Content */
.card-body {
  padding: 0 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title-section {
  margin-bottom: 16px;
}

.item-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-offwhite);
  margin: 0 0 8px;
  line-height: 1.2;
}

.title-underline {
  height: 2px;
  width: 40px;
  background: var(--myst-gold);
  transition: width 0.4s ease;
}

.reliquary-card:hover .title-underline {
  width: 100px;
}

.item-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Points List */
.points-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #aaa;
}

.point-marker {
  width: 6px;
  height: 6px;
  background: rgba(200, 178, 115, 0.4);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.point-text {
  flex: 1;
}

.point-info {
  position: relative;
}

.info-trigger {
  color: var(--myst-gold);
  opacity: 0.5;
  cursor: pointer;
  font-size: 12px;
}

.info-trigger:hover {
  opacity: 1;
}

.info-bubble {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 220px;
  background: #0d111a;
  border: 1px solid var(--myst-gold);
  padding: 12px;
  font-size: 12px;
  color: #eee;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  transform: translateY(-10px);
  pointer-events: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
}

.point-info:hover .info-bubble {
  opacity: 1;
  visibility: visible;
  transform: translateY(-5px);
}

/* Footer Section */
.card-footer {
  padding: 24px 16px 16px;
}

.price-display {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.original-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #555;
  text-decoration: line-through;
  display: flex;
  align-items: center;
  gap: 4px;
}

.current-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-gold);
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency-sigil {
  width: 20px;
  height: 20px;
  color: var(--myst-gold);
}

.currency-sigil-tiny {
  width: 14px;
  height: 14px;
  opacity: 0.5;
}

.curr-symbol {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: var(--myst-gold);
}

.curr-symbol-mini {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #555;
}

/* Action Grid */
.action-grid {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 12px;
}

.btn-inspect {
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: all 0.3s ease;
}

.btn-inspect:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--myst-offwhite);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-purchase {
  position: relative;
  height: 48px;
  background: #151a2d;
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 13px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(200, 178, 115, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn-purchase:hover:not(:disabled) {
  background: var(--myst-gold);
  color: #000;
  border-color: var(--myst-gold);
}

.btn-purchase:hover:not(:disabled) .btn-glow {
  transform: translateX(100%);
}

.btn-purchase:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  .btn-inspect {
    display: none;
  }
}
</style>
