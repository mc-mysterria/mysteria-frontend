<template>
  <div class="tabs-navigation" ref="tabsNavigationRef">
    <button
      @click="setActiveTab('items')"
      :class="{ 'active-tab': activeTab === 'items' }"
      class="tab-button"
      data-tab="items"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ t('items') }}
    </button>
    <button
      @click="setActiveTab('subscriptions')"
      :class="{ 'active-tab': activeTab === 'subscriptions' }"
      class="tab-button"
      data-tab="subscriptions"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      {{ t('subscriptions') }}
    </button>
    <div class="tab-underline" ref="underlineRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";
import { useI18n } from "@/composables/useI18n";

// Local tab state management
const { t } = useI18n();
const activeTab = ref<"items" | "subscriptions">("items");
const tabsNavigationRef = ref<HTMLElement>();
const underlineRef = ref<HTMLElement>();

let activeElement: HTMLElement | null = null;

const setActiveTab = (tab: "items" | "subscriptions") => {
  activeTab.value = tab;
};

const findActiveElement = (): HTMLElement | null => {
  if (!tabsNavigationRef.value) return null;

  const activeTabButton = tabsNavigationRef.value.querySelector(
    `.tab-button[data-tab="${activeTab.value}"]`,
  ) as HTMLElement;

  return activeTabButton || null;
};

const updateUnderline = (
  targetElement: HTMLElement | null,
  immediate = false,
) => {
  if (!underlineRef.value || !tabsNavigationRef.value) return;

  const underline = underlineRef.value;

  if (immediate) {
    underline.style.transition = "none";
  }

  if (targetElement) {
    const navRect = tabsNavigationRef.value.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const width = targetElement.offsetWidth;
    const left = targetRect.left - navRect.left;

    underline.style.width = `${width}px`;
    underline.style.left = `${left}px`;
    underline.style.opacity = "1";
  } else {
    underline.style.opacity = "0";
  }

  if (immediate) {
    requestAnimationFrame(() => {
      underline.style.transition = "";
    });
  }
};

const setActiveUnderline = (immediate = false) => {
  activeElement = findActiveElement();
  updateUnderline(activeElement, immediate);
};

const handleMouseEnter = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  updateUnderline(target);
};

const handleMouseLeave = () => {
  updateUnderline(activeElement);
};

watch(
  () => activeTab.value,
  () => {
    nextTick(() => setActiveUnderline());
  },
  { immediate: true },
);

onMounted(() => {
  nextTick(() => setActiveUnderline(true));
});
</script>

<style scoped>
.tabs-navigation {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #34373d;
}

.tab-button {
  background: none;
  border: none;
  padding: 15px 30px;
  font-size: 18px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  color: #b4bbc5;
  cursor: pointer;
  position: relative;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

.tab-button.active-tab {
  color: #ffffff;
}

.tab-button:hover {
  color: #ffffff;
}

.tab-button:focus-visible {
  box-shadow: 0 0 0 2px #6c5dd3;
  border-radius: 4px;
}

.tab-underline {
  position: absolute;
  bottom: -1px;
  height: 3px;
  background: linear-gradient(90deg, #6c5dd3, #7a6cdf);
  border-radius: 3px 3px 0 0;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 12px rgba(108, 93, 211, 0.4);
  pointer-events: none;
}

@media (max-width: 768px) {
  .tabs-navigation {
    flex-direction: column;
    align-items: center;
  }

  .tab-button {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 576px) {
  .tabs-navigation {
    margin-bottom: 20px;
  }

  .tab-button {
    padding: 10px 15px;
    font-size: 16px;
  }
}
</style>
