<template>
  <div class="lang-ritual-selector">
    <button
        v-for="lang in ['en', 'uk']"
        :key="lang"
        :class="{ active: currentLanguage === lang }"
        class="lang-ritual-btn"
        @click="setLanguage(lang as Language)"
    >
      <span class="lang-label">{{ lang }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import type {Language} from "@/composables/useI18n";
import {useI18n} from "@/composables/useI18n";

const {currentLanguage, setLanguage} = useI18n();
</script>

<style scoped>
.lang-ritual-selector {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.lang-ritual-btn {
  background: transparent;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.lang-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  color: #444;
  letter-spacing: 1px;
}

.lang-ritual-btn.active {
  background: rgba(200, 178, 115, 0.1);
}

.lang-ritual-btn.active .lang-label {
  color: var(--myst-gold);
  font-weight: 700;
}

.lang-ritual-btn:hover:not(.active) .lang-label {
  color: #888;
}
</style>
