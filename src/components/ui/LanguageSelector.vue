<template>
  <div class="language-selector">
    <select
      :value="currentLanguage"
      @change="handleLanguageChange"
      class="language-select"
    >
      <option value="en">🇬🇧 EN</option>
      <option value="uk">🇺🇦 UK</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n, type Language } from '@/composables/useI18n'

const { currentLanguage, setLanguage } = useI18n()

const handleLanguageChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setLanguage(target.value as Language)
}
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-select {
  background: rgba(139, 126, 255, 0.5);
  border: 1px solid #8b7eff;
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.language-select:hover {
  background: #8b7eff;
  border-color: rgba(255, 255, 255, 0.5);
}

.language-select:focus {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px #8b7eff;
}

.language-select option {
  background: rgba(255, 255, 255, 0.1);
  color: #1a1a2e;
  padding: 8px;
}
</style>
