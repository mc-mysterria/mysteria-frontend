<template>
  <div
      class="balance-view"
      :style="divergingVars"
      @dragenter.prevent="dragDepth++"
      @dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
      @dragover.prevent
      @drop.prevent="onDrop"
  >
    <!-- drag overlay -->
    <div v-if="dragDepth > 0" class="drop-overlay">
      <div class="drop-overlay-inner">
        <span class="drop-sigil">✦</span>
        Release to load <code>export-latest.json</code>
      </div>
    </div>

    <!-- header -->
    <div class="page-header">
      <button class="back-button" @click="router.push('/profile')">
        <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <div class="title-block">
        <h1 class="page-title">Balance Observatory</h1>
        <p class="page-subtitle">Circle of Imagination · pathway tuning instrument</p>
      </div>
      <div class="header-actions">
        <button
            :disabled="fetchingReport"
            class="ghost-btn"
            title="GET /balance/report from the live server (catwalk)"
            @click="fetchFromServer"
        >
          <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M12 12v9"/>
            <path d="m8 17 4 4 4-4"/>
          </svg>
          {{ fetchingReport ? 'Fetching…' : 'Fetch from server' }}
        </button>
        <button class="ghost-btn" @click="filePicker?.click()">
          <svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          Load export
        </button>
        <button v-if="payload" class="ghost-btn danger" title="Forget the loaded payload" @click="clearPayload">
          Clear
        </button>
      </div>
      <input ref="filePicker" accept=".json,application/json" hidden type="file" @change="onFilePicked"/>
    </div>

    <div v-if="loadError" class="error-banner">{{ loadError }}</div>

    <!-- empty state -->
    <div v-if="!payload" class="empty-state" @click="filePicker?.click()">
      <div class="empty-sigil">✦</div>
      <h2>Feed the Observatory</h2>
      <button :disabled="fetchingReport" class="fetch-cta" type="button" @click.stop="fetchFromServer">
        {{ fetchingReport ? 'Consulting the server…' : 'Fetch the latest report from the server' }}
      </button>
      <p class="empty-or">— or load it by hand —</p>
      <p class="empty-lead">Drop <code>export-latest.json</code> anywhere on this page, or click to browse.</p>
      <ol class="empty-steps">
        <li>On the server, run <code>/coi balance export 30</code></li>
        <li>Fetch <code>plugins/CircleOfImagination/balance/export-latest.json</code></li>
        <li>Drop it here — the payload stays in your browser and survives refresh</li>
      </ol>
    </div>

    <template v-else>
      <!-- meta strip -->
      <div class="meta-strip">
        <span class="meta-chip">plugin <b>{{ payload.meta.pluginVersion }}</b></span>
        <span class="meta-chip">generated <b>{{ formatDate(payload.meta.generatedAt) }}</b></span>
        <span class="meta-chip">window <b>{{ windowDays }} days</b></span>
        <span class="meta-chip"><b>{{ payload.abilities.length }}</b> ability templates</span>
        <span :class="['meta-chip', telemetryAvailable ? 'ok' : 'off']">
          telemetry <b>{{ telemetryAvailable ? 'available' : 'unavailable' }}</b>
        </span>
        <span
            v-if="profiledKeyCount"
            :title="payload.meta.damageProfiles"
            class="meta-chip"
        ><b>{{ profiledKeyCount }}</b> profiled damage key{{ profiledKeyCount > 1 ? 's' : '' }}</span>
        <span class="meta-chip">fair band <b>±{{ Math.round(threshold * 100) }}%</b></span>
      </div>

      <!-- controls -->
      <section class="card controls-card">
        <div class="control-group">
          <span class="control-label">Metric</span>
          <div class="segmented">
            <button
                v-for="m in METRICS"
                :key="m.id"
                :class="{ active: metric === m.id }"
                :disabled="m.id === 'empirical' && !telemetryAvailable"
                :title="m.label"
                type="button"
                @click="metric = m.id"
            >{{ m.short }}
            </button>
          </div>
        </div>
        <div class="control-group grow">
          <span class="control-label">Pathways <em>(max 4)</em></span>
          <div class="pathway-chips">
            <button
                v-for="p in allPathways"
                :key="p"
                :class="['pathway-chip', { selected: slotOf[p] !== undefined }]"
                :disabled="slotOf[p] === undefined && selectedPathways.length >= 4"
                type="button"
                @click="togglePathway(p)"
            >
              <span
                  v-if="slotOf[p] !== undefined"
                  :style="{ background: seriesPalette[slotOf[p]] }"
                  class="chip-dot"
              ></span>
              {{ p }}
            </button>
          </div>
        </div>
        <div class="control-group">
          <label class="toggle-label">
            <input v-model="showAbsolute" type="checkbox"/>
            Absolute chart
          </label>
        </div>
      </section>

      <!-- fairness chart -->
      <section class="card">
        <div class="card-head">
          <h2>Fairness index <span class="head-metric">· {{ metricLabel }}</span></h2>
          <p class="card-sub">
            Each line ÷ the cross-pathway median of the same sequence column — the goal is to sit on the
            <b>1× median</b> line, inside the gray fair band. Log₂ scale: half and double the median are symmetric.
            Points ringed in red sit outside the band. Dashed ghost = the pathway before your edits.
          </p>
        </div>
        <p v-if="!selectedPathways.length" class="hint-empty">Select at least one pathway above.</p>
        <FairnessChart
            v-else
            :chrome="chartChrome"
            :metric-label="metricLabel"
            :series="indexSeries"
            :threshold="threshold"
            mode="index"
        />
      </section>

      <!-- absolute chart -->
      <section v-if="showAbsolute && selectedPathways.length" class="card">
        <div class="card-head">
          <h2>Absolute values <span class="head-metric">· {{ metricLabel }}</span></h2>
          <p class="card-sub">Raw metric on a log₁₀ scale — sequence multipliers span 28×, so a linear axis would
            flatten S9–S5. Dashed line = column median.</p>
        </div>
        <FairnessChart
            :chrome="chartChrome"
            :medians="medianRow"
            :metric-label="metricLabel"
            :series="absoluteSeries"
            :threshold="threshold"
            mode="absolute"
        />
      </section>

      <!-- fairness matrix -->
      <section class="card">
        <div class="card-head">
          <h2>Fairness matrix</h2>
          <p class="card-sub">Every pathway at a glance — click a row to chart it. Wash = deviation from the column
            median (blue weaker, red stronger); red ring = outside the ±{{ Math.round(threshold * 100) }}% band.
            “—” = no measurable damage abilities at that sequence.</p>
        </div>
        <div class="matrix-wrap">
          <table class="matrix">
            <thead>
            <tr>
              <th class="rowhead-th">pathway \ seq</th>
              <th v-for="s in SEQS" :key="s" class="num">S{{ s }}</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="p in allPathways"
                :key="p"
                :class="{ 'row-selected': slotOf[p] !== undefined }"
                @click="togglePathway(p)"
            >
              <td class="rowhead">
                <span
                    v-if="slotOf[p] !== undefined"
                    :style="{ background: seriesPalette[slotOf[p]] }"
                    class="chip-dot"
                ></span>
                {{ p }}
              </td>
              <td
                  v-for="s in SEQS"
                  :key="s"
                  :class="['cell', { flag: cellFlag(p, s) }]"
                  :style="cellStyle(p, s)"
                  :title="cellTitle(p, s)"
              >{{ fmt(grid.values[p + '|' + s]) }}
              </td>
            </tr>
            <tr class="median-row">
              <td>column median</td>
              <td v-for="s in SEQS" :key="s" class="num">{{ fmt(grid.medians[s]) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- drilldown -->
      <section class="card">
        <div class="card-head">
          <h2>Ability drilldown</h2>
          <p class="card-sub">
            Damage keys are Sequence-9 baselines from damage-config.yml; cost and cooldown are the <em>effective</em>
            values (tuning-config.yml overrides applied). Everything is editable — charts recompute live, amber marks
            values that differ from the hardcoded numbers.
          </p>
        </div>
        <div class="drill-controls">
          <label>Pathway
            <select v-model="focusPathway">
              <option v-for="p in allPathways" :key="p" :value="p">{{ p }}</option>
            </select>
          </label>
          <label>Strip sequence
            <select v-model.number="stripSeq">
              <option v-for="s in SEQS" :key="s" :value="s">S{{ s }}</option>
            </select>
          </label>
        </div>

        <div class="strip-block">
          <h3 class="strip-title">Damage per spirit at S{{ stripSeq }} vs the sequence median</h3>
          <AbilityStrip :rows="stripRows" @focus="jumpToAbility"/>
        </div>

        <EditorTable
            :abilities="focusAbilities"
            :casts-by-key="castsByKey"
            :dmg-by-key="dmgByKey"
            :flash-id="flashId"
            :profiles-present="profiledKeyCount > 0"
            :telemetry-available="telemetryAvailable"
        />
      </section>

      <!-- outliers -->
      <section class="card">
        <div class="card-head">
          <h2>Outliers — damage per spirit vs same-sequence median</h2>
          <p class="card-sub">Per damage ability at its native sequence. Long red bars are nerf candidates, long blue
            bars buff candidates — confirm against the empirical columns before acting. Click to open in the
            drilldown.</p>
        </div>
        <p v-if="!outlierRows.length" class="hint-empty">
          No ability deviates more than ±{{ Math.round(threshold * 100) }}% from its sequence median. ✦
        </p>
        <AbilityStrip v-else :rows="outlierRows" @focus="jumpToOutlier"/>
      </section>

      <!-- pvp kill keys -->
      <section v-if="telemetryAvailable" class="card">
        <div class="card-head">
          <h2>Empirical — top PvP killing blows <span class="head-metric">· last {{ windowDays }} days</span></h2>
        </div>
        <p v-if="!killKeys.length" class="hint-empty">No PvP kills recorded in the window.</p>
        <div v-else class="kill-list">
          <div v-for="r in killKeys" :key="r.key" class="kill-row">
            <span class="kill-label">{{ r.key }}</span>
            <span class="kill-track">
              <span :style="{ width: Math.max(2, (r.kills / killKeys[0].kills) * 100) + '%' }" class="kill-bar"></span>
            </span>
            <span class="kill-val">{{ r.kills }}</span>
          </div>
        </div>
      </section>

      <!-- data quality -->
      <section class="card">
        <div class="card-head">
          <h2>Data quality</h2>
        </div>
        <QualityPanel :payload="payload" :silent-abilities="silentAbilities"/>
      </section>

      <!-- methodology -->
      <section class="card">
        <details>
          <summary class="method-summary">How the numbers are computed</summary>
          <pre class="method-body">{{ methodology }}</pre>
        </details>
      </section>

      <!-- sticky edit bar -->
      <transition name="editbar">
        <div v-if="dmgEditCount + tuneEditCount > 0" class="edit-bar">
          <div class="edit-bar-info">
            <span class="edit-dot"></span>
            <span v-if="dmgEditCount">{{ dmgEditCount }} damage edit{{ dmgEditCount > 1 ? 's' : '' }}</span>
            <span v-if="dmgEditCount && tuneEditCount" class="edit-sep">·</span>
            <span v-if="tuneEditCount">{{ tuneEditCount }} cost/cooldown edit{{ tuneEditCount > 1 ? 's' : '' }}</span>
            <span class="edit-hint">drop the files into plugins/CircleOfImagination/ → /coi reload</span>
          </div>
          <div class="edit-bar-actions">
            <button :disabled="!dmgEditCount" class="dl-btn" @click="downloadDamage">damage-config.yml</button>
            <button :disabled="!hasTuningEntries" class="dl-btn" @click="downloadTuning">tuning-config.yml</button>
            <button class="ghost-btn" @click="resetEdits">Reset</button>
          </div>
        </div>
      </transition>
      <!-- pre-existing overrides only: quiet download -->
      <div v-if="dmgEditCount + tuneEditCount === 0 && hasTuningEntries" class="quiet-download">
        The server already carries tuning overrides —
        <button class="link-btn" @click="downloadTuning">download the full tuning-config.yml</button>
        to inspect or preserve them.
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {useAuthStore} from '@/stores/auth';
import FairnessChart, {type ChartChrome, type ChartSeries} from '@/components/balance/FairnessChart.vue';
import AbilityStrip, {type StripRow} from '@/components/balance/AbilityStrip.vue';
import EditorTable from '@/components/balance/EditorTable.vue';
import QualityPanel from '@/components/balance/QualityPanel.vue';
import type {
  CastsByKeyRow,
  CoiBalancePayload,
  DamageByKeyRow,
  DamageChange,
  MetricId,
} from '@/types/coi-balance';
import {
  buildCtx,
  castDamage,
  effCost,
  enrichPayload,
  fmt,
  median,
  METRICS,
  metricValue,
  SEQS,
  validatePayload,
} from '@/utils/coiBalance/model';
import {downloadText, patchedDamageYaml, tuningEntries, tuningYaml} from '@/utils/coiBalance/yaml';

const router = useRouter();

const STORAGE_KEY = 'mysterria-coi-balance-payload';
const UI_KEY = 'mysterria-coi-balance-ui';

// ---------- state ----------
const payload = ref<CoiBalancePayload | null>(null);
const loadError = ref('');
const metric = ref<MetricId>('dps60');
const selectedPathways = ref<string[]>([]);
const slotOf = reactive<Record<string, number>>({});
const showAbsolute = ref(false);
const focusPathway = ref('');
const stripSeq = ref(9);
const flashId = ref<string | null>(null);
const dragDepth = ref(0);
const filePicker = ref<HTMLInputElement | null>(null);

// ---------- theme ----------
const isParchment = ref(document.documentElement.getAttribute('data-theme') === 'parchment');
let themeObserver: MutationObserver | null = null;

// Validated 4-slot categorical palette (dataviz standard); slot follows the
// pathway for the whole session, never its position in the selection.
const seriesPalette = computed(() => isParchment.value
    ? ['#2a78d6', '#1baf7a', '#eda100', '#008300']
    : ['#3987e5', '#199e70', '#c98500', '#008300']);

const divergingVars = computed(() => isParchment.value
    ? {'--bal-pos': '#e34948', '--bal-neg': '#2a78d6', '--bal-crit': '#d03b3b'}
    : {'--bal-pos': '#e66767', '--bal-neg': '#3987e5', '--bal-crit': '#e05555'});

const chartChrome = computed<ChartChrome>(() => isParchment.value
    ? {
      ink: '#2c2416', muted: '#6b6350', grid: 'rgba(44,36,22,0.10)',
      axis: 'rgba(44,36,22,0.30)', surface: '#e8e4d8', crit: '#d03b3b',
    }
    : {
      ink: '#f5f5f7', muted: '#a1a1aa', grid: 'rgba(245,245,247,0.07)',
      axis: 'rgba(245,245,247,0.22)', surface: '#13162a', crit: '#e05555',
    });

// ---------- derived model ----------
const ctx = computed(() => payload.value ? buildCtx(payload.value) : null);
const allPathways = computed(() => payload.value ? Object.keys(payload.value.pathways).sort() : []);
const threshold = computed(() => (payload.value?.exportMeta?.fairnessDeviationPercent ?? 25) / 100);
const windowDays = computed(() => payload.value?.exportMeta?.windowDays ?? 30);
const telemetryAvailable = computed(() => !!payload.value?.telemetry?.available);
const profiledKeyCount = computed(() => {
  let n = 0;
  for (const a of payload.value?.abilities ?? []) n += Object.keys(a.damageProfiles ?? {}).length;
  return n;
});
const metricLabel = computed(() => METRICS.find(m => m.id === metric.value)?.label ?? '');

const dmgByKey = computed(() => {
  const m: Record<string, DamageByKeyRow> = {};
  for (const r of payload.value?.telemetry?.damageByKey || []) m[r.key] = r;
  return m;
});
const castsByKey = computed(() => {
  const m: Record<string, CastsByKeyRow> = {};
  for (const r of payload.value?.telemetry?.castsByKey || []) m[r.key] = r;
  return m;
});

interface Grid {
  values: Record<string, number | null>;
  medians: Record<number, number | null>;
}

const emptyGrid: Grid = {values: {}, medians: {}};

function computeGrid(pristine: boolean): Grid {
  if (!ctx.value) return emptyGrid;
  const values: Grid['values'] = {};
  const medians: Grid['medians'] = {};
  for (const s of SEQS) {
    const col: number[] = [];
    for (const p of allPathways.value) {
      const v = metricValue(ctx.value, metric.value, p, s, pristine);
      values[p + '|' + s] = v;
      if (v != null && v > 0) col.push(v);
    }
    medians[s] = median(col);
  }
  return {values, medians};
}

const grid = computed<Grid>(() => computeGrid(false));
const pristineGrid = computed<Grid>(() => computeGrid(true));

const medianRow = computed(() => SEQS.map(s => {
  const m = grid.value.medians[s];
  return m != null && m > 0 ? m : null;
}));

const indexOf = (g: Grid, p: string, s: number): number | null => {
  const v = g.values[p + '|' + s];
  const m = g.medians[s];
  return v != null && v > 0 && m != null && m > 0 ? v / m : null;
};

const sameLine = (a: Array<number | null>, b: Array<number | null>) =>
    a.length === b.length && a.every((v, i) =>
        (v == null && b[i] == null) || (v != null && b[i] != null && Math.abs(v - b[i]!) < 1e-9));

const indexSeries = computed<ChartSeries[]>(() => selectedPathways.value.map(p => {
  const data = SEQS.map(s => indexOf(grid.value, p, s));
  const raw = SEQS.map(s => grid.value.values[p + '|' + s]);
  const flags = data.map(idx => idx != null && Math.abs(idx - 1) > threshold.value);
  const ghostData = SEQS.map(s => indexOf(pristineGrid.value, p, s));
  return {
    name: p,
    color: seriesPalette.value[slotOf[p] ?? 0],
    data, raw, flags,
    ghost: sameLine(data, ghostData) ? null : ghostData,
  };
}));

const absoluteSeries = computed<ChartSeries[]>(() => selectedPathways.value.map(p => {
  const data = SEQS.map(s => {
    const v = grid.value.values[p + '|' + s];
    return v != null && v > 0 ? v : null;
  });
  const ghostData = SEQS.map(s => {
    const v = pristineGrid.value.values[p + '|' + s];
    return v != null && v > 0 ? v : null;
  });
  return {
    name: p,
    color: seriesPalette.value[slotOf[p] ?? 0],
    data,
    ghost: sameLine(data, ghostData) ? null : ghostData,
  };
}));

// ---------- matrix ----------
const cellFlag = (p: string, s: number) => {
  const idx = indexOf(grid.value, p, s);
  return idx != null && Math.abs(idx - 1) > threshold.value;
};

const cellStyle = (p: string, s: number) => {
  const idx = indexOf(grid.value, p, s);
  if (idx == null) return {};
  const mag = Math.min(Math.abs(Math.log2(idx)) / 1.6, 1);
  if (mag <= 0.06) return {};
  const hue = idx > 1 ? 'var(--bal-pos)' : 'var(--bal-neg)';
  return {background: `color-mix(in srgb, ${hue} ${Math.round(mag * 42)}%, transparent)`};
};

const cellTitle = (p: string, s: number) => {
  const v = grid.value.values[p + '|' + s];
  const m = grid.value.medians[s];
  const idx = indexOf(grid.value, p, s);
  if (v == null || m == null) return `${p} @ S${s} — no measurable damage abilities`;
  return `${p} @ S${s}\n${metricLabel.value}: ${fmt(v)}\ncolumn median: ${fmt(m)}\nindex: ${idx?.toFixed(2)}× median`
      + (idx != null && Math.abs(idx - 1) > threshold.value ? `\n⚠ outside ±${Math.round(threshold.value * 100)}% band` : '');
};

// ---------- drilldown ----------
const focusAbilities = computed(() => {
  if (!payload.value || !focusPathway.value) return [];
  return payload.value.abilities
      .filter(a => a.pathway === focusPathway.value)
      .slice()
      .sort((a, b) => b.sequence - a.sequence);
});

const stripRows = computed<StripRow[]>(() => {
  if (!ctx.value || !focusPathway.value) return [];
  const c = ctx.value;
  const s = stripSeq.value;
  const dmgMult = c.payload.sequenceTables.damageMultiplier[s];
  const all: Array<{ id: string; name: string; pathway: string; dps: number }> = [];
  for (const p of allPathways.value) {
    const prof = c.profiles[p]?.[s];
    if (!prof) continue;
    for (const a of c.damageAbilities) {
      if (a.pathway !== p || a.sequence < s) continue;
      const cost = effCost(a, prof.maxSpirituality);
      if (cost <= 0) continue;
      all.push({id: a.id, name: a.plainName, pathway: p, dps: castDamage(a, a._primary!, 60).dmg * dmgMult / cost});
    }
  }
  const m = median(all.map(r => r.dps));
  if (m == null || m <= 0) return [];
  return all
      .filter(r => r.pathway === focusPathway.value)
      .map(r => ({
        id: r.id, name: r.name, dps: r.dps, idx: r.dps / m,
        flagged: Math.abs(r.dps / m - 1) > threshold.value,
      }))
      .sort((a, b) => b.idx - a.idx);
});

const jumpToAbility = async (id: string) => {
  flashId.value = id;
  await nextTick();
  document.getElementById(`ability-row-${id}`)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  setTimeout(() => {
    if (flashId.value === id) flashId.value = null;
  }, 1800);
};

// ---------- outliers ----------
const outlierRows = computed<StripRow[]>(() => {
  if (!ctx.value) return [];
  const c = ctx.value;
  const rows: Array<{ a: (typeof c.damageAbilities)[number]; dps: number }> = [];
  const bySeq: Record<number, number[]> = {};
  for (const a of c.damageAbilities) {
    const prof = c.profiles[a.pathway]?.[a.sequence];
    if (!prof) continue;
    const cost = effCost(a, prof.maxSpirituality);
    if (cost <= 0) continue;
    const dps = castDamage(a, a._primary!, 60).dmg * c.payload.sequenceTables.damageMultiplier[a.sequence] / cost;
    (bySeq[a.sequence] = bySeq[a.sequence] || []).push(dps);
    rows.push({a, dps});
  }
  const med: Record<number, number | null> = {};
  for (const s of Object.keys(bySeq)) med[+s] = median(bySeq[+s]);
  return rows
      .map(r => ({r, idx: (med[r.a.sequence] ?? 0) > 0 ? r.dps / med[r.a.sequence]! : 1}))
      .filter(x => Math.abs(x.idx - 1) > threshold.value)
      .sort((x, y) => Math.abs(Math.log2(y.idx)) - Math.abs(Math.log2(x.idx)))
      .slice(0, 30)
      .map(x => ({
        id: x.r.a.id,
        name: `${x.r.a.pathway} S${x.r.a.sequence} · ${x.r.a.plainName}`,
        dps: x.r.dps,
        idx: x.idx,
        flagged: true,
      }));
});

const jumpToOutlier = (id: string) => {
  const a = payload.value?.abilities.find(x => x.id === id);
  if (!a) return;
  focusPathway.value = a.pathway;
  stripSeq.value = a.sequence;
  jumpToAbility(id);
};

// ---------- telemetry extras ----------
const killKeys = computed(() => payload.value?.telemetry?.topPvpKillKeys || []);
const silentAbilities = computed(() =>
    ctx.value ? ctx.value.damageAbilities.filter(a => !dmgByKey.value[a._primary!]) : []);

// ---------- edits ----------
const damageChanges = computed<DamageChange[]>(() => {
  const out: DamageChange[] = [];
  if (!payload.value) return out;
  for (const a of payload.value.abilities)
    for (const k of Object.keys(a._orig))
      if (Math.abs(a.damageKeys[k] - a._orig[k]) > 1e-9)
        out.push({pathway: a.pathway, key: k, oldVal: a._orig[k], newVal: a.damageKeys[k]});
  return out;
});

const dmgEditCount = computed(() => damageChanges.value.length);

const tuneEditCount = computed(() => {
  let n = 0;
  if (!payload.value) return n;
  for (const a of payload.value.abilities) {
    if (a.effectiveCooldownSeconds !== a._eff0.cd) n++;
    for (const cat of Object.keys(a._eff0.cats))
      if (a.effectiveCategoryCooldowns[cat] !== a._eff0.cats[cat]) n++;
    if (a.effectiveFlatCost !== a._eff0.flat) n++;
    if (a.effectiveCostPercentage !== a._eff0.pct) n++;
  }
  return n;
});

const hasTuningEntries = computed(() =>
    payload.value ? Object.keys(tuningEntries(payload.value.abilities)).length > 0 : false);

const resetEdits = () => {
  if (!payload.value) return;
  for (const a of payload.value.abilities) {
    a.damageKeys = {...a._orig};
    a.effectiveCooldownSeconds = a._eff0.cd;
    a.effectiveCategoryCooldowns = {...a._eff0.cats};
    a.effectiveFlatCost = a._eff0.flat;
    a.effectiveCostPercentage = a._eff0.pct;
  }
};

const downloadDamage = () => {
  if (payload.value) downloadText('damage-config.yml', patchedDamageYaml(payload.value, damageChanges.value));
};
const downloadTuning = () => {
  if (payload.value) downloadText('tuning-config.yml', tuningYaml(payload.value.abilities));
};

// ---------- selection ----------
const togglePathway = (p: string) => {
  const i = selectedPathways.value.indexOf(p);
  if (i >= 0) {
    selectedPathways.value.splice(i, 1);
    delete slotOf[p];
    return;
  }
  if (selectedPathways.value.length >= 4) return;
  const used = new Set(Object.values(slotOf));
  let slot = 0;
  while (used.has(slot)) slot++;
  slotOf[p] = slot;
  selectedPathways.value.push(p);
};

// ---------- load / persist ----------
const acceptPayload = (raw: unknown): boolean => {
  const err = validatePayload(raw);
  if (err) {
    loadError.value = 'Invalid payload: ' + err;
    return false;
  }
  loadError.value = '';
  payload.value = enrichPayload(raw as CoiBalancePayload);
  if (!telemetryAvailable.value && metric.value === 'empirical') metric.value = 'dps60';
  // reconcile UI state with the new payload
  const known = new Set(Object.keys(payload.value.pathways));
  selectedPathways.value = selectedPathways.value.filter(p => known.has(p));
  for (const p of Object.keys(slotOf)) if (!known.has(p)) delete slotOf[p];
  if (!selectedPathways.value.length && allPathways.value.length) togglePathway(allPathways.value[0]);
  if (!focusPathway.value || !known.has(focusPathway.value)) focusPathway.value = selectedPathways.value[0] ?? allPathways.value[0] ?? '';
  return true;
};

const readFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      acceptPayload(JSON.parse(String(reader.result)));
    } catch {
      loadError.value = 'Could not parse that file as JSON.';
    }
  };
  reader.readAsText(file);
};

const onFilePicked = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) readFile(f);
  (e.target as HTMLInputElement).value = '';
};

const onDrop = (e: DragEvent) => {
  dragDepth.value = 0;
  const f = e.dataTransfer?.files?.[0];
  if (f) readFile(f);
};

// ---------- server fetch ----------
// GET /api/balance-report: a permission-gated proxy (api/balance-report.ts on
// Vercel, dev middleware locally) that verifies this session holds
// ADMIN/BALANCE:MANAGE before calling catwalk's /balance/report with the
// server-held API key. The key never reaches the client, and the open
// /catwalk/* proxy refuses balance paths. Envelope: { success, message, data }.
const authStore = useAuthStore();
const fetchingReport = ref(false);

const fetchFromServer = async () => {
  if (fetchingReport.value) return;
  if (payload.value && dmgEditCount.value + tuneEditCount.value > 0
      && !confirm('Replace the loaded payload? Your unsaved edits will be lost.')) return;
  const token = authStore.currentToken;
  if (!token) {
    loadError.value = 'Your session has expired — sign in again to fetch from the server.';
    return;
  }
  fetchingReport.value = true;
  loadError.value = '';
  try {
    const res = await fetch('/api/balance-report', {
      headers: {Accept: 'application/json', Authorization: `Bearer ${token}`},
    });
    let body: { success?: boolean; message?: string; data?: unknown } | null = null;
    try {
      body = await res.json();
    } catch { /* non-JSON error page — fall through to the status check */
    }
    if (!res.ok) {
      loadError.value = `Server fetch failed (HTTP ${res.status})${body?.message ? ': ' + body.message : ''}.`;
      return;
    }
    if (!body?.success || !body.data || typeof body.data !== 'object') {
      loadError.value = 'Server fetch failed: ' + (body?.message || 'unexpected response shape.');
      return;
    }
    if (!Object.keys(body.data).length) {
      loadError.value = 'The server has no balance report yet — run /coi balance export there first.';
      return;
    }
    acceptPayload(body.data); // sets its own loadError if the payload is malformed
  } catch {
    loadError.value = 'Could not reach the server report endpoint — check your connection and try again.';
  } finally {
    fetchingReport.value = false;
  }
};

const clearPayload = () => {
  if (!confirm('Forget the loaded payload and all edits?')) return;
  payload.value = null;
  selectedPathways.value = [];
  for (const p of Object.keys(slotOf)) delete slotOf[p];
  focusPathway.value = '';
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(UI_KEY);
  } catch { /* ignore */
  }
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;
watch(payload, () => {
  if (!payload.value) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.value));
    } catch { /* payload too large for localStorage — page still works, just won't survive refresh */
    }
  }, 800);
}, {deep: true});

watch([metric, selectedPathways, showAbsolute, focusPathway, stripSeq], () => {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify({
      metric: metric.value,
      selected: selectedPathways.value,
      slots: {...slotOf},
      showAbsolute: showAbsolute.value,
      focusPathway: focusPathway.value,
      stripSeq: stripSeq.value,
    }));
  } catch { /* ignore */
  }
}, {deep: true});

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'});
};

// ---------- methodology ----------
const methodology = computed(() => {
  if (!payload.value) return '';
  const T = payload.value.sequenceTables;
  return `All theoretical numbers assume the idealized duelist: full acting ratio, uniqueness 1.0, zero madness/tiredness, no amplification. ${payload.value.meta.assumptions}

maxSpirit(P,S) = baseSpirituality[S] × pathway spirituality multiplier (from the payload)
regen/s = maxSpirit/400 + 1
effective damage = configured S9 base × sequence damage multiplier [${T.damageMultiplier.join(', ')}] (index = sequence)
effective cost = flat cost, or %-cost × maxSpirit
Sustained DPS-60: budget = maxSpirit + 60×regen; abilities greedily cast best damage-per-spirit first; casts = min(60/cooldown + 1, budget/cost); DPS = total / 60.
Burst-10: same with a 10s window and no regen.
Damage per spirit = plan damage ÷ spirit spent.
Fairness index = value ÷ cross-pathway median at the same sequence; flagged when |index − 1| > ${Math.round(threshold.value * 100)}%.
Empirical columns come from live telemetry (window: ${windowDays.value} days).
An ability's damage per cast uses its ★ primary key only — variant keys are visible in the drilldown but deliberately never summed.
Keys with a ◆ damage-key profile replace the once-per-cast assumption: ACTIVE_CAST weights damage by proc chance; DoT/aura keys count sustained DPS × duration per application (re-applying refreshes, never stacks, on the single duelist target); throttled on-hit keys count as a continuous stream (DPS × fight length, one activation); an unthrottled on-hit is attack-speed-bound and keeps the old per-cast number. Unprofiled keys still assume one hit per cast.${payload.value.meta.damageProfiles ? '\n' + payload.value.meta.damageProfiles : ''}
Cost and cooldown are EFFECTIVE values: tuning-config.yml overrides layered over the hardcoded numbers. The tuning download regenerates that file in full (pre-existing overrides plus your edits), so it is always safe to drop in.`;
});

// ---------- lifecycle ----------
onMounted(() => {
  themeObserver = new MutationObserver(() => {
    isParchment.value = document.documentElement.getAttribute('data-theme') === 'parchment';
  });
  themeObserver.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});

  try {
    const ui = localStorage.getItem(UI_KEY);
    if (ui) {
      const u = JSON.parse(ui);
      if (u.metric) metric.value = u.metric;
      if (Array.isArray(u.selected)) selectedPathways.value = u.selected;
      if (u.slots) Object.assign(slotOf, u.slots);
      if (typeof u.showAbsolute === 'boolean') showAbsolute.value = u.showAbsolute;
      if (u.focusPathway) focusPathway.value = u.focusPathway;
      if (typeof u.stripSeq === 'number') stripSeq.value = u.stripSeq;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) acceptPayload(JSON.parse(raw));
  } catch { /* stale storage — start clean */
  }
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  if (saveTimer) clearTimeout(saveTimer);
});
</script>

<style scoped>
.balance-view {
  padding: 20px 28px 120px;
  max-width: 1440px;
  margin: 0 auto;
}

/* ---------- header ---------- */
.page-header {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--myst-ink-muted);
  flex-shrink: 0;
}

.back-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, var(--myst-gold));
  color: var(--myst-ink);
  transform: translateX(-2px);
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--myst-ink);
  letter-spacing: 0.5px;
}

.page-subtitle {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--myst-gold);
  opacity: 0.85;
}

.header-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: none;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 45%, transparent);
  border-radius: 8px;
  color: var(--myst-gold);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-btn:hover {
  background: color-mix(in srgb, var(--myst-gold) 12%, transparent);
}

.ghost-btn.danger {
  border-color: color-mix(in srgb, #ef4444 45%, transparent);
  color: #ef4444;
}

.ghost-btn.danger:hover {
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

/* ---------- drag & empty ---------- */
.drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: color-mix(in srgb, var(--myst-bg) 80%, transparent);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drop-overlay-inner {
  border: 2px dashed var(--myst-gold);
  border-radius: 16px;
  padding: 48px 64px;
  font-size: 18px;
  color: var(--myst-ink);
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--myst-bg-2);
}

.drop-sigil {
  color: var(--myst-gold);
  font-size: 26px;
}

.empty-state {
  margin-top: 48px;
  padding: 64px 32px;
  text-align: center;
  border: 2px dashed color-mix(in srgb, var(--myst-gold) 40%, transparent);
  border-radius: 16px;
  background: color-mix(in srgb, var(--myst-bg-2) 60%, transparent);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.empty-state:hover {
  border-color: var(--myst-gold);
  background: var(--myst-bg-2);
}

.empty-sigil {
  font-size: 40px;
  color: var(--myst-gold);
  margin-bottom: 12px;
  animation: sigil-pulse 3s ease-in-out infinite;
}

@keyframes sigil-pulse {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

.empty-state h2 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  margin: 0 0 8px;
  color: var(--myst-ink);
}

.fetch-cta {
  padding: 11px 26px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 6px;
}

.fetch-cta:hover:not(:disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.fetch-cta:disabled {
  opacity: 0.55;
  cursor: progress;
}

.empty-or {
  color: color-mix(in srgb, var(--myst-ink-muted) 70%, transparent);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 14px 0 10px;
}

.empty-lead {
  color: var(--myst-ink-muted);
  margin: 0 0 24px;
}

.empty-steps {
  display: inline-block;
  text-align: left;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 2;
  margin: 0;
}

.empty-steps code, .empty-lead code, .drop-overlay-inner code {
  background: color-mix(in srgb, var(--myst-gold) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
}

/* ---------- meta ---------- */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.meta-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 28%, transparent);
  border-radius: 999px;
  padding: 3px 12px;
  background: color-mix(in srgb, var(--myst-bg-2) 70%, transparent);
}

.meta-chip b {
  color: var(--myst-ink);
  font-weight: 600;
}

.meta-chip.ok b {
  color: #10b981;
}

.meta-chip.off b {
  color: #f59e0b;
}

/* ---------- cards ---------- */
.card {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  border-radius: 14px;
  padding: 22px 26px;
  margin-bottom: 20px;
}

.card-head {
  margin-bottom: 16px;
}

.card h2 {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--myst-ink);
  margin: 0 0 6px;
}

.head-metric {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 400;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 1px;
  vertical-align: 2px;
}

.card-sub {
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.55;
  margin: 0;
  max-width: 900px;
}

.hint-empty {
  color: var(--myst-ink-muted);
  font-size: 13px;
  margin: 0;
}

/* ---------- controls ---------- */
.controls-card {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group.grow {
  flex: 1;
  min-width: 260px;
}

.control-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--myst-ink-muted);
}

.control-label em {
  font-style: normal;
  opacity: 0.7;
  text-transform: none;
  letter-spacing: 0;
}

.segmented {
  display: inline-flex;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 8px;
  overflow: hidden;
}

.segmented button {
  padding: 7px 14px;
  background: none;
  border: none;
  border-right: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  color: var(--myst-ink-muted);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
}

.segmented button:last-child {
  border-right: none;
}

.segmented button:hover:not(:disabled) {
  color: var(--myst-ink);
  background: color-mix(in srgb, var(--myst-gold) 8%, transparent);
}

.segmented button.active {
  background: var(--myst-gold);
  color: var(--myst-bg);
  font-weight: 700;
}

.segmented button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pathway-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pathway-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 13px;
  background: none;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 32%, transparent);
  border-radius: 999px;
  color: var(--myst-ink-muted);
  font-size: 12px;
  text-transform: capitalize;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pathway-chip:hover:not(:disabled) {
  border-color: var(--myst-gold);
  color: var(--myst-ink);
}

.pathway-chip.selected {
  border-color: color-mix(in srgb, var(--myst-gold) 60%, transparent);
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  color: var(--myst-ink);
  font-weight: 600;
}

.pathway-chip:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.chip-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-ink-muted);
  font-size: 13px;
  cursor: pointer;
  margin-top: 22px;
}

/* ---------- matrix ---------- */
.matrix-wrap {
  overflow-x: auto;
}

.matrix {
  border-collapse: collapse;
  width: 100%;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}

.matrix th {
  color: var(--myst-ink-muted);
  font-weight: 500;
  text-align: right;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  padding: 6px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  white-space: nowrap;
}

.matrix .rowhead-th {
  text-align: left;
}

.matrix td {
  padding: 6px 10px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 12%, transparent);
  color: var(--myst-ink);
}

.matrix tbody tr:not(.median-row) {
  cursor: pointer;
  transition: background 0.15s ease;
}

.matrix tbody tr:not(.median-row):hover {
  background: color-mix(in srgb, var(--myst-gold) 7%, transparent);
}

.matrix tr.row-selected .rowhead {
  color: var(--myst-gold);
  font-weight: 700;
}

.matrix .rowhead {
  white-space: nowrap;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix .cell {
  text-align: right;
  min-width: 62px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.matrix .cell.flag {
  outline: 2px solid var(--bal-crit);
  outline-offset: -2px;
}

.matrix .median-row td {
  color: var(--myst-ink-muted);
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-bottom: none;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.matrix .median-row td:first-child {
  text-align: left;
}

/* ---------- drilldown ---------- */
.drill-controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.drill-controls label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--myst-ink-muted);
  font-size: 13px;
}

.drill-controls select {
  padding: 7px 12px;
  background: var(--myst-bg);
  color: var(--myst-ink);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 8px;
  font-size: 13px;
  text-transform: capitalize;
}

.drill-controls select:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 18%, transparent);
}

.strip-block {
  margin-bottom: 22px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 18%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--myst-bg) 55%, transparent);
}

.strip-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--myst-ink-muted);
  margin: 0 0 10px;
}

/* ---------- kill keys ---------- */
.kill-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.kill-row {
  display: grid;
  grid-template-columns: 260px 1fr 70px;
  gap: 10px;
  align-items: center;
  padding: 3px 0;
}

.kill-label {
  color: var(--myst-ink-muted);
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kill-track {
  height: 14px;
  position: relative;
}

.kill-bar {
  position: absolute;
  left: 0;
  top: 1px;
  height: 12px;
  background: var(--bal-neg);
  border-radius: 0 4px 4px 0;
  min-width: 2px;
}

.kill-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-ink);
  font-variant-numeric: tabular-nums;
}

/* ---------- methodology ---------- */
.method-summary {
  cursor: pointer;
  color: var(--myst-ink);
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
}

.method-body {
  white-space: pre-wrap;
  color: var(--myst-ink-muted);
  font-size: 12.5px;
  line-height: 1.7;
  font-family: 'JetBrains Mono', monospace;
  margin: 14px 0 0;
}

/* ---------- edit bar ---------- */
.edit-bar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 12px 20px;
  background: color-mix(in srgb, var(--myst-bg-2) 92%, var(--myst-gold));
  border: 1px solid color-mix(in srgb, var(--myst-gold) 45%, transparent);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  max-width: calc(100vw - 40px);
  flex-wrap: wrap;
}

.editbar-enter-active, .editbar-leave-active {
  transition: all 0.25s ease;
}

.editbar-enter-from, .editbar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

.edit-bar-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--myst-ink);
  flex-wrap: wrap;
}

.edit-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.edit-sep {
  opacity: 0.5;
}

.edit-hint {
  color: var(--myst-ink-muted);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
}

.edit-bar-actions {
  display: flex;
  gap: 10px;
}

.dl-btn {
  padding: 8px 16px;
  background: var(--myst-gold);
  color: var(--myst-bg);
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dl-btn:hover:not(:disabled) {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.dl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quiet-download {
  color: var(--myst-ink-muted);
  font-size: 13px;
  text-align: center;
  padding: 4px 0 12px;
}

.link-btn {
  background: none;
  border: none;
  color: var(--myst-gold);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

/* ---------- feedback ---------- */
.error-banner {
  background: color-mix(in srgb, #ef4444 14%, transparent);
  color: #ef4444;
  padding: 14px 20px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 500;
}

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .balance-view {
    padding: 16px 14px 140px;
  }

  .page-header {
    flex-wrap: wrap;
  }

  .header-actions {
    width: 100%;
    margin-left: 0;
  }

  .card {
    padding: 16px;
  }

  .kill-row {
    grid-template-columns: 140px 1fr 54px;
  }
}
</style>
