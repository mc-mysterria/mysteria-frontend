<template>
  <div class="comparison-table-wrapper desktop-only">
    <table class="comparison-table">
      <thead>
        <tr>
          <th class="feature-column">Можливості</th>
          <template v-for="plan in subscriptionPlans" :key="plan.id">
            <th class="plan-column">
              <div class="plan-header">
                <div class="plan-image-container">
                  <img
                    :src="getImagePath(plan.image)"
                    alt="Plan image"
                    class="plan-image"
                  />
                  <div v-if="hasDiscount(plan)" class="plan-corner-ribbon">
                    -{{ getDiscountPercent(plan) }}%
                  </div>
                </div>
                <h2>{{ plan.display_name || plan.name }}</h2>
                <p class="subtitle">{{ plan.description }}</p>
                <div class="price-container">
                  <div class="price" :class="{ discounted: hasDiscount(plan) }">
                    {{ getFinalPrice(plan) }}₴
                  </div>
                  <div v-if="hasDiscount(plan)" class="original-price">
                    {{ plan.price.toString() }}₴
                  </div>
                </div>
                <p class="price-subtitle">Щомісячна підписка</p>
                <button
                  @click="handlePurchase(plan)"
                  :disabled="!plan.is_active || isProcessing"
                  class="purchase-btn"
                >
                  {{
                    isProcessing
                      ? t("processing")
                      : plan.is_active
                        ? t("purchase")
                        : t("unavailable")
                  }}
                </button>
              </div>
            </th>
          </template>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(feature, index) in allFeatures" :key="index">
          <td class="feature-name">
            <div class="feature-with-tooltip">
              {{ feature.name }}
              <span v-if="feature.tooltip" class="tooltip-container">
                <i class="fa-solid fa-circle-info info-icon"></i>
                <div class="tooltip-content" v-html="feature.tooltip"></div>
              </span>
            </div>
          </td>
          <template
            v-for="plan in subscriptionPlans"
            :key="`${plan.id}-${index}`"
          >
            <td class="feature-availability">
              <div
                v-if="getPlanFeatureValue(plan, feature.id)"
                v-html="getPlanFeatureValue(plan, feature.id)"
                :class="{ highlighted: isHighlightedFeature(plan, feature.id) }"
              ></div>
              <div v-else class="not-available">—</div>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBalanceStore } from "@/stores/balance";
import { useI18n } from "@/composables/useI18n";
import type { ServiceResponse } from "@/types/services";
import { Decimal } from "decimal.js";

const shopStore = useBalanceStore();
const { t } = useI18n();
const subscriptionPlans = computed(() => {
  const plans = shopStore.items.filter(
    (item) => item.category === "subscription",
  );
  const order = ["wealth", "personal", "astral", "omega", "eternal"];
  return plans.sort((a, b) => {
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
});
const isProcessing = computed(() => shopStore.isProcessing);

const allFeatures = computed(() => {
  const features = new Set<string>();
  subscriptionPlans.value.forEach((plan) => {
    if (plan.service_metadata?.features) {
      Object.keys(plan.service_metadata.features).forEach((featureId) => {
        features.add(featureId);
      });
    }
  });
  return Array.from(features).map((id) => ({
    id,
    name: getFeatureName(id),
    tooltip: getFeatureTooltip(id),
  }));
});

const getFeatureName = (id: string): string => {
  const featureNames: Record<string, string> = {
    neutral: "Статус нейтралітету",
    town_create: "Створення поселення",
    town_rename: "Перейменування поселення",
    map_color: "Персоналізація кольору на мапі",
    area_discount: "Знижка на територію",
    pvp_toggle: "Контроль PvP у місті",
    fire_toggle: "Контроль вогню у місті",
    mobs_toggle: "Контроль появи монстрів",
    animal_revival: "Відродження тваринок",
    roleplay_commands: "Рольові емоційні команди",
    colored_chat: "Кольорові повідомлення",
    hide_on_map: "Режим невидимості на мапі",
    plants_placement: "Розширене озеленення",
    mc_discord_chat: "Інтегрований чат MC-Discord",
    bonus: "Одноразові бонуси",
  };
  return featureNames[id] || id;
};

const getFeatureTooltip = (id: string): string | null => {
  const tooltips: Record<string, string> = {
    neutral:
      "Ваше місто або нація отримує офіційний статус нейтралітету, який звільняє вас від участі у війнах та конфліктах між іншими гравцями",
    town_create:
      "Створіть місто будь-коли без додаткових витрат ресурсів, на відміну від інших гравців!",
    town_rename:
      "Змінюйте назву свого міста будь-коли без додаткових витрат ресурсів чи грошей",
    map_color:
      "Виберіть унікальний колір для відображення вашої території на загальній мапі серверу, підкресливши індивідуальність вашого поселення",
    area_discount:
      "Отримайте знижку на вартість території для вашого поселення, що дозволяє вам розширити межі вашого міста за меншу ціну",
    pvp_toggle:
      "Створіть безпечну зону, де гравці не зможуть битися одне з одним, захищаючи мирних жителів вашого міста від конфліктів",
    fire_toggle:
      "Запобігайте поширенню вогню на території вашого міста, захищаючи будівлі від пожеж, незалежно від джерела займання",
    mobs_toggle:
      "Створіть безпечний простір у своєму місті, повністю відключивши появу ворожих мобів на вашій території",
    animal_revival:
      'Випадково втратили свою тваринку? Не біда! Відродіть її використавши тотем безсмертя. А преміум підписки збільшують час для використання тотему, а також швидкість відродження. Бонуси вказані у форматі "Час до смерті" / "Час до відродження"',
    roleplay_commands:
      "Використовуйте спеціальні команди для вираження емоцій та взаємодії з іншими гравцями, збагачуючи рольовий досвід гри",
    colored_chat:
      "Використовуйте спеціальні коди кольорів (наприклад, &c для червоного) для оформлення своїх повідомлень у локальному чаті",
    hide_on_map:
      "Активуйте командою /bmpc режим приватності, який приховує ваше місцезнаходження від інших гравців на динамічній мапі серверу",
    plants_placement:
      "Створюйте унікальні ландшафтні дизайни, розміщуючи рослини на будь-яких поверхнях — камені, склі, воді чи інших нестандартних блоках",
    mc_discord_chat:
      "Отримайте доступ до спеціального каналу в Discord, який транслює всі повідомлення з ігрового серверу в реальному часі",
    bonus:
      "Бонуси, які ви отримуєте кожного разу, як купуєте підписку, або подовжуєте її",
  };
  return tooltips[id] || null;
};

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

const hasDiscount = (plan: ServiceResponse) => {
  if (!plan.discounts?.length) return false;
  const now = new Date();
  return plan.discounts.some((discount) => {
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
};

const getDiscountPercent = (plan: ServiceResponse) => {
  if (!hasDiscount(plan)) return 0;
  const activeDiscount = plan.discounts?.find((discount) => {
    const now = new Date();
    const startDate = new Date(discount.start_date);
    const endDate = discount.end_date ? new Date(discount.end_date) : null;
    return now >= startDate && (!endDate || now <= endDate);
  });
  return activeDiscount?.discount_percent || 0;
};

const getFinalPrice = (plan: ServiceResponse) => {
  const price = new Decimal(plan.price);
  if (!hasDiscount(plan)) return price.toString();
  return price
    .mul(new Decimal(1).minus(new Decimal(getDiscountPercent(plan)).div(100)))
    .toString();
};

const getPlanFeatureValue = (
  plan: ServiceResponse,
  featureId: string,
): string | null => {
  const value = plan.service_metadata?.features?.[featureId];
  if (value === undefined) return null;
  if (value === true) return '<i class="fa-solid fa-check"></i>';
  return value.toString();
};

const isHighlightedFeature = (
  plan: ServiceResponse,
  featureId: string,
): boolean => {
  const uniqueFeatures = {
    wealth: [
      "neutral",
      "town_create",
      "town_rename",
      "map_color",
      "area_discount",
    ],
    astral: ["pvp_toggle", "hide_on_map"],
    omega: ["fire_toggle", "mc_discord_chat"],
    eternal: ["mobs_toggle", "animal_revival", "cosmetic_tokens"],
    personal: [
      "roleplay_commands",
      "colored_chat",
      "plants_placement",
      "bonus",
    ],
  };
  return (
    uniqueFeatures[plan.name as keyof typeof uniqueFeatures]?.includes(
      featureId,
    ) || false
  );
};

const handlePurchase = (plan: ServiceResponse) => {
  const requiresServerSelection =
    plan.server_availability?.mode === "selectable";

  shopStore.currentPurchase = {
    id: plan.id,
    price: new Decimal(plan.price),
    requiresServerSelection,
  };
};
</script>

<style scoped>
.comparison-table-wrapper {
  overflow-x: hidden;
  border-radius: 7px;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #23262c;
}

.comparison-table th,
.comparison-table td {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #34373d;
}

.feature-column {
  width: 200px;
  max-width: 200px;
  text-align: left;
}

.plan-column {
  min-width: 200px;
}

.plan-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
  min-height: 400px;
  justify-content: space-between;
}

.plan-header h2 {
  font-size: 24px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  margin-bottom: 5px;
  text-align: center;
  width: 100%;
}

.subtitle {
  color: #b4bbc5;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
}

.plan-image-container {
  position: relative;
  display: inline-block;
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.plan-image {
  width: 250px;
  height: auto;
  border-radius: 7px;
  object-fit: cover;
}

.plan-corner-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ee7828;
  color: white;
  padding: 2px 25px;
  font-weight: bold;
  font-size: 14px;
  border-radius: 4px;
  transform: rotate(45deg) translateX(15px) translateY(-10px);
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
  width: 100%;
}

.price {
  font-size: 32px;
  font-family: "MontserratBold", system-ui, sans-serif;
}

.price.discounted {
  color: #ee7828;
}

.original-price {
  font-size: 22px;
  color: #8a8a8a;
  text-decoration: line-through;
  margin-left: 8px;
  align-self: flex-start;
  margin-top: 5px;
}

.price-subtitle {
  color: #b4bbc5;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
  width: 100%;
}

.feature-name {
  text-align: left;
  font-weight: normal;
  padding-left: 20px;
}

.feature-availability {
  font-size: 16px;
}

.highlighted {
  color: #ee7828;
  font-weight: bold;
}

.not-available {
  color: #4f5665;
}

.feature-with-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.tooltip-container {
  position: relative;
  display: inline-block;
  margin-left: 8px;
}

.info-icon {
  color: #4ade80;
  font-size: 14px;
  cursor: help;
}

.tooltip-content {
  position: absolute;
  visibility: hidden;
  width: 250px;
  background-color: #30343c;
  color: white;
  border-radius: 6px;
  padding: 12px;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: left;
  font-size: 14px;
  line-height: 1.4;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #30343c transparent transparent transparent;
}

.tooltip-container:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}

.purchase-btn {
  background-color: #4ade80;
  color: white;
  border: none;
  border-radius: 7px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 15px;
  width: 100%;
}

.purchase-btn:hover {
  background-color: #22d3ee;
}

.purchase-btn:disabled {
  background-color: #4f5665;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .comparison-table th,
  .comparison-table td {
    padding: 12px 8px;
  }

  .feature-column {
    width: 140px;
    max-width: 140px;
  }

  .plan-column {
    min-width: 150px;
  }

  .plan-header h2 {
    font-size: 20px;
  }

  .price {
    font-size: 28px;
  }

  .plan-image {
    width: 100px;
  }
}

@media (max-width: 576px) {
  .desktop-only {
    display: none;
  }
}
</style>
