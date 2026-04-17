<template>
  <div class="user-ritual-selector">
    <label v-if="label" class="ritual-label">{{ label }}</label>

    <div class="ritual-search-wrapper">
      <input
          v-model="searchQuery"
          :class="['ritual-search-input', { 'is-selected': isUserSelected }]"
          :disabled="disabled"
          :placeholder="placeholder || t('selectRecipient')"
          type="text"
          @input="handleSearchInput"
      />
      <div class="ritual-search-icon">
        <i v-if="isLoading" class="fa-solid fa-spinner fa-spin"></i>
        <i v-else-if="isUserSelected" class="fa-solid fa-check-double success-ritual"></i>
        <i v-else class="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>

    <Transition name="ritual-fade">
      <div v-if="userOptions.length > 0" class="ritual-results no-scrollbar">
        <div
            v-for="user in userOptions"
            :key="user.value"
            :class="{ selected: modelValue === user.value }"
            class="ritual-user-option"
            @click="handleUserSelect(user.value)"
        >
          <div class="user-ritual-info">
            <div class="user-ritual-name">
              {{ user.label }}
              <i v-if="user.verified" :title="t('verified')" class="fa-solid fa-certificate gold-seal"></i>
            </div>
            <div v-if="user.description" class="user-ritual-desc">{{ user.description }}</div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="!isLoading && !isUserSelected && searchQuery.length >= 2 && userOptions.length === 0" class="ritual-no-results">
      {{ t('noUsersFound') || 'No verified users found' }}
    </div>

    <div v-if="error" class="ritual-error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
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

const userOptions = computed(() => {
  return users.value
      .filter(user => user.verified)
      .map(user => ({
        label: user.nickname || user.discordId || user.email || 'Unknown',
        value: user.id,
        description: user.email || user.discordId || '',
        verified: user.verified,
      }));
});

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

const handleSearchInput = () => {
  isUserSelected.value = false;
  performSearch(searchQuery.value);
};

const handleUserSelect = (userId: string) => {
  if (props.disabled) return;
  const selectedUser = userOptions.value.find(u => u.value === userId);
  if (selectedUser) {
    searchQuery.value = selectedUser.label;
  }
  emit('update:modelValue', userId);
  isUserSelected.value = true;
  users.value = [];
};
</script>

<style scoped>
.user-ritual-selector { position: relative; width: 100%; }

.ritual-label {
  display: block; margin-bottom: 12px;
  font-family: 'Playfair Display', serif; font-size: 14px;
  color: var(--myst-gold); text-transform: uppercase; letter-spacing: 2px;
}

.ritual-search-wrapper { position: relative; }

.ritual-search-input {
  width: 100%; padding: 14px 44px 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px;
  transition: all 0.3s ease;
}

.ritual-search-input:focus {
  outline: none; border-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.05);
  box-shadow: 0 0 20px rgba(200, 178, 115, 0.1);
}

.ritual-search-input.is-selected {
  border-color: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.ritual-search-icon {
  position: absolute; right: 16px; top: 50%;
  transform: translateY(-50%); color: #444; font-size: 14px;
}

.success-ritual { color: #4ade80; }

.ritual-results {
  position: absolute; top: calc(100% + 12px); left: 0; right: 0;
  max-height: 240px; overflow-y: auto;
  background: #080a14; border: 1px solid rgba(200, 178, 115, 0.2);
  border-radius: 4px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
  z-index: 1000;
}

.ritual-user-option {
  padding: 14px 16px; cursor: pointer;
  transition: all 0.2s ease; border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.ritual-user-option:last-child { border-bottom: none; }

.ritual-user-option:hover { background: rgba(255, 255, 255, 0.03); }

.ritual-user-option.selected {
  background: rgba(200, 178, 115, 0.05);
  border-left: 2px solid var(--myst-gold);
}

.user-ritual-info { display: flex; flex-direction: column; gap: 4px; }

.user-ritual-name {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Playfair Display', serif; font-size: 16px; color: #fff;
}

.gold-seal { color: var(--myst-gold); font-size: 12px; }

.user-ritual-desc { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555; }

.ritual-no-results {
  padding: 16px; text-align: center;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #444;
}

.ritual-error {
  display: flex; align-items: center; gap: 8px; margin-top: 12px;
  color: #ff5252; font-size: 13px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }

.ritual-fade-enter-active, .ritual-fade-leave-active { transition: all 0.3s ease; }
.ritual-fade-enter-from, .ritual-fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
