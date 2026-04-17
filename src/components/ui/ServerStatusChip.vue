<template>
  <button class="server-chip" :title="copied ? t('guide.copyAddress') : 'mc.mysterria.net'" @click="copyIp">
    <span class="status-dot" :class="{ online: isOnline, offline: !isOnline }"></span>
    <span class="chip-ip">mc.mysterria.net</span>
    <span v-if="isOnline && playerCount !== null" class="chip-players">
      {{ playerCount }}
    </span>
    <Transition name="fade">
      <span v-if="copied" class="copied-badge">✓</span>
    </Transition>
  </button>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

const isOnline = ref(false);
const playerCount = ref<number | null>(null);
const copied = ref(false);
let pollInterval: ReturnType<typeof setInterval> | null = null;
let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

async function fetchStatus() {
  try {
    const res = await fetch('https://mcapi.us/server/status?ip=mc.mysterria.net');
    if (!res.ok) return;
    const data = await res.json();
    isOnline.value = data.online === true;
    playerCount.value = isOnline.value ? (data.players?.now ?? 0) : null;
  } catch {
    isOnline.value = false;
    playerCount.value = null;
  }
}

async function copyIp() {
  try {
    await navigator.clipboard.writeText('mc.mysterria.net');
    copied.value = true;
    if (copiedTimeout) clearTimeout(copiedTimeout);
    copiedTimeout = setTimeout(() => { copied.value = false; }, 1800);
  } catch {
    // clipboard not available
  }
}

onMounted(() => {
  fetchStatus();
  pollInterval = setInterval(fetchStatus, 60_000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
  if (copiedTimeout) clearTimeout(copiedTimeout);
});
</script>

<style scoped>
.server-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: color-mix(in srgb, var(--myst-bg) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-radius: 4px;
  cursor: pointer;
  color: var(--myst-ink-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.server-chip:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
  color: var(--myst-ink);
  background: color-mix(in srgb, var(--myst-gold) 5%, var(--myst-bg));
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.status-dot.online {
  background: #4ade80;
  box-shadow: 0 0 5px rgba(74, 222, 128, 0.6);
}

.status-dot.offline {
  background: #52525b;
}

.chip-ip {
  color: inherit;
}

.chip-players {
  color: #4ade80;
  font-size: 10px;
  opacity: 0.85;
}

.chip-players::before {
  content: '·';
  margin-right: 3px;
  opacity: 0.5;
}

.copied-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--myst-gold) 15%, var(--myst-bg));
  color: var(--myst-gold);
  font-size: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .server-chip {
    display: none;
  }
}
</style>
