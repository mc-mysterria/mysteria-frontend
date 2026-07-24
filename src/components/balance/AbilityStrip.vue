<template>
  <div class="strip">
    <p v-if="!rows.length" class="strip-empty">No costed damage abilities at this sequence.</p>
    <template v-else>
      <div class="strip-scale">
        <span>weaker · ½×</span>
        <span class="strip-scale-mid">median</span>
        <span>2× · stronger</span>
      </div>
      <button
          v-for="r in rows"
          :key="r.id"
          class="strip-row"
          type="button"
          :title="`${r.name} – dmg/spirit ${r.dps.toFixed(2)}, ${r.idx.toFixed(2)}× the sequence median. Click to jump to its row.`"
          @click="$emit('focus', r.id)"
      >
        <span class="strip-label">{{ r.name }}</span>
        <span class="strip-track">
          <span class="strip-mid"></span>
          <span
              :class="['strip-bar', r.idx >= 1 ? 'over' : 'under', { flagged: r.flagged }]"
              :style="barStyle(r.idx)"
          ></span>
        </span>
        <span class="strip-val">{{ r.idx.toFixed(2) }}×</span>
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
export interface StripRow {
  id: string;
  name: string;
  dps: number;
  idx: number;
  flagged: boolean;
}

defineProps<{ rows: StripRow[] }>();
defineEmits<{ focus: [id: string] }>();

/** Bar grows from the center line; length ∝ |log2(index)|, clamped at 2 doublings. */
const barStyle = (idx: number) => {
  const mag = Math.min(Math.abs(Math.log2(idx)) / 2, 1) * 50;
  return idx >= 1
      ? {left: '50%', width: `${Math.max(mag, 0.75)}%`}
      : {right: '50%', width: `${Math.max(mag, 0.75)}%`};
};
</script>

<style scoped>
.strip {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.strip-empty {
  color: var(--myst-ink-muted);
  font-size: 13px;
  margin: 0;
}

.strip-scale {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: color-mix(in srgb, var(--myst-ink-muted) 75%, transparent);
  padding: 0 96px 6px 220px;
}

.strip-scale span:first-child {
  text-align: left;
}

.strip-scale-mid {
  text-align: center;
}

.strip-scale span:last-child {
  text-align: right;
}

.strip-row {
  display: grid;
  grid-template-columns: 210px 1fr 86px;
  gap: 10px;
  align-items: center;
  padding: 4px 6px;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.strip-row:hover {
  background: color-mix(in srgb, var(--myst-gold) 8%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.strip-label {
  color: var(--myst-ink);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.strip-track {
  position: relative;
  height: 14px;
}

.strip-mid {
  position: absolute;
  left: 50%;
  top: -2px;
  bottom: -2px;
  width: 1.5px;
  background: color-mix(in srgb, var(--myst-ink-muted) 55%, transparent);
}

.strip-bar {
  position: absolute;
  top: 1px;
  height: 12px;
  min-width: 2px;
}

.strip-bar.over {
  background: var(--bal-pos, #e34948);
  border-radius: 0 4px 4px 0;
}

.strip-bar.under {
  background: var(--bal-neg, #2a78d6);
  border-radius: 4px 0 0 4px;
}

.strip-bar.flagged {
  outline: 2px solid var(--bal-crit, #d03b3b);
  outline-offset: 1px;
}

.strip-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-ink);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
