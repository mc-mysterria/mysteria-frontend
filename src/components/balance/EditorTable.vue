<template>
  <div class="editor-table-wrap">
    <table class="editor-table">
      <thead>
      <tr>
        <th>Seq</th>
        <th>Ability</th>
        <th>Type</th>
        <th class="num">Cost</th>
        <th class="num">Cooldown</th>
        <th>Damage keys <span class="th-hint">(S9 base, ★ primary)</span></th>
        <template v-if="telemetryAvailable">
          <th class="num">Casts</th>
          <th class="num">Hits</th>
          <th class="num">Avg dmg</th>
          <th class="num">PvP hits</th>
          <th class="num">Obs ×base</th>
        </template>
      </tr>
      </thead>
      <tbody>
      <tr v-for="a in abilities" :id="`ability-row-${a.id}`" :key="a.id"
          :class="{ 'row-flash': flashId === a.id }">
        <td class="seq-cell">S{{ a.sequence }}</td>
        <td class="name-cell">{{ a.plainName }}</td>
        <td class="type-cell">{{ a.type.toLowerCase() }}<span v-if="a.activated" class="mini-pill" title="Toggle-style ability">toggle</span></td>

        <!-- cost -->
        <td class="num">
          <div class="tune-wrap">
            <input
                :class="{ changed: isCostChanged(a) }"
                :step="isPctMode(a) ? '0.1' : '1'"
                :value="isPctMode(a) ? a.effectiveCostPercentage : a.effectiveFlatCost"
                min="0"
                type="number"
                @input="onCostInput(a, $event)"
            />
            <span v-if="isPctMode(a)" class="unit">%</span>
          </div>
        </td>

        <!-- cooldown + per-category -->
        <td class="num">
          <span v-if="a._hard.cd < 0 && !Object.keys(a._hard.cats).length" class="none-dash">—</span>
          <template v-else>
            <div v-if="a._hard.cd >= 0" class="tune-wrap">
              <input
                  :class="{ changed: a.effectiveCooldownSeconds !== a._hard.cd }"
                  :value="a.effectiveCooldownSeconds"
                  min="0"
                  step="1"
                  type="number"
                  @input="onCdInput(a, $event)"
              />
              <span class="unit">s</span>
            </div>
            <div v-for="cat in Object.keys(a._hard.cats)" :key="cat" class="tune-wrap cat-wrap">
              <span class="key-pill">{{ cat }}</span>
              <input
                  :class="{ changed: a.effectiveCategoryCooldowns[cat] !== a._hard.cats[cat] }"
                  :value="a.effectiveCategoryCooldowns[cat]"
                  min="0"
                  step="1"
                  type="number"
                  @input="onCatInput(a, cat, $event)"
              />
              <span class="unit">s</span>
            </div>
          </template>
        </td>

        <!-- damage keys -->
        <td class="keys-cell">
          <span v-if="!Object.keys(a.damageKeys).length" class="key-pill muted">no damage key</span>
          <div v-for="k in Object.keys(a.damageKeys)" :key="k" class="tune-wrap key-wrap">
            <span :class="{ primary: k === a._primary }" class="key-pill">
              {{ k }}<template v-if="k === a._primary"> ★</template>
            </span>
            <input
                :class="{ changed: isDamageChanged(a, k) }"
                :value="a.damageKeys[k]"
                min="0"
                step="0.1"
                type="number"
                @input="onDamageInput(a, k, $event)"
            />
            <span v-if="isDamageChanged(a, k)" class="ghost-val">{{ a._orig[k] }}</span>
          </div>
        </td>

        <!-- telemetry -->
        <template v-if="telemetryAvailable">
          <td class="num tele">{{ castsFor(a) }}</td>
          <td class="num tele">{{ hitsFor(a)?.hits ?? '—' }}</td>
          <td class="num tele">{{ hitsFor(a) ? fmt(hitsFor(a)!.avgFinal) : '—' }}</td>
          <td class="num tele">{{ hitsFor(a)?.pvpHits ?? '—' }}</td>
          <td class="num tele">{{ obsMult(a) }}</td>
        </template>
      </tr>
      </tbody>
    </table>
    <p class="table-footnote">
      ★ = primary key used in fairness math — variant keys are alternative hits, never summed.
      Casts join on the ability name; hits/damage join on the primary key.
      “Obs ×base” = observed avg final damage ÷ configured base, the live multiplier stack.
    </p>
  </div>
</template>

<script lang="ts" setup>
import type {CastsByKeyRow, DamageByKeyRow, EnrichedAbility} from '@/types/coi-balance';
import {fmt} from '@/utils/coiBalance/model';

const props = defineProps<{
  abilities: EnrichedAbility[];
  dmgByKey: Record<string, DamageByKeyRow>;
  castsByKey: Record<string, CastsByKeyRow>;
  telemetryAvailable: boolean;
  flashId: string | null;
}>();

const emit = defineEmits<{ edited: [] }>();

// A flat override on a %-cost ability keeps the cell in flat mode (§5/§6 precedence).
const isPctMode = (a: EnrichedAbility) =>
    (a._hard.pct > 0 || a.effectiveCostPercentage > 0) && !(a._hard.pct > 0 && a.effectiveFlatCost > 0);

const isCostChanged = (a: EnrichedAbility) =>
    isPctMode(a) ? a.effectiveCostPercentage !== a._hard.pct : a.effectiveFlatCost !== a._hard.flat;

const isDamageChanged = (a: EnrichedAbility, k: string) =>
    Math.abs(a.damageKeys[k] - a._orig[k]) > 1e-9;

const numFrom = (e: Event): number | null => {
  const v = parseFloat((e.target as HTMLInputElement).value);
  return isFinite(v) && v >= 0 ? v : null;
};

const onCostInput = (a: EnrichedAbility, e: Event) => {
  const v = numFrom(e);
  if (v == null) return;
  if (isPctMode(a)) a.effectiveCostPercentage = v;
  else a.effectiveFlatCost = v;
  emit('edited');
};

const onCdInput = (a: EnrichedAbility, e: Event) => {
  const v = numFrom(e);
  if (v == null) return;
  a.effectiveCooldownSeconds = v;
  emit('edited');
};

const onCatInput = (a: EnrichedAbility, cat: string, e: Event) => {
  const v = numFrom(e);
  if (v == null) return;
  a.effectiveCategoryCooldowns[cat] = v;
  emit('edited');
};

const onDamageInput = (a: EnrichedAbility, k: string, e: Event) => {
  const v = numFrom(e);
  if (v == null) return;
  a.damageKeys[k] = v;
  emit('edited');
};

const castsFor = (a: EnrichedAbility) => props.castsByKey[a.kebabName]?.casts ?? '—';
const hitsFor = (a: EnrichedAbility) => (a._primary ? props.dmgByKey[a._primary] : undefined) ?? null;
const obsMult = (a: EnrichedAbility) => {
  const h = hitsFor(a);
  return h && h.avgBase > 0 ? (h.avgFinal / h.avgBase).toFixed(1) + '×' : '—';
};
</script>

<style scoped>
.editor-table-wrap {
  overflow-x: auto;
}

.editor-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.editor-table th {
  color: var(--myst-ink-muted);
  font-weight: 500;
  text-align: left;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  white-space: nowrap;
}

.th-hint {
  text-transform: none;
  letter-spacing: 0;
  opacity: 0.7;
}

.editor-table td {
  padding: 8px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 14%, transparent);
  vertical-align: top;
  color: var(--myst-ink);
}

.editor-table tr:last-child td {
  border-bottom: 0;
}

.editor-table tr {
  transition: background 0.4s ease;
}

.row-flash {
  background: color-mix(in srgb, var(--myst-gold) 14%, transparent);
}

.num {
  text-align: right;
}

.seq-cell {
  font-family: 'JetBrains Mono', monospace;
  color: var(--myst-gold);
  white-space: nowrap;
}

.name-cell {
  font-weight: 600;
  min-width: 140px;
}

.type-cell {
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.mini-pill {
  display: inline-block;
  font-size: 9px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-radius: 999px;
  padding: 0 6px;
  margin-left: 6px;
  color: var(--myst-ink-muted);
  vertical-align: 1px;
}

.tune-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: flex-end;
  margin: 2px 0;
}

.keys-cell .tune-wrap {
  justify-content: flex-start;
}

.editor-table input[type="number"] {
  width: 82px;
  padding: 4px 8px;
  background: var(--myst-bg);
  color: var(--myst-ink);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.editor-table input[type="number"]:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 18%, transparent);
}

.editor-table input.changed {
  border-color: #f59e0b;
  box-shadow: 0 0 0 1px #f59e0b inset;
}

.unit {
  color: var(--myst-ink-muted);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
}

.key-pill {
  display: inline-block;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 999px;
  padding: 1px 8px;
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.key-pill.primary {
  border-color: color-mix(in srgb, var(--myst-gold) 55%, transparent);
  color: var(--myst-gold);
}

.key-pill.muted {
  opacity: 0.6;
}

.ghost-val {
  color: var(--myst-ink-muted);
  font-size: 11px;
  text-decoration: line-through;
  font-family: 'JetBrains Mono', monospace;
}

.none-dash {
  color: var(--myst-ink-muted);
}

.tele {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-ink-muted);
}

.table-footnote {
  color: color-mix(in srgb, var(--myst-ink-muted) 80%, transparent);
  font-size: 12px;
  margin: 12px 0 0;
  line-height: 1.5;
}
</style>
