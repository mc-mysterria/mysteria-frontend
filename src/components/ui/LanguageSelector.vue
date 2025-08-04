<template>
  <div class="language-selector">
    <DropdownSelect
      :model-value="currentLanguage"
      :options="languageOptions"
      @change="handleLanguageChange"
      class="language-dropdown"
    >
      <template #selected="{ selectedOption }">
        {{ selectedOption?.label || '🇬🇧 EN' }}
      </template>
      <template #option="{ option }">
        {{ option.label }}
      </template>
    </DropdownSelect>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n, type Language } from '@/composables/useI18n'
import DropdownSelect, { type ComponentProps } from './DropdownSelect.vue'

interface DropdownOption {
  label: string;
  value: string | number;
  [key: string]: string | number | undefined;
}

const { currentLanguage, setLanguage } = useI18n()

const languageOptions = computed(() => [
  { label: '🇬🇧 EN', value: 'en' },
  { label: '🇺🇦 UK', value: 'uk' }
])

const handleLanguageChange = (value: string | number | string[], option: DropdownOption | null) => {
  setLanguage(value as Language)
}
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-dropdown :deep(.dropdown-trigger) {
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
  min-height: auto;
  box-shadow: none;
}

.language-dropdown :deep(.dropdown-trigger:hover:not(.is-disabled)) {
  background: #8b7eff;
  border-color: rgba(255, 255, 255, 0.5);
}

.language-dropdown :deep(.dropdown-trigger.is-open) {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px #8b7eff;
}
</style>
