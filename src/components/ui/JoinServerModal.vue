<template>
  <div
      v-if="show"
      class="modal-overlay"
      @click.self="$emit('close')"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{{ t('home.joinServerTitle') }}</h2>
        <button
            aria-label="Close modal"
            class="modal-close"
            @click="$emit('close')"
        >
          <IconX class="w-6 h-6"/>
        </button>
      </div>

      <div class="modal-body">
        <div class="join-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>{{ t('home.step1Title') }}</h3>
            <p>{{ t('home.step1Description') }}</p>
          </div>
        </div>

        <div class="join-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>{{ t('home.step2Title') }}</h3>
            <p>{{ t('home.step2Description') }}</p>
            <div class="server-ip">
              <CopyIPButton ip="mc.mysterria.net"/>
            </div>
          </div>
        </div>

        <div class="join-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>{{ t('home.step3Title') }}</h3>
            <p>{{ t('home.step3Description') }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <RouterLink class="guide-link" to="/guide" @click="$emit('close')">
          <IconWiki class="w-4 h-4"/>
          {{ t('home.fullGuide') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineEmits, defineProps} from 'vue';
import CopyIPButton from './CopyIPButton.vue';
import IconWiki from '@/assets/icons/IconWiki.vue';
import IconX from '@/assets/icons/IconX.vue';
import {useI18n} from '@/composables/useI18n';

defineProps<{
  show: boolean;
}>();

defineEmits<{
  close: [];
}>();

const {t} = useI18n();
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid color-mix(in srgb, white 10%, transparent);
  margin-bottom: 24px;
  padding: 24px 24px 16px;
}

.modal-title {
  font-family: "Inter", serif;
  font-size: 24px;
  font-weight: 700;
  color: var(--myst-ink-strong);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #a1a1aa;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: var(--myst-ink-strong);
  background: color-mix(in srgb, white 10%, transparent);
}

.modal-body {
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.join-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  background: var(--myst-gold);
  color: var(--myst-bg);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h3 {
  color: var(--myst-ink-strong);
  font-weight: 600;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.step-content p {
  color: #a1a1aa;
  margin: 0;
  line-height: 1.5;
}

.server-ip {
  margin-top: 16px;
  width: 100%;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid color-mix(in srgb, white 10%, transparent);
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.guide-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 1px solid var(--myst-gold);
  border-radius: 6px;
  text-decoration: none;
  color: var(--myst-gold);
  font-weight: 600;
  transition: all 0.3s ease;
}

.guide-link:hover {
  background: var(--myst-gold);
  color: var(--myst-bg);
}
</style>
