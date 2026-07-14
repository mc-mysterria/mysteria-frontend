<template>
  <div class="quality">
    <details class="quality-group">
      <summary>
        <span class="q-count">{{ orphanCount }}</span>
        Orphan damage-config keys — present in config, matched to no ability template (damage passives land here)
      </summary>
      <div class="q-body">
        <div v-for="(keys, p) in payload.orphanKeys" :key="p" class="q-row">
          <span class="q-pathway">{{ p }}</span>
          <span v-for="k in keys" :key="k" class="q-pill">{{ k }}</span>
        </div>
        <p v-if="!orphanCount" class="q-none">None.</p>
      </div>
    </details>

    <details class="quality-group">
      <summary>
        <span class="q-count">{{ payload.bypassSites.length }}</span>
        Telemetry blind spots — damage here never fires the telemetry event, so zero recorded hits ≠ zero damage
      </summary>
      <div class="q-body">
        <div class="q-row wrap">
          <span v-for="s in payload.bypassSites" :key="s" class="q-pill">{{ s }}</span>
        </div>
        <p v-if="!payload.bypassSites.length" class="q-none">None.</p>
      </div>
    </details>

    <details class="quality-group">
      <summary>
        <span class="q-count">{{ silentAbilities.length }}</span>
        Damage abilities with zero recorded hits in the window — unused, unmeasured, or bypassing
      </summary>
      <div class="q-body">
        <div class="q-row wrap">
          <span v-for="a in silentAbilities" :key="a.id" class="q-pill">
            {{ a.pathway }} S{{ a.sequence }} · {{ a.plainName }}
          </span>
        </div>
        <p v-if="!silentAbilities.length" class="q-none">None.</p>
      </div>
    </details>

    <p class="q-note">
      Casts are <em>attempts</em> — the usage event fires before cost deduction, so counts include
      failed and cancelled casts. Comparable across pathways, but not exact successes.
    </p>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import type {CoiBalancePayload, EnrichedAbility} from '@/types/coi-balance';

const props = defineProps<{
  payload: CoiBalancePayload;
  silentAbilities: EnrichedAbility[];
}>();

const orphanCount = computed(() =>
    Object.values(props.payload.orphanKeys).reduce((n, l) => n + l.length, 0));
</script>

<style scoped>
.quality {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quality-group summary {
  cursor: pointer;
  color: var(--myst-ink);
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background 0.15s ease;
  list-style-position: inside;
}

.quality-group summary:hover {
  background: color-mix(in srgb, var(--myst-gold) 8%, transparent);
}

.q-count {
  display: inline-block;
  min-width: 26px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--myst-gold);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 45%, transparent);
  border-radius: 999px;
  padding: 1px 7px;
  margin-right: 8px;
}

.q-body {
  padding: 10px 12px 4px 34px;
}

.q-row {
  margin-bottom: 8px;
  display: flex;
  align-items: baseline;
  gap: 5px;
  flex-wrap: wrap;
}

.q-pathway {
  font-weight: 700;
  color: var(--myst-ink);
  font-size: 12px;
  margin-right: 4px;
  text-transform: capitalize;
}

.q-pill {
  display: inline-block;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
  color: var(--myst-ink-muted);
}

.q-none {
  color: var(--myst-ink-muted);
  font-size: 12px;
  margin: 0;
}

.q-note {
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.5;
  margin: 6px 0 0;
  padding: 10px 12px;
  border-left: 3px solid color-mix(in srgb, var(--myst-gold) 55%, transparent);
  background: color-mix(in srgb, var(--myst-gold) 6%, transparent);
  border-radius: 0 8px 8px 0;
}
</style>
