<template>
  <div class="user-selector">
    <label v-if="label" class="selector-label">{{ label }}</label>

    <div class="search-input-wrapper">
      <input
          v-model="searchQuery"
          type="text"
          :placeholder="placeholder || t('selectRecipient')"
          :disabled="disabled"
          :class="['search-input', { 'is-selected': isUserSelected }]"
          @input="handleSearchInput"
      />
      <i v-if="isLoading" class="fa-solid fa-spinner fa-spin search-icon"></i>
      <i v-else-if="isUserSelected" class="fa-solid fa-circle-check search-icon success-icon"></i>
      <i v-else class="fa-solid fa-search search-icon"></i>
    </div>

    <div v-if="userOptions.length > 0" class="user-results">
      <div
          v-for="user in userOptions"
          :key="user.value"
          class="user-option"
          :class="{ selected: modelValue === user.value }"
          @click="handleUserSelect(user.value)"
      >
        <div class="user-info">
          <div class="user-name">
            {{ user.label }}
            <i v-if="user.verified" class="fa-solid fa-certificate verified-badge" :title="t('verified')"></i>
          </div>
          <div v-if="user.description" class="user-description">{{ user.description }}</div>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && !isUserSelected && searchQuery.length >= 2 && userOptions.length === 0" class="no-results">
      {{ t('noUsersFound') || 'No verified users found' }}
    </div>

    <div v-if="error" class="error-message">
      <i class="fa-solid fa-exclamation-circle"></i>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useI18n} from '@/composables/useI18n';
import {usersAPI} from '@/utils/api/users';
import type {UserSearchDto} from '@/types/users';
import {debounce} from 'lodash-es';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const {t} = useI18n();
const users = ref<UserSearchDto[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const isUserSelected = ref(false);

// Transform users to dropdown options
const userOptions = computed(() => {
  return users.value
      .filter(user => user.verified) // Only show verified users
      .map(user => ({
        label: user.nickname || user.discordId || user.email || 'Unknown',
        value: user.id,
        description: user.email || user.discordId || '',
        verified: user.verified,
      }));
});

// Debounced search function
const performSearch = debounce(async (query: string) => {
  if (!query || query.trim().length < 2) {
    users.value = [];
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await usersAPI.searchUsers(query.trim());
    users.value = response.data;
  } catch (err) {
    console.error('Error searching users:', err);
    error.value = t('errorSearchingUsers') || 'Failed to search users. Please try again.';
    users.value = [];
  } finally {
    isLoading.value = false;
  }
}, 500);

// Handle search input
const handleSearchInput = () => {
  isUserSelected.value = false; // Reset selection state when user types
  performSearch(searchQuery.value);
};

// Handle user selection
const handleUserSelect = (userId: string) => {
  if (props.disabled) return;

  // Find the selected user to update the search query
  const selectedUser = userOptions.value.find(u => u.value === userId);
  if (selectedUser) {
    searchQuery.value = selectedUser.label;
  }

  emit('update:modelValue', userId);

  // Mark as selected and close the results
  isUserSelected.value = true;
  users.value = [];
};
</script>

<style scoped>
.user-selector {
  position: relative;
  width: 100%;
}

.selector-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--myst-ink-strong);
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 13px 40px 13px 16px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 10px;
  color: var(--myst-ink-strong);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.search-input.is-selected {
  border-color: color-mix(in srgb, #10b981 50%, transparent);
  background: color-mix(in srgb, #10b981 5%, transparent);
}

.search-input.is-selected:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px color-mix(in srgb, #10b981 20%, transparent);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--myst-ink-muted);
  font-size: 14px;
  pointer-events: none;
}

.success-icon {
  color: #10b981;
  font-size: 16px;
}

.user-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 25%, transparent);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.user-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
}

.user-option:last-child {
  border-bottom: none;
}

.user-option:hover {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.user-option.selected {
  background: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  border-left: 3px solid var(--myst-gold);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--myst-ink-strong);
}

.verified-badge {
  font-size: 12px;
  color: var(--myst-gold);
}

.user-description {
  font-size: 12px;
  color: var(--myst-ink-muted);
}

.no-results {
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: var(--myst-ink-muted);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: color-mix(in srgb, #ef4444 15%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
  border-radius: 6px;
  color: #ef4444;
  font-size: 13px;
}
</style>
