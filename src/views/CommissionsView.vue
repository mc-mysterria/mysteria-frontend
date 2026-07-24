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

        <section class="terms-card">
          <div class="terms-header">
            <span class="terms-eyebrow">{{ t('commissions.terms.eyebrow') }}</span>
            <div class="terms-title-row">
              <h2 class="terms-title">{{ t('commissions.terms.title') }}</h2>
              <span class="terms-price">{{ t('commissions.terms.price') }}</span>
            </div>
          </div>

          <div class="terms-block">
            <h3 class="terms-block-title">{{ t('commissions.terms.whatIsItLabel') }}</h3>
            <p class="terms-text">{{ t('commissions.terms.whatIsIt') }}</p>
          </div>

          <div class="terms-block">
            <h3 class="terms-block-title">{{ t('commissions.terms.whatYouCanRequestLabel') }}</h3>
            <ul class="terms-list">
              <li v-for="(item, i) in tArray('commissions.terms.requestOptions')" :key="i">{{ item }}</li>
            </ul>
          </div>

          <div class="terms-block">
            <h3 class="terms-block-title">{{ t('commissions.terms.requirementsLabel') }}</h3>
            <ul class="terms-list terms-list--check">
              <li v-for="(item, i) in tArray('commissions.terms.requirements')" :key="i">
                <i class="fa-solid fa-check"></i>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="terms-block">
            <h3 class="terms-block-title">{{ t('commissions.terms.howItWorksLabel') }}</h3>
            <ol class="terms-steps">
              <li v-for="(step, i) in tArray('commissions.terms.howItWorksSteps')" :key="i">
                <span class="step-number">{{ i + 1 }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>

          <p class="terms-note">
            <i class="fa-solid fa-circle-info"></i>
            {{ t('commissions.terms.note') }}
          </p>
        </section>

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
const {t, tArray} = useI18n();

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

.terms-card {
  background: rgba(13, 16, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.terms-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.terms-eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 4px;
  margin-bottom: 8px;
  opacity: 0.6;
}

.terms-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.terms-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: var(--myst-offwhite);
}

.terms-price {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #05070a;
  background: var(--myst-gold);
  padding: 4px 12px;
  border-radius: 3px;
  white-space: nowrap;
}

.terms-block {
  margin-bottom: 22px;
}

.terms-block:last-of-type {
  margin-bottom: 0;
}

.terms-block-title {
  margin: 0 0 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.terms-text {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: #bbb;
}

.terms-list {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.terms-list li {
  font-size: 13.5px;
  line-height: 1.6;
  color: #ccc;
}

.terms-list--check {
  list-style: none;
  padding-left: 0;
}

.terms-list--check li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.terms-list--check i {
  color: var(--myst-gold);
  font-size: 11px;
  margin-top: 4px;
  flex-shrink: 0;
}

.terms-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.terms-steps li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13.5px;
  line-height: 1.6;
  color: #ccc;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 1px solid rgba(200, 178, 115, 0.4);
  color: var(--myst-gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  border-radius: 50%;
  margin-top: 1px;
}

.terms-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 24px 0 0;
  padding: 14px 16px;
  background: rgba(200, 178, 115, 0.06);
  border-left: 3px solid var(--myst-gold);
  color: #cdc3a8;
  font-size: 12.5px;
  line-height: 1.5;
}

.terms-note i {
  color: var(--myst-gold);
  padding-top: 2px;
}

@media (max-width: 600px) {
  .commissions-main {
    padding: 90px 0 40px;
  }

  .commissions-view {
    padding: 0 16px;
  }

  .terms-card {
    padding: 20px;
  }
}
</style>
