<template>
  <button
      class="btn-copy-ritual"
      type="button"
      @click="copyToClipboard"
  >
    <span class="btn-label">{{ t('serverAddress') }}</span>
    <div class="btn-icon">
      <i :class="isCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
    </div>
    
    <Transition name="fade">
      <span v-if="isCopied" class="copy-success-tooltip">{{ t('copySuccess') }}</span>
    </Transition>
  </button>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useI18n} from "@/composables/useI18n";

const {t} = useI18n();
const isCopied = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(t('serverAddress'));
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};
</script>

<style scoped>
.btn-copy-ritual {
  display: inline-flex;
  align-items: center;
  gap: 0;
  background: #05070a;
  border: 1px solid rgba(200, 178, 115, 0.2);
  padding: 0;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.btn-label {
  padding: 10px 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--myst-gold);
  letter-spacing: 1px;
}

.btn-icon {
  padding: 10px 14px;
  background: rgba(200, 178, 115, 0.1);
  border-left: 1px solid rgba(200, 178, 115, 0.2);
  color: var(--myst-gold);
  font-size: 14px;
}

.btn-copy-ritual:hover {
  border-color: var(--myst-gold);
  box-shadow: 0 0 20px rgba(200, 178, 115, 0.1);
}

.btn-copy-ritual:hover .btn-icon {
  background: var(--myst-gold);
  color: #05070a;
}

.copy-success-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--myst-gold);
  color: #05070a;
  padding: 4px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
}

.copy-success-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--myst-gold);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(5px); }
</style>
