<template>
  <div v-if="profile" class="dollar">
    <a :href="donatelloUrl" target="_blank" class="addMoney">+</a>
    <IconBalance />{{ balanceStore.currentBalance?.amount ?? 0 }}
  </div>
</template>

<script setup lang="ts">
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { computed } from "vue";
import IconBalance from "@/assets/icons/IconBalance.vue";
const balanceStore = useBalanceStore();
const userStore = useUserStore();
const profile = computed(() => userStore.currentUser);
const donatelloUrl = computed(() => balanceStore.donatelloUrl);
</script>

<style scoped>
.dollar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  height: 40px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 14px;
  color: var(--myst-ink);
  backdrop-filter: blur(8px);
}

.dollar:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.addMoney {
  position: absolute;
  top: 0;
  right: -8px;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--myst-gold);
  cursor: pointer;
  text-decoration: none;
  color: var(--myst-bg);
  transition: all 0.3s ease;
  box-shadow:
    0 4px 16px rgba(16, 185, 129, 0.4),
    0 0 20px rgba(16, 185, 129, 0.3);
  border: 2px solid rgba(23, 26, 33, 1);
  backdrop-filter: blur(5px);
}

.addMoney:hover {
  background: linear-gradient(135deg, #22c55e 0%, #10b981 50%, #a0dc8e 100%);
  transform: translateY(-50%) scale(1.15) rotate(5deg);
  box-shadow:
    0 6px 25px rgba(16, 185, 129, 0.6),
    0 0 30px rgba(16, 185, 129, 0.4);
}

.addMoney:active {
  transform: translateY(-50%) scale(0.95);
}

.dollar svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .dollar {
    padding: 10px 16px;
    font-size: 0.9rem;
    margin-right: 12px;
  }

  .addMoney {
    width: 28px;
    height: 28px;
    font-size: 16px;
    right: -6px;
  }

  .dollar svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .dollar {
    padding: 8px 14px;
    font-size: 0.85rem;
    margin-right: 10px;
  }

  .addMoney {
    width: 24px;
    height: 24px;
    font-size: 14px;
    right: -4px;
  }
}
</style>
