<template>
  <div
    v-if="item.is_active"
    class="item-card"
    :class="{
      'role-card': item.type === 'ROLE',
      'item-card-type': item.type === 'ITEM', 
      'permission-card': item.type === 'PERMISSION',
      'cosmetic-card': item.type === 'COSMETIC',
    }"
  >
    <h2>{{ item.display_name || item.name }}</h2>
    <p v-if="item.description" class="subtitle">{{ item.description }}</p>

    <div v-if="item.image" class="item-image-container">
      <img
        :src="getImagePath(item.image)"
        :alt="item.name"
        class="item-image"
      />
      <div v-if="hasDiscount" class="corner-ribbon">
        -{{ discountPercent }}%
      </div>
    </div>

    <div class="price-container">
      <div class="price" :class="{ discounted: hasDiscount }">
        {{ finalPrice }}₴
      </div>
      <div v-if="hasDiscount" class="original-price">
        {{ item.price.toString() }}₴
      </div>
    </div>

    <p v-if="item.description" class="price-subtitle">{{ item.description }}</p>

    <ul v-if="item.points" class="features-list">
      <li
        v-for="(point, pIndex) in item.points"
        :key="pIndex"
        class="feature-item"
      >
        <div class="feature-with-tooltip">
          <i class="fa-solid fa-check feature-check"></i>
          {{ point.text }}
          <span v-if="point.tooltip" class="tooltip-container">
            <i class="fa-solid fa-circle-info info-icon"></i>
            <div class="tooltip-content" v-html="point.tooltip"></div>
          </span>
        </div>
      </li>
    </ul>

    <button
      @click="handlePurchase"
      :disabled="!item.is_active || isProcessing"
      class="purchase-btn"
      :class="{ 
        'role-btn': isRoleCard,
        'item-btn': isItemCard,
        'permission-btn': isPermissionCard,
        'cosmetic-btn': isCosmeticCard
      }"
    >
      {{
        isProcessing ? t('processing') : item.is_active ? t('purchase') : t('unavailable')
      }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "@/composables/useI18n";
import type { ServiceResponse } from "@/types/services";
import { Decimal } from "decimal.js";

const props = defineProps<{
  item: ServiceResponse;
  isProcessing?: boolean;
}>();

const emit = defineEmits<{
  (e: "purchase", itemId: string): void;
}>();

const { t } = useI18n();

const isRoleCard = computed(() => props.item.type === "ROLE");
const isItemCard = computed(() => props.item.type === "ITEM");
const isPermissionCard = computed(() => props.item.type === "PERMISSION");
const isCosmeticCard = computed(() => props.item.type === "COSMETIC");

const getImagePath = (path: string | undefined) => {
  if (!path) return "";
  try {
    if (path.startsWith("@/assets/")) {
      return new URL(path.replace("@/assets/", "/src/assets/"), import.meta.url)
        .href;
    }
    if (path.startsWith("src/")) {
      return new URL("/" + path, import.meta.url).href;
    }
    return new URL(path, import.meta.url).href;
  } catch (error) {
    console.error("Помилка завантаження зображення:", error);
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
  if (!hasDiscount.value) return price.toString();
  return price
    .mul(new Decimal(1).minus(new Decimal(discountPercent.value).div(100)))
    .toString();
});

const handlePurchase = () => {
  emit("purchase", props.item.id);
};
</script>

<style scoped>
.item-card {
  background-color: #23262c;
  border-radius: 7px;
  padding: 30px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  order: 1;
}

.role-card {
  border-left: 4px solid #e74c3c;
}

.item-card-type {
  border-left: 4px solid #3498db;
}

.permission-card {
  border-left: 4px solid #f39c12;
}

.cosmetic-card {
  border-left: 4px solid #9b59b6;
}

.item-card h2 {
  font-size: 24px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  margin-bottom: 8px;
  color: #ffffff;
}

.subtitle {
  color: #b4bbc5;
  font-size: 14px;
  margin-bottom: 15px;
}

.item-image-container {
  position: relative;
  width: 100%;
  margin: 15px 0;
}

.item-image {
  width: 100%;
  border-radius: 7px;
}

.corner-ribbon {
  position: absolute;
  top: -60px;
  right: -20px;
  background-color: #ee7828;
  color: white;
  padding: 3px 40px;
  font-weight: bold;
  font-size: 16px;
  border-radius: 5px;
  transform: rotate(45deg) translateX(28px) translateY(-10px);
  transform-origin: top right;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.price-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
}

.price {
  font-size: 32px;
  font-family: "MontserratBold", system-ui, sans-serif;
  color: #ffffff;
}

.price.discounted {
  color: #ee7828;
}

.original-price {
  font-size: 22px;
  color: #8a8a8a;
  text-decoration: line-through;
}

.price-subtitle {
  color: #b4bbc5;
  font-size: 14px;
  margin-bottom: 15px;
}

.features-list {
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 20px 0;
  text-align: left;
}

.feature-item {
  margin-bottom: 12px;
  display: flex;
}

.feature-with-tooltip {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.feature-check {
  color: #6c5dd3;
  margin-right: 10px;
  flex-shrink: 0;
}

.tooltip-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: auto;
  z-index: 1;
}

.info-icon {
  color: #6c5dd3;
  font-size: 14px;
  cursor: help;
}

.tooltip-content {
  position: absolute;
  visibility: hidden;
  width: 250px;
  max-width: calc(100vw - 40px);
  background-color: #30343c;
  color: white;
  border-radius: 6px;
  padding: 12px;
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s ease;
  bottom: calc(100% + 10px);
  right: 14px;
  transform: translateX(calc(25px));
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  text-align: left;
  font-size: 14px;
  line-height: 1.4;
  pointer-events: none;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  right: 14px;
  margin-right: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #30343c transparent transparent transparent;
}

.tooltip-container:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}

/* Alternative positioning for tooltips that would go off-screen */
.tooltip-content.bottom {
  bottom: auto;
  top: calc(100% + 10px);
}

.tooltip-content.bottom::after {
  top: auto;
  bottom: 100%;
  right: 20px;
  margin-right: -5px;
  border-color: transparent transparent #30343c transparent;
}

.purchase-btn {
  background-color: #6c5dd3;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto;
  width: 100%;
}

.purchase-btn:hover:not(:disabled) {
  background-color: #7a6cdf;
}

.purchase-btn:disabled {
  background-color: #4f5665;
  cursor: not-allowed;
}

.role-btn {
  background-color: #e74c3c;
}

.role-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.item-btn {
  background-color: #3498db;
}

.item-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.permission-btn {
  background-color: #f39c12;
}

.permission-btn:hover:not(:disabled) {
  background-color: #e67e22;
}

.cosmetic-btn {
  background-color: #9b59b6;
}

.cosmetic-btn:hover:not(:disabled) {
  background-color: #8e44ad;
}

@media (max-width: 576px) {
  .item-card {
    padding: 20px;
  }

  .item-card h2 {
    font-size: 20px;
  }

  .price {
    font-size: 28px;
  }

  .tooltip-content {
    width: 200px;
    max-width: 85vw;
    font-size: 12px;
    padding: 10px;
    right: -180px;
    transform: none;
  }

  .tooltip-content::after {
    right: 15px;
    margin-right: -5px;
  }

  .original-price {
    font-size: 20px;
  }

  .purchase-btn {
    padding: 10px;
    font-size: 15px;
  }
}
</style>
