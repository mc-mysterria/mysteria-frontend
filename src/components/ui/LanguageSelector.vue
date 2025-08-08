<template>
  <div class="language-selector">
    <DropdownSelect
      :model-value="currentLanguage"
      :options="languageOptions"
      @change="handleLanguageChange"
      class="language-dropdown"
    >
      <template #selected="{ selectedOption }">
        {{ selectedOption?.label || "🇬🇧 EN" }}
      </template>
      <template #option="{ option }">
        {{ option.label }}
      </template>
    </DropdownSelect>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n, type Language } from "@/composables/useI18n";
import DropdownSelect from "./DropdownSelect.vue";
import { authAPI } from "@/utils/api/auth";
const { currentLanguage, setLanguage } = useI18n();

const languageOptions = computed(() => [
  { label: "🇬🇧 EN", value: "en" },
  { label: "🇺🇦 UK", value: "uk" },
]);

const handleLanguageChange = async (value: string | number | string[]) => {
  const language = value as Language;
  setLanguage(language);

  try {
    await authAPI.updateUserProfile({ lang: language });
  } catch (error) {
    console.error("Failed to update language preference:", error);
  }
};

onMounted(async () => {
  try {
    const user = await authAPI.getCurrentUser();
    if (user?.lang && user.lang !== currentLanguage.value) {
      setLanguage(user.lang as Language);
    }
  } catch (error) {
    console.error("Failed to fetch user language preference:", error);
  }
});
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-dropdown :deep(.dropdown-trigger) {
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  color: var(--myst-ink);
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  min-height: 40px;
  height: 40px;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-dropdown :deep(.dropdown-trigger:hover:not(.is-disabled)) {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.language-dropdown :deep(.dropdown-trigger.is-open) {
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 2px #10b981;
}
</style>
