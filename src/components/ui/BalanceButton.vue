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
  padding: 12px 20px;
  margin-right: 16px;
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.15) 0%,
    rgba(75, 0, 130, 0.08) 50%,
    rgba(238, 120, 40, 0.05) 100%
  );
  border: 1px solid rgba(138, 43, 226, 0.4);
  border-radius: 16px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 16px rgba(138, 43, 226, 0.15),
    0 0 20px rgba(138, 43, 226, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 0.95rem;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.dollar:hover {
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.25) 0%,
    rgba(75, 0, 130, 0.15) 50%,
    rgba(238, 120, 40, 0.1) 100%
  );
  border-color: rgba(138, 43, 226, 0.6);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(138, 43, 226, 0.25),
    0 0 30px rgba(138, 43, 226, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.addMoney {
  position: absolute;
  top: 0;
  right: -8px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #10b981 0%, #16a34a 50%, #22c55e 100%);
  cursor: pointer;
  text-decoration: none;
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
