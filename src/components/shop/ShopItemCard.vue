<template>
  <article v-if="item.is_active" class="ware-card">
    <RouterLink :aria-label="itemName" :to="getServiceDetailPath(item)" class="ware-media">
      <img
          v-if="imageUrl && !imageFailed"
          :alt="itemName"
          :fetchpriority="imagePriority"
          :loading="imagePriority === 'high' ? 'eager' : 'lazy'"
          :src="imageUrl"
          class="ware-image"
          decoding="async"
          @error="imageFailed = true"
      >
      <i v-else class="fa-solid fa-wand-sparkles ware-glyph" aria-hidden="true"></i>

      <span v-if="item.category" class="ware-category">{{ item.category }}</span>
      <span v-if="hasDiscount" class="ware-discount">−{{ discountPercent }}%</span>
    </RouterLink>

    <div class="ware-body">
      <h3 class="ware-name">{{ itemName }}</h3>
      <p v-if="item.description" class="ware-description">{{ item.description }}</p>

      <ul v-if="item.points?.length" class="ware-points">
        <li v-for="(point, index) in item.points.slice(0, 4)" :key="index">
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          <span>{{ point.text }}</span>
          <span v-if="point.tooltip" class="ware-tooltip" tabindex="0">
            <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
            <span role="tooltip">{{ point.tooltip }}</span>
          </span>
        </li>
      </ul>

      <div class="ware-footer">
        <div class="ware-price">
          <span class="price-label">{{ priceNote }}</span>
          <div class="price-values">
            <span v-if="hasDiscount" class="price-old">
              <span v-if="currentCurrency !== 'POINTS'">{{ getCurrencySymbol() }}</span>{{ displayOriginalPrice }}
              <IconMark v-if="currentCurrency === 'POINTS'"/>
            </span>
            <span class="price-current">
              <span v-if="currentCurrency !== 'POINTS'">{{ getCurrencySymbol() }}</span>{{ displayPrice }}
              <IconMark v-if="currentCurrency === 'POINTS'"/>
            </span>
          </div>
        </div>

        <button :disabled="isProcessing" class="ware-purchase" @click="handlePurchase">
          <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
          <span>{{ isProcessing ? t('processing') : t('purchase') }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import {type ServiceResponse, ServiceType} from "@/types/services";
import {Decimal} from "decimal.js";
import IconMark from "@/assets/icons/IconMark.vue";
import {getServiceDetailPath} from "@/utils/slug";

const props = withDefaults(defineProps<{
  item: ServiceResponse;
  isProcessing?: boolean;
  imagePriority?: 'high' | 'low' | 'auto';
}>(), {isProcessing: false, imagePriority: 'auto'});

const emit = defineEmits<{ (e: "purchase", itemId: string): void }>();
const {t, currentLanguage} = useI18n();
const {currentCurrency, formatCurrency, getCurrencySymbol} = useCurrency();

const imageFailed = ref(false);
const itemName = computed(() => props.item.display_name || props.item.name);

const resolveImagePath = (path?: string) => {
  if (!path) return "";
  if (/^https?:\/\//.test(path) || path.startsWith("/")) return path;
  if (path.startsWith("@/assets/")) return new URL(path.replace("@/assets/", "/src/assets/"), import.meta.url).href;
  if (path.startsWith("src/")) return new URL(`/${path}`, import.meta.url).href;
  return path;
};

const imageUrl = computed(() => resolveImagePath(props.item.image));
watch(imageUrl, () => {
  imageFailed.value = false;
});

const isRecurring = computed(
    () => props.item.type === ServiceType.SUBSCRIPTION || Boolean(props.item.duration_months),
);
const priceNote = computed(() => (isRecurring.value ? t("shopPage.perMonth") : t("shopPage.oneTime")));

const activeDiscount = computed(() => props.item.discounts?.find(discount => {
  const now = Date.now();
  return now >= new Date(discount.start_date).getTime() && (!discount.end_date || now <= new Date(discount.end_date).getTime());
}));
const hasDiscount = computed(() => Boolean(activeDiscount.value));
const discountPercent = computed(() => activeDiscount.value?.discount_percent || 0);
const finalPrice = computed(() => new Decimal(props.item.price).mul(new Decimal(1).minus(new Decimal(discountPercent.value).div(100))));

const formatPrice = (price: Decimal) => currentLanguage.value === 'en' && currentCurrency.value !== 'POINTS'
    ? formatCurrency(price, {showSymbol: false, decimals: 2})
    : price.toString();

const displayPrice = computed(() => formatPrice(finalPrice.value));
const displayOriginalPrice = computed(() => formatPrice(new Decimal(props.item.price)));
const handlePurchase = () => emit("purchase", props.item.id);
</script>

<style scoped>
.ware-card {
  position: relative;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--myst-panel-strong);
  border: 1px solid var(--myst-line-18);
  /* Named properties, not `all` - the grid renders one of these per item, and
     `all` makes every one of them a candidate for transitioning layout
     properties too. */
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}

.ware-card:hover {
  border-color: var(--myst-line-55);
  transform: translateY(-5px);
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.45);
}

/* Media */
.ware-media {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 8;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 120%, rgba(200, 178, 115, 0.12), transparent 60%), #0c0f1c;
  color: inherit;
}

.ware-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.88);
  transition: transform 0.6s ease, filter 0.4s ease;
}

.ware-card:hover .ware-image {
  transform: scale(1.05);
  filter: saturate(1);
}

.ware-glyph {
  font-size: 44px;
  color: rgba(200, 178, 115, 0.5);
  filter: drop-shadow(0 0 18px rgba(200, 178, 115, 0.25));
}

.ware-category,
.ware-discount {
  position: absolute;
  top: 14px;
  font-family: var(--myst-font-mono);
  text-transform: uppercase;
}

.ware-category {
  left: 14px;
  max-width: 65%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 6px 11px;
  background: rgba(8, 10, 18, 0.7);
  border: 1px solid rgba(200, 178, 115, 0.25);
  color: rgba(200, 178, 115, 0.7);
  font-size: 9px;
  letter-spacing: 0.24em;
}

.ware-discount {
  right: 14px;
  padding: 6px 11px;
  background: var(--myst-gold);
  color: var(--myst-on-gold);
  font-size: 11px;
  font-weight: 800;
}

/* Body */
.ware-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 26px 26px;
}

.ware-name {
  margin: 0 0 8px;
  font-family: var(--myst-font-display);
  font-size: 21px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.ware-description {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 18px;
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  line-height: 1.6;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.ware-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 16px 0 0;
  border-top: 1px solid var(--myst-line-10);
  list-style: none;
}

.ware-points li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #bdc0ca;
  font-size: 12.5px;
  line-height: 1.5;
}

.ware-points > li > i {
  margin-top: 3px;
  color: var(--myst-gold);
  font-size: 9px;
}

.ware-points li > span:nth-child(2) {
  flex: 1;
}

.ware-tooltip {
  position: relative;
  cursor: help;
  color: #777f92;
}

.ware-tooltip > span {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  width: min(230px, 70vw);
  padding: 10px 12px;
  visibility: hidden;
  opacity: 0;
  transform: translateY(4px);
  border: 1px solid var(--myst-line-28);
  background: var(--myst-bg-deep);
  color: #e2e2e6;
  box-shadow: 0 10px 30px #000;
  transition: 0.2s ease;
  z-index: 10;
}

.ware-tooltip:hover > span,
.ware-tooltip:focus > span {
  visibility: visible;
  opacity: 1;
  transform: none;
}

/* Footer */
.ware-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding-top: 24px;
}

.price-label {
  display: block;
  margin-bottom: 5px;
  font-family: var(--myst-font-mono);
  font-size: 8.5px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.price-values {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 9px;
}

.price-old {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #6f7481;
  font-family: var(--myst-font-mono);
  font-size: 12px;
  text-decoration: line-through;
}

.price-current {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 22px;
  font-weight: 800;
}

.price-values svg {
  width: 18px;
  height: 18px;
}

.price-old svg {
  width: 12px;
  height: 12px;
}

.ware-purchase {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 0 22px;
  border: 1px solid var(--myst-line-55);
  background: rgba(200, 178, 115, 0.08);
  color: var(--myst-gold);
  cursor: pointer;
  font-family: var(--myst-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: all 0.25s ease;
}

.ware-purchase:hover:not(:disabled) {
  background: var(--myst-gold);
  color: var(--myst-on-gold);
}

.ware-purchase:disabled {
  opacity: 0.45;
  cursor: wait;
}

.ware-media:focus-visible,
.ware-purchase:focus-visible {
  outline: 2px solid var(--myst-gold);
  outline-offset: -2px;
}

@media (max-width: 600px) {
  .ware-body {
    padding: 20px;
  }

  .ware-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .ware-purchase {
    justify-content: center;
    min-height: 48px;
  }
}
</style>
