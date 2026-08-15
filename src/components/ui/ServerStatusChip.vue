<template>
  <button class="ip-chip" :title="t('homePage.copyHint')" @click="copyIp">
    <span :class="['status-dot', isOnline ? 'online' : 'offline']" aria-hidden="true"></span>
    <span class="chip-ip">{{ SERVER_IP }}</span>
    <span v-if="isOnline && playerCount !== null" class="chip-players">· {{ playerCount }}</span>
    <span v-if="copied" class="chip-copied">✓</span>
  </button>
</template>

<script lang="ts" setup>
import {useI18n} from '@/composables/useI18n';
import {SERVER_IP, useCopyIp, useServerStatus} from '@/composables/useServer';

const {t} = useI18n();
const {isOnline, playerCount} = useServerStatus();
const {copied, copyIp} = useCopyIp();
</script>

<style scoped>
.ip-chip {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  background: var(--myst-wash);
  border: 1px solid var(--myst-line-28);
  border-radius: 2px;
  cursor: pointer;
  font-family: var(--myst-font-mono);
  font-size: 11.5px;
  letter-spacing: 0.06em;
  color: var(--myst-ink);
  white-space: nowrap;
  transition: all 0.25s ease;
}

.ip-chip:hover {
  border-color: var(--myst-gold);
  background: var(--myst-wash-strong);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.4s ease;
}

.status-dot.online {
  background: var(--myst-green);
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.7);
}

.status-dot.offline {
  background: #52525b;
}

.chip-players {
  color: var(--myst-green);
  font-size: 10px;
}

.chip-copied {
  color: var(--myst-green);
  font-size: 11px;
}
</style>
