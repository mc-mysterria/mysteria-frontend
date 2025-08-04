<template>
  <div class="carrier-status-banner" :class="bannerClass">
    <div class="banner-icon">
      <i :class="iconClass"></i>
    </div>
    <div class="banner-content">
      <h3 class="banner-title">{{ title }}</h3>
      <p class="banner-message">{{ message }}</p>
      <p v-if="additionalInfo" class="banner-additional">{{ additionalInfo }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type: 'shop' | 'form'
}

const props = defineProps<Props>()

const bannerClass = computed(() => {
  return {
    'shop-banner': props.type === 'shop',
    'form-banner': props.type === 'form'
  }
})

const iconClass = computed(() => {
  return props.type === 'shop'
    ? 'fa-solid fa-shopping-cart'
    : 'fa-solid fa-file-text'
})

const title = computed(() => {
  return props.type === 'shop'
    ? 'Крамниця тимчасово недоступна'
    : 'Анкети тимчасово не працюють'
})

const message = computed(() => {
  if (props.type === 'shop') {
    return 'Система передачі покупок до Minecraft тимчасово недоступна. Якщо ви щось придбали, будь ласка, зверніться до підтримки в Discord для отримання вашої покупки.'
  } else {
    return 'Система збереження анкет тимчасово недоступна. Ваші анкети будуть перевірені пізніше, коли систему буде відновлено.'
  }
})

const additionalInfo = computed(() => {
  if (props.type === 'shop') {
    return 'Ви все ще можете здійснювати покупки, але їх доставка буде затримана.'
  } else {
    return 'Приносимо наші вибачення за незручності. Ми працюємо над відновленням системи.'
  }
})
</script>

<style scoped>
.carrier-status-banner {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  margin: 20px auto;
  max-width: 1200px;
  border-radius: 12px;
  border: 1px solid;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: slideInDown 0.5s ease-out;
  position: relative;
}

.carrier-status-banner.shop-banner {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
  color: #ff9800;
}

.carrier-status-banner.form-banner {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
  color: #2196f3;
}

.banner-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.banner-content {
  flex: 1;
}

.banner-title {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: inherit;
}

.banner-message {
  margin: 0 0 8px 0;
  font-size: 1rem;
  line-height: 1.5;
  color: inherit;
  opacity: 0.9;
}

.banner-additional {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: inherit;
  opacity: 0.8;
  font-style: italic;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .carrier-status-banner {
    margin: 20px;
    padding: 16px;
    gap: 12px;
  }

  .banner-icon {
    font-size: 1.3rem;
  }

  .banner-title {
    font-size: 1.1rem;
  }

  .banner-message {
    font-size: 0.9rem;
  }

  .banner-additional {
    font-size: 0.8rem;
  }
}
</style>
