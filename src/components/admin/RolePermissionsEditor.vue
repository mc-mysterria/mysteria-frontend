<template>
  <div class="rpe">
    <div v-if="initialLoading" class="rpe-state">
      <div class="rpe-spinner"></div>
      Loading role data...
    </div>

    <div v-else-if="loadError" class="rpe-state rpe-state--error">
      <p>{{ loadError }}</p>
      <button class="rpe-retry-btn" @click="loadData">Retry</button>
    </div>

    <div v-else class="rpe-layout">
      <!-- Left: Role sidebar -->
      <div class="rpe-sidebar">
        <div class="rpe-sidebar-label">Roles</div>
        <button
          v-for="role in sortedRoles"
          :key="role.id"
          class="rpe-role-btn"
          :class="{ active: selectedRoleId === role.id }"
          @click="selectRole(role)"
        >
          <span class="rpe-role-name">{{ role.displayName }}</span>
          <div class="rpe-role-meta">
            <span v-if="role.isPremium" class="rpe-premium">PRO</span>
            <span class="rpe-perm-count">{{ localPermsByRole[role.id]?.size ?? role.permissions.length }}</span>
          </div>
        </button>
      </div>

      <!-- Right: Permission matrix -->
      <div class="rpe-matrix">
        <div v-if="!selectedRole" class="rpe-empty">
          Select a role to manage its permissions.
        </div>
        <template v-else>
          <div class="rpe-matrix-header">
            <div>
              <h3 class="rpe-role-title">{{ selectedRole.displayName }}</h3>
              <span class="rpe-role-desc">{{ selectedRole.description }}</span>
            </div>
            <div class="rpe-save-status">
              <template v-if="saving">
                <span class="rpe-spinner-sm"></span>
                <span class="rpe-status-saving">Saving…</span>
              </template>
              <span v-else-if="justSaved" class="rpe-status-saved">✓ Saved</span>
            </div>
          </div>

          <div class="rpe-groups">
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="rpe-group">
              <div class="rpe-group-header">
                <span class="rpe-group-label">{{ group }}</span>
                <div class="rpe-group-actions">
                  <button class="rpe-group-btn" @click="selectGroup(group, true)">All</button>
                  <button class="rpe-group-btn" @click="selectGroup(group, false)">None</button>
                </div>
              </div>
              <div class="rpe-perm-list">
                <label
                  v-for="perm in perms"
                  :key="perm"
                  class="rpe-perm-item"
                  :class="{ 'is-checked': localPermissions.has(perm) }"
                >
                  <input
                    type="checkbox"
                    class="rpe-checkbox"
                    :checked="localPermissions.has(perm)"
                    @change="toggle(perm)"
                  />
                  <span class="rpe-perm-key">{{ perm.split(':')[1] }}</span>
                  <span class="rpe-perm-full">{{ perm }}</span>
                </label>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="saveError" class="rpe-save-error">{{ saveError }}</div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue';
import {adminAPI} from '@/utils/api/admin.ts';
import type {RoleDto} from '@/types/admin.ts';

const roles = ref<RoleDto[]>([]);
const allPermissions = ref<string[]>([]);
const selectedRoleId = ref<number | null>(null);
const localPermissions = ref(new Set<string>());
const localPermsByRole = ref<Record<number, Set<string>>>({});
const initialLoading = ref(true);
const saving = ref(false);
const justSaved = ref(false);
const loadError = ref('');
const saveError = ref('');

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let justSavedTimer: ReturnType<typeof setTimeout> | null = null;

const sortedRoles = computed(() =>
    [...roles.value].sort((a, b) => a.priority - b.priority)
);

const selectedRole = computed(() =>
    roles.value.find(r => r.id === selectedRoleId.value) ?? null
);

const groupedPermissions = computed(() => {
  const groups: Record<string, string[]> = {};
  for (const perm of allPermissions.value) {
    const prefix = perm.split(':')[0];
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(perm);
  }
  return groups;
});

const loadData = async () => {
  try {
    initialLoading.value = true;
    loadError.value = '';
    const [rolesRes, permsRes] = await Promise.all([
      adminAPI.getRoles(),
      adminAPI.getAllPermissions(),
    ]);
    roles.value = rolesRes.data;
    allPermissions.value = permsRes.data;
    for (const role of roles.value) {
      localPermsByRole.value[role.id] = new Set(role.permissions);
    }
    if (sortedRoles.value.length > 0) {
      selectRole(sortedRoles.value[0]);
    }
  } catch {
    loadError.value = 'Failed to load role data. Check your permissions.';
  } finally {
    initialLoading.value = false;
  }
};

const selectRole = (role: RoleDto) => {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  selectedRoleId.value = role.id;
  localPermissions.value = new Set(localPermsByRole.value[role.id] ?? role.permissions);
};

const toggle = (perm: string) => {
  const set = new Set(localPermissions.value);
  if (set.has(perm)) set.delete(perm);
  else set.add(perm);
  localPermissions.value = set;
  if (selectedRoleId.value !== null) {
    localPermsByRole.value[selectedRoleId.value] = set;
  }
  scheduleSave();
};

const selectGroup = (group: string, enable: boolean) => {
  const perms = groupedPermissions.value[group] ?? [];
  const set = new Set(localPermissions.value);
  for (const p of perms) {
    if (enable) set.add(p);
    else set.delete(p);
  }
  localPermissions.value = set;
  if (selectedRoleId.value !== null) {
    localPermsByRole.value[selectedRoleId.value] = set;
  }
  scheduleSave();
};

const scheduleSave = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 500);
};

const save = async () => {
  if (!selectedRole.value) return;
  try {
    saving.value = true;
    saveError.value = '';
    const res = await adminAPI.updateRolePermissions(
        selectedRole.value.id,
        [...localPermissions.value]
    );
    const idx = roles.value.findIndex(r => r.id === res.data.id);
    if (idx !== -1) roles.value[idx] = res.data;
    localPermissions.value = new Set(res.data.permissions);
    localPermsByRole.value[res.data.id] = new Set(res.data.permissions);
    justSaved.value = true;
    if (justSavedTimer) clearTimeout(justSavedTimer);
    justSavedTimer = setTimeout(() => {
      justSaved.value = false;
    }, 2500);
  } catch {
    saveError.value = 'Failed to save permissions. Please try again.';
    setTimeout(() => {
      saveError.value = '';
    }, 4000);
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.rpe {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rpe-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  background: var(--myst-bg-2);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
}

.rpe-state--error {
  flex-direction: column;
  gap: 16px;
  color: #ef4444;
}

.rpe-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-top: 2px solid var(--myst-gold);
  border-radius: 50%;
  animation: rpe-spin 1s linear infinite;
  flex-shrink: 0;
}

.rpe-spinner-sm {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-top: 1.5px solid var(--myst-gold);
  border-radius: 50%;
  animation: rpe-spin 1s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes rpe-spin {
  to { transform: rotate(360deg); }
}

.rpe-retry-btn {
  padding: 8px 20px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: background 0.2s;
}

.rpe-retry-btn:hover {
  background: var(--myst-gold-soft);
}

/* Two-column layout */
.rpe-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 12px;
  overflow: hidden;
  min-height: 540px;
}

/* Sidebar */
.rpe-sidebar {
  background: var(--myst-bg-2);
  border-right: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
  overflow-y: auto;
}

.rpe-sidebar-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  padding: 4px 8px 10px;
}

.rpe-role-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-left: 2px solid transparent;
  border-radius: 0 6px 6px 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  color: var(--myst-ink-muted);
}

.rpe-role-btn:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 50%, var(--myst-gold));
  color: var(--myst-ink);
}

.rpe-role-btn.active {
  background: color-mix(in srgb, var(--myst-bg-2) 30%, var(--myst-gold));
  color: var(--myst-ink);
  border-left-color: var(--myst-gold);
}

.rpe-role-name {
  font-size: 13px;
  font-weight: 600;
  flex: 1;
}

.rpe-role-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.rpe-premium {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: var(--myst-gold);
  color: var(--myst-bg);
  padding: 1px 5px;
  border-radius: 3px;
}

.rpe-perm-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--myst-ink-muted);
  background: color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  min-width: 20px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

/* Matrix panel */
.rpe-matrix {
  padding: 24px;
  overflow-y: auto;
  background: var(--myst-bg);
}

.rpe-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--myst-ink-muted);
  font-size: 14px;
}

.rpe-matrix-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

.rpe-role-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-ink);
  margin: 0 0 4px;
}

.rpe-role-desc {
  font-size: 13px;
  color: var(--myst-ink-muted);
}

.rpe-save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding-top: 4px;
  flex-shrink: 0;
  min-width: 80px;
  justify-content: flex-end;
}

.rpe-status-saving {
  color: var(--myst-ink-muted);
}

.rpe-status-saved {
  color: #10b981;
  font-weight: 600;
}

/* Permission groups */
.rpe-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rpe-group {
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  border-radius: 8px;
  overflow: hidden;
}

.rpe-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: var(--myst-bg-2);
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
}

.rpe-group-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.rpe-group-actions {
  display: flex;
  gap: 5px;
}

.rpe-group-btn {
  padding: 2px 9px;
  font-size: 11px;
  font-weight: 600;
  background: color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  color: var(--myst-ink-muted);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.rpe-group-btn:hover {
  background: var(--myst-gold);
  color: var(--myst-bg);
}

.rpe-perm-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  padding: 8px;
}

.rpe-perm-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}

.rpe-perm-item:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 60%, var(--myst-gold));
}

.rpe-perm-item.is-checked {
  background: color-mix(in srgb, var(--myst-gold) 8%, transparent);
}

.rpe-checkbox {
  width: 15px;
  height: 15px;
  accent-color: var(--myst-gold);
  cursor: pointer;
  flex-shrink: 0;
}

.rpe-perm-key {
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink);
  flex: 1;
}

.rpe-perm-full {
  font-size: 10px;
  color: var(--myst-ink-muted);
  font-family: monospace;
  opacity: 0.7;
}

/* Save error */
.rpe-save-error {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #ef4444 35%, transparent);
  font-size: 13px;
  font-weight: 500;
}
</style>
