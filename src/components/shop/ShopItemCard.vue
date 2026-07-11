<template>
  <article v-if="item.is_active" class="shop-card" :class="{ 'has-discount': hasDiscount }">
    <router-link :to="getServiceDetailPath(item)" class="media" :aria-label="itemName">
      <div class="image-shell" :class="{ loaded: imageLoaded, failed: imageFailed }">
        <div class="image-placeholder" aria-hidden="true">
          <i class="fa-solid fa-wand-sparkles"></i>
        </div>
        <img
          v-if="imageUrl && !imageFailed"
          :src="imageUrl"
          :alt="itemName"
          class="item-image"
          :loading="imagePriority === 'high' ? 'eager' : 'lazy'"
          :fetchpriority="imagePriority"
          decoding="async"
          @load="imageLoaded = true"
          @error="imageFailed = true"
        />
      </div>
      <div class="media-shade" aria-hidden="true"></div>

      <div class="top-badges">
        <span v-if="item.category" class="category-badge">{{ item.category }}</span>
        <span v-if="hasDiscount" class="discount-badge">−{{ discountPercent }}%</span>
      </div>

      <div v-if="item.is_giftable || item.is_bulkable" class="feature-badges">
        <span v-if="item.is_giftable" :title="t('giftable')" class="feature-badge">
          <i class="fa-solid fa-gift"></i><span>{{ t('giftable') }}</span>
        </span>
        <span v-if="item.is_bulkable" :title="t('bulkAvailable')" class="feature-badge">
          <i class="fa-solid fa-layer-group"></i><span>{{ t('bulkAvailable') }}</span>
        </span>
      </div>
    </router-link>

    <div class="card-content">
      <div class="card-heading">
        <h3>{{ itemName }}</h3>
        <p v-if="item.description">{{ item.description }}</p>
      </div>

      <ul v-if="item.points?.length" class="points-list">
        <li v-for="(point, index) in item.points.slice(0, 4)" :key="index">
          <i class="fa-solid fa-check" aria-hidden="true"></i>
          <span>{{ point.text }}</span>
          <span v-if="point.tooltip" class="tooltip" tabindex="0">
            <i class="fa-solid fa-circle-info"></i>
            <span role="tooltip">{{ point.tooltip }}</span>
          </span>
        </li>
      </ul>

      <div class="card-footer">
        <div class="price-block">
          <span class="price-label">{{ t('price') || 'Price' }}</span>
          <div class="prices">
            <span v-if="hasDiscount" class="original-price">
              <span v-if="currentCurrency !== 'POINTS'">{{ getCurrencySymbol() }}</span>{{ displayOriginalPrice }}
              <IconBalance v-if="currentCurrency === 'POINTS'" />
            </span>
            <span class="current-price">
              <span v-if="currentCurrency !== 'POINTS'">{{ getCurrencySymbol() }}</span>{{ displayPrice }}
              <IconBalance v-if="currentCurrency === 'POINTS'" />
            </span>
          </div>
        </div>

        <div class="actions">
          <router-link :to="getServiceDetailPath(item)" class="details-button" :aria-label="`${itemName} details`">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </router-link>
          <button :disabled="isProcessing" class="purchase-button" @click="handlePurchase">
            <i v-if="isProcessing" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ isProcessing ? t('processing') : t('purchase') }}</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "@/composables/useI18n";
import {useCurrency} from "@/composables/useCurrency";
import type {ServiceResponse} from "@/types/services";
import {Decimal} from "decimal.js";
import IconBalance from "@/assets/icons/IconBalance.vue";
import {getServiceDetailPath} from "@/utils/slug";

const props = withDefaults(defineProps<{
  item: ServiceResponse;
  isProcessing?: boolean;
  imagePriority?: 'high' | 'low' | 'auto';
}>(), {isProcessing: false, imagePriority: 'auto'});

const emit = defineEmits<{(e: "purchase", itemId: string): void}>();
const {t, currentLanguage} = useI18n();
const {currentCurrency, formatCurrency, getCurrencySymbol} = useCurrency();
const imageLoaded = ref(false);
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
watch(imageUrl, () => { imageLoaded.value = false; imageFailed.value = false; });

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
.shop-card { position:relative; min-width:0; height:100%; display:flex; flex-direction:column; overflow:hidden; color:var(--myst-offwhite); background:linear-gradient(155deg,rgba(25,29,48,.94),rgba(10,12,23,.98)); border:1px solid rgba(200,178,115,.16); border-radius:16px; box-shadow:0 18px 55px rgba(0,0,0,.24); transition:transform .35s ease,border-color .35s ease,box-shadow .35s ease; }
.shop-card::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; background:linear-gradient(120deg,rgba(255,255,255,.05),transparent 28%); }
@media (hover:hover) { .shop-card:hover { transform:translateY(-6px); border-color:rgba(200,178,115,.42); box-shadow:0 24px 65px rgba(0,0,0,.38),0 0 30px rgba(200,178,115,.06); } }
.media { position:relative; display:block; aspect-ratio:16/9; min-height:190px; overflow:hidden; color:inherit; }
.image-shell,.item-image,.media-shade { position:absolute; inset:0; width:100%; height:100%; }
.image-shell { background:linear-gradient(110deg,#111525 30%,#1c2237 45%,#111525 60%); background-size:250% 100%; animation:shimmer 1.6s infinite linear; }
.image-placeholder { position:absolute; inset:0; display:grid; place-items:center; color:rgba(200,178,115,.35); font-size:34px; }
.image-shell.loaded,.image-shell.failed { animation:none; background:#111525; }
.item-image { object-fit:cover; opacity:0; transform:scale(1.025); filter:saturate(.86) contrast(1.04); transition:opacity .45s ease,transform .7s ease,filter .4s ease; }
.image-shell.loaded .item-image { opacity:1; }
@media (hover:hover) { .shop-card:hover .item-image { transform:scale(1.07); filter:saturate(1.02) contrast(1.07); } }
.media-shade { background:linear-gradient(180deg,rgba(5,7,14,.08) 30%,rgba(7,9,18,.86) 100%); }
.top-badges,.feature-badges { position:absolute; z-index:2; display:flex; gap:8px; }
.top-badges { top:14px; left:14px; right:14px; justify-content:space-between; align-items:flex-start; }
.category-badge,.discount-badge,.feature-badge { backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
.category-badge { max-width:75%; overflow:hidden; text-overflow:ellipsis; padding:6px 10px; border:1px solid rgba(255,255,255,.13); border-radius:999px; background:rgba(7,9,18,.68); color:#e8dfc4; font:600 10px/1 'JetBrains Mono',monospace; letter-spacing:1.2px; text-transform:uppercase; white-space:nowrap; }
.discount-badge { padding:7px 10px; border-radius:999px; background:var(--myst-gold); color:#11131c; font:800 12px/1 'JetBrains Mono',monospace; box-shadow:0 5px 18px rgba(200,178,115,.3); }
.feature-badges { left:14px; bottom:14px; }
.feature-badge { display:flex; align-items:center; gap:6px; padding:6px 9px; border:1px solid rgba(200,178,115,.18); border-radius:7px; background:rgba(7,9,18,.72); color:#ddd2b3; font-size:11px; }
.card-content { flex:1; display:flex; flex-direction:column; padding:20px; }
.card-heading h3 { margin:0; color:var(--myst-offwhite); font:700 clamp(20px,2vw,24px)/1.2 'Playfair Display',serif; }
.card-heading p { display:-webkit-box; overflow:hidden; margin:9px 0 0; color:#9da1af; font-size:14px; line-height:1.55; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.points-list { display:grid; gap:8px; margin:18px 0 0; padding:16px 0 0; border-top:1px solid rgba(255,255,255,.07); list-style:none; }
.points-list li { display:flex; align-items:flex-start; gap:9px; color:#bdc0ca; font-size:13px; line-height:1.4; }
.points-list>li>i { margin-top:3px; color:var(--myst-gold); font-size:10px; }
.points-list li>span:nth-child(2) { flex:1; }
.tooltip { position:relative; cursor:help; color:#777f92; }
.tooltip>span { position:absolute; right:0; bottom:calc(100% + 8px); width:min(230px,70vw); padding:10px 12px; visibility:hidden; opacity:0; transform:translateY(4px); border:1px solid rgba(200,178,115,.25); border-radius:8px; background:#080b14; color:#e2e2e6; box-shadow:0 10px 30px #000; transition:.2s ease; z-index:10; }
.tooltip:hover>span,.tooltip:focus>span { visibility:visible; opacity:1; transform:none; }
.card-footer { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; margin-top:auto; padding-top:22px; }
.price-block { min-width:0; }
.price-label { display:block; margin-bottom:4px; color:#707686; font:600 9px/1 'JetBrains Mono',monospace; letter-spacing:1.4px; text-transform:uppercase; }
.prices { display:flex; align-items:baseline; flex-wrap:wrap; gap:8px; }
.original-price { display:flex; align-items:center; gap:3px; color:#6f7481; font:500 12px 'JetBrains Mono',monospace; text-decoration:line-through; }
.current-price { display:flex; align-items:center; gap:5px; color:var(--myst-gold); font:800 22px/1.2 'JetBrains Mono',monospace; }
.prices svg { width:18px; height:18px; }
.original-price svg { width:12px; height:12px; }
.actions { display:flex; gap:8px; }
.details-button,.purchase-button { min-height:44px; border-radius:9px; transition:background .25s ease,border-color .25s ease,transform .25s ease; }
.details-button { width:44px; display:grid; place-items:center; border:1px solid rgba(255,255,255,.12); color:#b5b8c2; background:rgba(255,255,255,.04); }
.purchase-button { min-width:126px; display:flex; align-items:center; justify-content:center; gap:8px; padding:0 18px; border:1px solid rgba(200,178,115,.45); background:rgba(200,178,115,.1); color:var(--myst-gold); cursor:pointer; font:700 11px 'JetBrains Mono',monospace; letter-spacing:1.1px; text-transform:uppercase; }
.details-button:hover,.purchase-button:hover:not(:disabled) { transform:translateY(-2px); }
.purchase-button:hover:not(:disabled) { background:var(--myst-gold); color:#10121a; }
.details-button:focus-visible,.purchase-button:focus-visible,.media:focus-visible { outline:2px solid var(--myst-gold); outline-offset:-2px; }
.purchase-button:disabled { opacity:.45; cursor:wait; }
@keyframes shimmer { to { background-position:-250% 0; } }
@media (max-width:600px) {
  .shop-card { border-radius:13px; }
  .media { min-height:0; aspect-ratio:1.65; }
  .card-content { padding:17px; }
  .feature-badge span { display:none; }
  .feature-badge { width:30px; height:30px; justify-content:center; padding:0; border-radius:50%; }
  .card-footer { align-items:stretch; flex-direction:column; gap:14px; }
  .actions { width:100%; }
  .purchase-button { flex:1; }
  .details-button,.purchase-button { min-height:48px; }
}
@media (prefers-reduced-motion:reduce) { .shop-card,.item-image,.details-button,.purchase-button { transition:none; } .image-shell { animation:none; } }
</style>
