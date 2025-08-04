<template>
  <HeaderItem />
  <UnauthorizedMessage
    v-if="!profile"
    :message="t('shopLoginRequired')"
  />

  <!-- Basic info section removed - simplified shop without applications -->

  <!-- Carrier Status Banner -->
  <!-- <CarrierStatusBanner
    v-if="profile"
    type="shop"
  />
  -->

  <div class="shop-container">
    <!-- Profile setup required message -->
    <div v-if="profile && !profile.nickname" class="profile-setup-message">
      <div class="setup-content">
        <i class="fa-solid fa-user-gear setup-icon"></i>
        <h2>{{ t('accountSetupRequired') }}</h2>
        <p>
          {{ t('shopAccessDescription') }}
        </p>
        <br>
        <p>
          {{ t('profileSetupInstructions') }}
        </p>
        <router-link to="/profile" class="setup-btn">
          <i class="fa-solid fa-arrow-right"></i>
          {{ t('goToProfile') }}
        </router-link>
      </div>
    </div>

    <div v-if="profile && profile.nickname" class="shop-content">
      <ShopItems />
    </div>

    <ModalItem ref="confirmModal" />
  </div>
  <FooterItem />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import { useBalanceStore } from "@/stores/balance";
import { useUserStore } from "@/stores/user";
import { useI18n } from "@/composables/useI18n";
import UnauthorizedMessage from "@/components/ui/UnauthorizedMessage.vue";
import ShopItems from "@/components/shop/ShopItems.vue";
import ModalItem from "@/components/ui/ModalItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
const userStore = useUserStore();
const profile = computed(() => userStore.currentUser);
const shopStore = useBalanceStore();
const { t } = useI18n();
const confirmModal = ref<InstanceType<typeof ModalItem> | null>(null);

watch(
  () => shopStore.currentPurchase,
  async (newPurchase) => {
    if (newPurchase && confirmModal.value) {
      await shopStore.fetchBalance();

      if (newPurchase.requiresServerSelection) {
        confirmModal.value.showModal(
          t('selectServerForItem'),
          t('purchase'),
          t('cancel'),
        );
        return;
      }

      if (
        !shopStore.balance ||
        shopStore.balance.amount.lessThan(newPurchase.price)
      ) {
        const amount = Math.ceil(
          Number(newPurchase.price.minus(shopStore.balance?.amount || 0)),
        );
        confirmModal.value.showModal(
          `${t('insufficientFundsMessage')} ${amount} Mysterria?`,
          t('topUp'),
          t('cancel'),
        );
      } else {
        confirmModal.value.showModal(
          t('confirmPurchaseMessage'),
          t('purchase'),
          t('cancel'),
        );
      }
    }
  },
  { deep: true },
);
</script>

<script lang="ts">
export default {
  name: "ShopView",
};
</script>

<style scoped>
/* Basic info wrapper removed - shop simplified */

.shop-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.shop-content {
  margin-top: 30px;
  width: 100%;
  overflow-x: hidden;
}

.unauthorized-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background-color: #23262c;
  border-radius: 7px;
  margin: 0 auto;
  max-width: 600px;
  padding: 30px;
  text-align: center;
}

.unauthorized-message p {
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 20px;
}

.profile-setup-message {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 20px;
}

.setup-content {
  background-color: #23262c;
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  max-width: 600px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border: 2px solid #6c5dd3;
}

.setup-icon {
  font-size: 48px;
  color: #6c5dd3;
  margin-bottom: 20px;
}

.setup-content h2 {
  color: #ffffff;
  font-size: 28px;
  font-family: "MontserratSemiBold", system-ui, sans-serif;
  margin-bottom: 20px;
}

.setup-content p {
  color: #b4bbc5;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;
}

.setup-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: #6c5dd3;
  color: white;
  text-decoration: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.setup-btn:hover {
  background-color: #7a6cdf;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(108, 93, 211, 0.3);
}

.setup-btn i {
  font-size: 14px;
}

/* Mobile basic info styles removed */

@media (max-width: 576px) {
  .shop-container {
    padding: 10px;
    max-width: 100%;
  }

  .shop-content {
    margin-top: 20px;
  }

  .profile-setup-message {
    min-height: 300px;
    padding: 10px;
  }

  .setup-content {
    padding: 25px;
    border-radius: 10px;
  }

  .setup-icon {
    font-size: 36px;
    margin-bottom: 15px;
  }

  .setup-content h2 {
    font-size: 22px;
    margin-bottom: 15px;
  }

  .setup-content p {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .setup-btn {
    padding: 12px 24px;
    font-size: 14px;
    margin-top: 15px;
  }
}
</style>
