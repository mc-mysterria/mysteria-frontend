<template>
  <div class="page-container">
    <HeaderItem/>

    <main class="commissions-main">
      <div class="commissions-view">
        <div class="page-header">
          <button class="back-button" @click="router.push('/profile')">
            <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            {{ t('back') || 'Back' }}
          </button>
          <div class="title-block">
            <h1 class="page-title">{{ t('commissions.pageTitle') }}</h1>
            <p class="page-subtitle">{{ t('commissions.pageSubtitle') }}</p>
          </div>
        </div>

        <CommissionForm @submitted="handleSubmitted"/>
        <MyCommissionsList ref="myCommissionsRef"/>
      </div>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useI18n} from '@/composables/useI18n';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import CommissionForm from '@/components/commissions/CommissionForm.vue';
import MyCommissionsList from '@/components/commissions/MyCommissionsList.vue';

const router = useRouter();
const {t} = useI18n();

const myCommissionsRef = ref<InstanceType<typeof MyCommissionsList> | null>(null);

const handleSubmitted = () => {
  myCommissionsRef.value?.reload();
};
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.commissions-main {
  flex: 1 0 auto;
  background: var(--myst-bg);
  padding: 100px 0 60px;
}

.commissions-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  transition: all 0.2s ease;
}

.back-button:hover {
  color: var(--myst-gold);
  border-color: rgba(200, 178, 115, 0.3);
}

.title-block {
  flex: 1;
}

.page-title {
  margin: 0 0 4px;
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  color: var(--myst-offwhite);
}

.page-subtitle {
  margin: 0;
  font-size: 13px;
  color: #888;
}

@media (max-width: 600px) {
  .commissions-main {
    padding: 90px 0 40px;
  }

  .commissions-view {
    padding: 0 16px;
  }
}
</style>
