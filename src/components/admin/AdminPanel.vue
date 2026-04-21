<template>
  <div class="admin-panel">
    <!-- Header -->
    <div class="page-header">
      <button class="back-button" @click="goBack">
        <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <div class="header-identity">
        <div class="header-badge">
          <svg fill="none" height="18" stroke="currentColor" viewBox="0 0 24 24" width="18" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1 class="page-title">Admin Panel</h1>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="admin-tabs">
      <button
        :class="{ active: activeTab === 'users' }"
        class="tab-btn"
        @click="activeTab = 'users'"
      >
        <svg fill="none" height="15" stroke="currentColor" viewBox="0 0 24 24" width="15" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        Users
      </button>
      <button
        :class="{ active: activeTab === 'permissions' }"
        class="tab-btn"
        @click="activeTab = 'permissions'"
      >
        <svg fill="none" height="15" stroke="currentColor" viewBox="0 0 24 24" width="15" stroke-width="2">
          <rect height="11" rx="2" ry="2" width="18" x="3" y="11"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Role Permissions
      </button>
    </div>

    <!-- Users Tab -->
    <div v-if="activeTab === 'users'">
      <!-- User Selection -->
      <div class="section">
        <h2 class="section-title">User Management</h2>

        <div class="controls">
          <div class="search-box">
            <input
                v-model="searchQuery"
                class="search-input"
                placeholder="Search by nickname, email, or Discord ID..."
                type="text"
            />
          </div>
          <button :disabled="loading" class="refresh-btn" @click="() => loadUsers()">
            <svg fill="none" height="15" stroke="currentColor" viewBox="0 0 24 24" width="15">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Refresh
          </button>
        </div>

        <div class="user-list">
          <div
              v-for="user in users"
              :key="user.id"
              :class="{ 'selected': selectedUser?.id === user.id }"
              class="user-item"
              @click="selectUser(user)"
          >
            <div class="user-info">
              <div class="user-name">
                {{ user.nickname || `User#${user.discordId}` }}
                <span :class="`role-${user.role.toLowerCase()}`" class="user-badge">
                  {{ user.role }}
                </span>
              </div>
              <div class="user-details">
                <span>Discord ID: {{ user.discordId }}</span>
                <span v-if="user.email">Email: {{ user.email }}</span>
                <span>Balance: {{ user.balance }}₴</span>
              </div>
            </div>
          </div>

          <div v-if="users.length === 0 && !loading" class="no-users">
            {{ searchQuery ? 'No users found matching your search' : 'No users available' }}
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="pagination">
          <button
              :disabled="currentPage === 0 || loading"
              class="pagination-btn"
              @click="() => goToPage(currentPage - 1)"
          >
            <svg fill="none" height="14" stroke="currentColor" viewBox="0 0 24 24" width="14">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Previous
          </button>

          <div class="pagination-info">
            Page {{ currentPage + 1 }} of {{ totalPages }}
            <span class="total-count">({{ totalElements }} total)</span>
          </div>

          <button
              :disabled="currentPage >= totalPages - 1 || loading"
              class="pagination-btn"
              @click="() => goToPage(currentPage + 1)"
          >
            Next
            <svg fill="none" height="14" stroke="currentColor" viewBox="0 0 24 24" width="14">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Role Management -->
      <div v-if="selectedUser" class="section">
        <h2 class="section-title">Change User Role</h2>

        <div class="form-card">
          <div class="form-group">
            <label>Selected User</label>
            <div class="selected-user-info">
              <strong>{{ selectedUser.nickname || `User#${selectedUser.discordId}` }}</strong>
              <span>Current Role: <span :class="`role-${selectedUser.role.toLowerCase()}`"
                                        class="role-badge">{{ selectedUser.role }}</span></span>
            </div>
          </div>

          <div class="form-group">
            <label>New Role *</label>
            <select v-model="selectedRole" required>
              <option value="">Select a role</option>
              <option
                  v-for="role in availableRoles"
                  :key="role.value"
                  :value="role.value"
              >
                {{ role.label }} — {{ role.description }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button
                :disabled="!selectedRole || selectedRole === selectedUser.role || loading"
                class="action-btn primary"
                @click="changeRole"
            >
              <span v-if="loading" class="button-spinner"></span>
              {{ loading ? 'Changing Role…' : 'Change Role' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Balance Management -->
      <div v-if="selectedUser" class="section">
        <h2 class="section-title">Adjust User Balance</h2>

        <div class="form-card">
          <div class="form-group">
            <label>Selected User</label>
            <div class="selected-user-info">
              <strong>{{ selectedUser.nickname || `User#${selectedUser.discordId}` }}</strong>
              <span>Current Balance: <strong>{{ selectedUser.balance }}₴</strong></span>
            </div>
          </div>

          <div class="form-group">
            <label>Amount *</label>
            <input
                v-model.number="balanceAmount"
                :class="{ 'error': validationErrors.balanceAmount }"
                placeholder="Positive to add, negative to subtract"
                required
                step="0.01"
                type="number"
            />
            <small>
              New balance will be: {{ (selectedUser.balance + (balanceAmount || 0)).toFixed(2) }}₴
            </small>
            <div v-if="validationErrors.balanceAmount" class="field-error">
              {{ validationErrors.balanceAmount }}
            </div>
          </div>

          <div class="form-group">
            <label>Reason *</label>
            <textarea
                v-model="balanceReason"
                :class="{ 'error': validationErrors.balanceReason }"
                placeholder="Enter the reason for this balance adjustment..."
                required
                rows="3"
            ></textarea>
            <div v-if="validationErrors.balanceReason" class="field-error">
              {{ validationErrors.balanceReason }}
            </div>
          </div>

          <div class="form-actions">
            <button
                :disabled="!canAdjustBalance || loading"
                class="action-btn primary"
                @click="adjustBalance"
            >
              <span v-if="loading" class="button-spinner"></span>
              {{ loading ? 'Adjusting…' : 'Adjust Balance' }}
            </button>
            <button
                :disabled="loading"
                class="action-btn secondary"
                @click="clearBalanceForm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="loading && users.length === 0" class="loading">
        <div class="loading-spinner"></div>
        Loading users...
      </div>
    </div>

    <!-- Role Permissions Tab -->
    <div v-if="activeTab === 'permissions'">
      <div class="section">
        <h2 class="section-title">Role Permissions</h2>
        <p class="section-desc">Toggle permissions per role. Changes are auto-saved after each update.</p>
        <RolePermissionsEditor />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {adminAPI} from '@/utils/api/admin.ts';
import {USER_ROLES} from '@/types/admin.ts';
import type {UserProfileDto} from '@/types/auth.ts';
import RolePermissionsEditor from '@/components/admin/RolePermissionsEditor.vue';

const router = useRouter();

// Tab state
const activeTab = ref<'users' | 'permissions'>('users');

// State
const users = ref<UserProfileDto[]>([]);
const selectedUser = ref<UserProfileDto | null>(null);
const selectedRole = ref<string>('');
const balanceAmount = ref<number>(0);
const balanceReason = ref<string>('');
const searchQuery = ref<string>('');
const loading = ref(false);
const error = ref<string>('');
const successMessage = ref<string>('');
const validationErrors = ref<Record<string, string>>({});

// Pagination state
const currentPage = ref<number>(0);
const pageSize = ref<number>(20);
const totalPages = ref<number>(0);
const totalElements = ref<number>(0);

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Computed
const availableRoles = computed(() => USER_ROLES);

const canAdjustBalance = computed(() => {
  return selectedUser.value &&
      balanceAmount.value !== 0 &&
      balanceReason.value.trim() !== '' &&
      Object.keys(validationErrors.value).length === 0;
});

// Methods
const showSuccess = (message: string) => {
  successMessage.value = message;
  error.value = '';
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
};

const showError = (message: string) => {
  error.value = message;
  successMessage.value = '';
};

const goBack = () => {
  router.push('/profile');
};

const loadUsers = async (page: number = currentPage.value) => {
  try {
    loading.value = true;
    error.value = '';
    const response = await adminAPI.getUsers(
        page,
        pageSize.value,
        searchQuery.value || undefined,
        'createdAt,desc'
    );

    users.value = response.data.content;
    currentPage.value = response.data.number;
    totalPages.value = response.data.totalPages;
    totalElements.value = response.data.totalElements;
  } catch (err) {
    console.error('Failed to load users:', err);
    showError('Failed to load users. Please check your permissions.');
  } finally {
    loading.value = false;
  }
};

const goToPage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    loadUsers(page);
  }
};

watch(searchQuery, () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(() => {
    currentPage.value = 0;
    loadUsers(0);
  }, 500);
});

const selectUser = (user: UserProfileDto) => {
  selectedUser.value = user;
  selectedRole.value = '';
  clearBalanceForm();
  error.value = '';
  validationErrors.value = {};
};

const validateBalanceForm = (): boolean => {
  const errors: Record<string, string> = {};

  if (!balanceAmount.value || balanceAmount.value === 0) {
    errors.balanceAmount = 'Amount cannot be zero';
  }

  if (!balanceReason.value || balanceReason.value.trim() === '') {
    errors.balanceReason = 'Reason is required';
  } else if (balanceReason.value.length < 10) {
    errors.balanceReason = 'Reason must be at least 10 characters';
  }

  validationErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const changeRole = async () => {
  if (!selectedUser.value || !selectedRole.value) return;

  if (!confirm(`Are you sure you want to change ${selectedUser.value.nickname || 'this user'}'s role from ${selectedUser.value.role} to ${selectedRole.value}?`)) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    await adminAPI.changeUserRole(selectedUser.value.id, selectedRole.value);

    selectedUser.value.role = selectedRole.value;
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value!.id);
    if (userIndex !== -1) {
      users.value[userIndex].role = selectedRole.value;
    }

    showSuccess(`Successfully changed role to ${selectedRole.value}`);
    selectedRole.value = '';
  } catch (err) {
    console.error('Failed to change role:', err);
    showError('Failed to change user role. Please try again.');
  } finally {
    loading.value = false;
  }
};

const adjustBalance = async () => {
  if (!selectedUser.value || !validateBalanceForm()) {
    return;
  }

  const newBalance = selectedUser.value.balance + balanceAmount.value;

  if (!confirm(`Are you sure you want to adjust ${selectedUser.value.nickname || 'this user'}'s balance by ${balanceAmount.value > 0 ? '+' : ''}${balanceAmount.value}₴?\n\nCurrent: ${selectedUser.value.balance}₴\nNew: ${newBalance.toFixed(2)}₴\n\nReason: ${balanceReason.value}`)) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const response = await adminAPI.adjustUserBalance(
        selectedUser.value.id,
        balanceAmount.value,
        balanceReason.value
    );

    selectedUser.value.balance = response.data.balanceAfter;
    const userIndex = users.value.findIndex(u => u.id === selectedUser.value!.id);
    if (userIndex !== -1) {
      users.value[userIndex].balance = response.data.balanceAfter;
    }

    showSuccess(`Successfully adjusted balance by ${balanceAmount.value > 0 ? '+' : ''}${balanceAmount.value}₴. New balance: ${response.data.balanceAfter}₴`);
    clearBalanceForm();
  } catch (err) {
    console.error('Failed to adjust balance:', err);
    showError('Failed to adjust balance. Please try again.');
  } finally {
    loading.value = false;
  }
};

const clearBalanceForm = () => {
  balanceAmount.value = 0;
  balanceReason.value = '';
  validationErrors.value = {};
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-panel {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  color: var(--myst-ink-muted);
}

.back-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 70%, var(--myst-gold));
  color: var(--myst-ink);
  transform: translateX(-2px);
}

.header-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent);
  border-radius: 8px;
  color: var(--myst-gold);
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-ink);
  letter-spacing: -0.01em;
}

/* Tab Navigation */
.admin-tabs {
  display: flex;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  margin-bottom: 28px;
  gap: 2px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink-muted);
  border-radius: 6px 6px 0 0;
  transition: color 0.2s ease, background 0.15s ease;
}

.tab-btn:hover {
  color: var(--myst-ink);
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
}

.tab-btn.active {
  color: var(--myst-gold);
  border-bottom-color: var(--myst-gold);
}

/* Sections */
.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--myst-ink);
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.section-desc {
  font-size: 13px;
  color: var(--myst-ink-muted);
  margin: 0 0 16px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-box {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 11px 15px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: var(--myst-bg-2);
  color: var(--myst-ink);
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 18px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  background: color-mix(in srgb, var(--myst-ink-muted) 50%, transparent);
  cursor: not-allowed;
}

/* User List */
.user-list {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 10px;
  overflow: hidden;
  max-height: 380px;
  overflow-y: auto;
}

.user-item {
  padding: 14px 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-item:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 60%, var(--myst-gold));
}

.user-item.selected {
  background: color-mix(in srgb, var(--myst-bg-2) 40%, var(--myst-gold));
  border-left: 3px solid var(--myst-gold);
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--myst-ink);
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-badge, .role-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-user {
  background: color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  color: var(--myst-ink-muted);
}

.role-player {
  background: color-mix(in srgb, #3b82f6 25%, transparent);
  color: #60a5fa;
}

.role-moderator {
  background: color-mix(in srgb, #f59e0b 25%, transparent);
  color: #fbbf24;
}

.role-leader {
  background: color-mix(in srgb, #ec4899 25%, transparent);
  color: #f472b6;
}

.role-admin {
  background: color-mix(in srgb, #ef4444 25%, transparent);
  color: #f87171;
}

.role-owner {
  background: color-mix(in srgb, #8b5cf6 25%, transparent);
  color: #a78bfa;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: var(--myst-ink-muted);
}

.no-users {
  padding: 40px 20px;
  text-align: center;
  color: var(--myst-ink-muted);
  font-size: 14px;
}

/* Form Card */
.form-card {
  background: var(--myst-bg-2);
  padding: 22px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.form-group {
  margin-bottom: 18px;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--myst-ink);
  font-size: 13px;
  margin-bottom: 7px;
}

.form-group small {
  display: block;
  color: var(--myst-ink-muted);
  font-size: 12px;
  margin-top: 5px;
}

.selected-user-info {
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
  padding: 10px 14px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-user-info strong {
  color: var(--myst-ink);
  font-size: 14px;
}

.selected-user-info span {
  color: var(--myst-ink-muted);
  font-size: 13px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 7px;
  font-family: inherit;
  font-size: 13px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 15%, transparent);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.form-group input.error:focus,
.form-group select.error:focus,
.form-group textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.field-error {
  color: #ef4444;
  font-size: 11px;
  font-weight: 500;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

.action-btn {
  padding: 10px 22px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 7px;
}

.action-btn.primary {
  background: #10b981;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.action-btn.secondary {
  background: var(--myst-bg);
  color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.action-btn.secondary:hover:not(:disabled) {
  color: var(--myst-ink);
  border-color: color-mix(in srgb, var(--myst-ink-muted) 60%, transparent);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.button-spinner {
  width: 13px;
  height: 13px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top: 1.5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Messages */
.loading {
  text-align: center;
  padding: 32px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  background: var(--myst-bg-2);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-top: 2px solid var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-message {
  background: color-mix(in srgb, #10b981 12%, transparent);
  color: #10b981;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #10b981 35%, transparent);
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 500;
}

.error-message {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
  padding: 14px 18px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #ef4444 35%, transparent);
  margin-bottom: 20px;
  font-size: 13px;
  font-weight: 500;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  background: color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink);
}

.pagination-info .total-count {
  font-size: 11px;
  font-weight: 400;
  color: var(--myst-ink-muted);
}
</style>
