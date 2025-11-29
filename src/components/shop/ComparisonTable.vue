<template>
  <div class="comparison-modal-overlay" @click.self="$emit('close')">
    <div class="comparison-modal">
      <!-- Header -->
      <div class="comparison-header">
        <h2 class="comparison-title">
          <i class="fa-solid fa-code-compare"></i>
          {{ t('itemComparison') }}
        </h2>
        <button @click="$emit('close')" class="close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Comparison Table -->
      <div class="comparison-table-wrapper">
        <table class="comparison-table">
          <!-- Item Headers -->
          <thead>
            <tr>
              <th class="row-label-cell"></th>
              <th v-for="item in items" :key="item.id" class="item-header-cell">
                <div class="item-header">
                  <div class="item-image-wrapper">
                    <img
                      v-if="item.image"
                      :src="getImagePath(item.image)"
                      :alt="item.display_name || item.name"
                      class="item-image"
                    />
                    <div v-else class="item-image-placeholder">
                      <i class="fa-solid fa-image"></i>
                    </div>
                  </div>
                  <h3 class="item-name">{{ item.display_name || item.name }}</h3>
                  <span v-if="getItemBadge(item)" class="item-badge">{{ getItemBadge(item) }}</span>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Comparison Rows -->
          <tbody>
            <!-- Price Row -->
            <tr>
              <td class="row-label">{{ t('price') }}</td>
              <td v-for="item in items" :key="`price-${item.id}`" :class="['comparison-cell', { highlight: isCheapest(item) }]">
                <div class="price-cell">
                  <div v-if="hasDiscount(item)" class="original-price">
                    {{ formatPrice(item.price) }}
                  </div>
                  <div class="current-price">
                    {{ formatPrice(getFinalPrice(item)) }}
                    <i v-if="isCheapest(item)" class="fa-solid fa-star best-value-icon" title="Best value"></i>
                  </div>
                </div>
              </td>
            </tr>

            <!-- Type Row -->
            <tr>
              <td class="row-label">{{ t('comparisonType') }}</td>
              <td v-for="item in items" :key="`type-${item.id}`" class="comparison-cell">
                {{ getCategoryTitle(item.type) }}
              </td>
            </tr>

            <!-- Duration Row (for subscriptions) -->
            <tr v-if="items.some(item => item.duration_months)">
              <td class="row-label">{{ t('comparisonDuration') }}</td>
              <td v-for="item in items" :key="`duration-${item.id}`" class="comparison-cell">
                <span v-if="item.duration_months">
                  {{ item.duration_months }} {{ item.duration_months === 1 ? 'month' : 'months' }}
                </span>
                <span v-else class="muted-text">-</span>
              </td>
            </tr>

            <!-- Discount Row -->
            <tr v-if="items.some(hasDiscount)">
              <td class="row-label">{{ t('comparisonDiscount') }}</td>
              <td v-for="item in items" :key="`discount-${item.id}`" class="comparison-cell">
                <div v-if="hasDiscount(item)" class="discount-value">
                  -{{ getDiscountPercent(item) }}%
                </div>
                <span v-else class="muted-text">-</span>
              </td>
            </tr>

            <!-- Features Row -->
            <tr>
              <td class="row-label">{{ t('comparisonFeatures') }}</td>
              <td v-for="item in items" :key="`features-${item.id}`" :class="['comparison-cell', { highlight: hasMostFeatures(item) }]">
                <ul v-if="item.points && item.points.length > 0" class="features-list">
                  <li v-for="(point, index) in item.points" :key="index" class="feature-item">
                    <i class="fa-solid fa-check feature-check"></i>
                    {{ point.text }}
                  </li>
                </ul>
                <span v-else class="muted-text">No features listed</span>
                <i v-if="hasMostFeatures(item)" class="fa-solid fa-star best-value-icon" title="Most features"></i>
              </td>
            </tr>

            <!-- Description Row -->
            <tr>
              <td class="row-label">{{ t('description') || 'Description' }}</td>
              <td v-for="item in items" :key="`desc-${item.id}`" class="comparison-cell">
                <p v-if="item.description" class="description-text">{{ item.description }}</p>
                <span v-else class="muted-text">-</span>
              </td>
            </tr>
          </tbody>

          <!-- Action Row -->
          <tfoot>
            <tr>
              <td class="row-label">{{ t('actions') || 'Actions' }}</td>
              <td v-for="item in items" :key="`actions-${item.id}`" class="comparison-cell actions-cell">
                <button @click="$emit('purchase', item.id)" class="purchase-btn">
                  <i class="fa-solid fa-shopping-cart"></i>
                  {{ t('purchase') }}
                </button>
                <button @click="$emit('remove', item.id)" class="remove-btn">
                  <i class="fa-solid fa-xmark"></i>
                  {{ t('removeFromComparison') }}
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "@/composables/useI18n";
import { useCurrency } from "@/composables/useCurrency";
import type { ServiceResponse } from "@/types/services";
import { ServiceType } from "@/types/services";
import { Decimal } from "decimal.js";

const props = defineProps<{
  items: ServiceResponse[];
}>();

defineEmits<{
  close: [];
  purchase: [itemId: string];
  remove: [itemId: string];
}>();

const { t, currentLanguage } = useI18n();
const { currentCurrency, formatCurrency } = useCurrency();

// Helper functions
const getImagePath = (path: string | undefined) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return path;
  }
  try {
    if (path.startsWith("@/assets/")) {
      return new URL(path.replace("@/assets/", "/src/assets/"), import.meta.url).href;
    }
    if (path.startsWith("src/")) {
      return new URL("/" + path, import.meta.url).href;
    }
    return path;
  } catch (error) {
    console.error("Image loading error:", error);
    return path;
  }
};

const getItemBadge = (item: ServiceResponse) => {
  switch (item.type) {
    case ServiceType.DISCORD_ROLE:
      return "Rank";
    case ServiceType.ITEM:
      return "Relic";
    case ServiceType.PERMISSION:
      return "Permission";
    case ServiceType.SUBSCRIPTION:
      return "Subscription";
    default:
      return "";
  }
};

const getCategoryTitle = (type: ServiceType): string => {
  switch (type) {
    case ServiceType.ITEM:
      return t('shopCategoryItems') || 'Items';
    case ServiceType.COSMETIC:
      return t('shopCategoryCosmetics') || 'Cosmetics';
    case ServiceType.PERMISSION:
      return t('shopCategoryPermissions') || 'Permissions';
    case ServiceType.SUBSCRIPTION:
      return t('shopCategorySubscriptions') || 'Subscriptions';
    case ServiceType.DISCORD_ROLE:
      return t('shopCategoryDiscordRoles') || 'Discord Roles';
    case ServiceType.APPEAL:
      return t('shopCategoryAppeals') || 'Appeals';
    default:
      return t('shopCategoryOther') || 'Other';
  }
};

const hasDiscount = (item: ServiceResponse): boolean => {
  if (!item.discounts?.length) return false;
  const now = new Date();
  return item.discounts.some((discount) => {
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
};

const getDiscountPercent = (item: ServiceResponse): number => {
  if (!hasDiscount(item)) return 0;
  const activeDiscount = item.discounts?.find((discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
  return activeDiscount?.discount_percent || 0;
};

const getFinalPrice = (item: ServiceResponse): Decimal => {
  const price = new Decimal(item.price);
  if (!hasDiscount(item)) return price;
  const percent = getDiscountPercent(item);
  return price.mul(new Decimal(1).minus(new Decimal(percent).div(100)));
};

const formatPrice = (price: number | Decimal): string => {
  const priceDecimal = price instanceof Decimal ? price : new Decimal(price);
  if (currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS') {
    return formatCurrency(priceDecimal, { showSymbol: true, decimals: 2 });
  }
  return priceDecimal.toString();
};

// Comparison highlights
const isCheapest = (item: ServiceResponse): boolean => {
  const prices = props.items.map(i => getFinalPrice(i).toNumber());
  const minPrice = Math.min(...prices);
  return getFinalPrice(item).toNumber() === minPrice;
};

const hasMostFeatures = (item: ServiceResponse): boolean => {
  const featureCounts = props.items.map(i => i.points?.length || 0);
  const maxFeatures = Math.max(...featureCounts);
  return (item.points?.length || 0) === maxFeatures && maxFeatures > 0;
};
</script>

<style scoped>
/* Modal Overlay */
.comparison-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: auto;
}

.comparison-modal {
  background: color-mix(in srgb, var(--myst-bg) 95%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 16px;
  max-width: 95vw;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Header */
.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  background: color-mix(in srgb, var(--myst-bg-2) 50%, transparent);
}

.comparison-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--myst-ink-strong);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.comparison-title i {
  color: var(--myst-gold);
}

.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  border-radius: 8px;
  color: var(--myst-ink);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: color-mix(in srgb, #ef4444 20%, transparent);
  border-color: #ef4444;
  color: #ef4444;
}

/* Table Wrapper */
.comparison-table-wrapper {
  overflow: auto;
  flex: 1;
  padding: 0;
  position: relative;
}

.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  position: relative;
  margin: 24px;
  width: calc(100% - 48px);
}

/* No sticky positioning - let header scroll naturally */

/* Table Header */
.item-header-cell {
  min-width: 280px;
  max-width: 320px;
  padding: 16px;
  background: color-mix(in srgb, var(--myst-bg) 98%, transparent);
  backdrop-filter: blur(10px);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  vertical-align: top;
}

.item-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.item-image-wrapper {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--myst-ink-muted);
  font-size: 48px;
  opacity: 0.5;
}

.item-name {
  color: var(--myst-ink-strong);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-align: center;
  line-height: 1.3;
}

.item-badge {
  background: color-mix(in srgb, var(--myst-gold) 20%, transparent);
  color: var(--myst-ink-strong);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

/* Row Label */
.row-label-cell {
  min-width: 140px;
  max-width: 180px;
  padding: 16px;
  background: color-mix(in srgb, var(--myst-bg) 98%, transparent);
  backdrop-filter: blur(10px);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  font-weight: 600;
  color: var(--myst-ink-strong);
  position: sticky;
  left: 0;
  z-index: 50;
}

.row-label {
  min-width: 140px;
  max-width: 180px;
  padding: 16px;
  background: color-mix(in srgb, var(--myst-bg-2) 90%, transparent);
  backdrop-filter: blur(10px);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  font-weight: 600;
  color: var(--myst-ink-strong);
  vertical-align: top;
  position: sticky;
  left: 0;
  z-index: 10;
}

/* Comparison Cells */
.comparison-cell {
  min-width: 280px;
  max-width: 320px;
  padding: 16px;
  background: color-mix(in srgb, var(--myst-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  vertical-align: top;
}

.comparison-cell.highlight {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

/* Price Cell */
.price-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.original-price {
  color: var(--myst-ink-muted);
  text-decoration: line-through;
  font-size: 14px;
}

.current-price {
  color: var(--myst-gold);
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.discount-value {
  color: var(--myst-gold);
  font-weight: 600;
  font-size: 16px;
}

.best-value-icon {
  color: #fbbf24;
  font-size: 14px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Features List */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--myst-ink);
  font-size: 14px;
  line-height: 1.4;
}

.feature-check {
  color: var(--myst-gold);
  margin-top: 2px;
  flex-shrink: 0;
}

.description-text {
  color: var(--myst-ink);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.muted-text {
  color: var(--myst-ink-muted);
  font-style: italic;
  opacity: 0.6;
}

/* Actions */
.actions-cell {
  background: color-mix(in srgb, var(--myst-bg-2) 40%, transparent);
}

.actions-cell button {
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.purchase-btn {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-ink-strong);
}

.purchase-btn:hover {
  background: var(--myst-gold);
  color: var(--myst-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.remove-btn {
  background: color-mix(in srgb, #ef4444 10%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 20%, transparent);
  color: var(--myst-ink);
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px color-mix(in srgb, #ef4444 30%, transparent);
}

/* Responsive */
@media (max-width: 768px) {
  .comparison-modal {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  .comparison-header {
    padding: 16px;
  }

  .comparison-title {
    font-size: 18px;
  }

  .comparison-table-wrapper {
    padding: 0;
  }

  .comparison-table {
    margin: 16px;
    width: calc(100% - 32px);
  }

  .item-header-cell,
  .comparison-cell {
    min-width: 220px;
    max-width: 260px;
    padding: 12px;
  }

  .row-label,
  .row-label-cell {
    min-width: 100px;
    max-width: 120px;
    padding: 12px;
    font-size: 13px;
  }

  .item-image-wrapper {
    height: 120px;
  }

  .item-name {
    font-size: 14px;
  }
}
</style>
