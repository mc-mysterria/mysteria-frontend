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
import { computed, onMounted } from 'vue'
import { useI18n, type Language } from '@/composables/useI18n'
import DropdownSelect from './DropdownSelect.vue'
import { authAPI } from '@/utils/api/auth'
const { currentLanguage, setLanguage } = useI18n()

const languageOptions = computed(() => [
  { label: '🇬🇧 EN', value: 'en' },
  { label: '🇺🇦 UK', value: 'uk' }
])

const handleLanguageChange = async (value: string | number | string[]) => {
  const language = value as Language
  setLanguage(language)

  try {
    await authAPI.updateUserProfile({ lang: language })
  } catch (error) {
    console.error('Failed to update language preference:', error)
  }
}

onMounted(async () => {
  try {
    const user = await authAPI.getCurrentUser()
    if (user?.lang && user.lang !== currentLanguage.value) {
      setLanguage(user.lang as Language)
    }
  } catch (error) {
    console.error('Failed to fetch user language preference:', error)
  }
})
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
