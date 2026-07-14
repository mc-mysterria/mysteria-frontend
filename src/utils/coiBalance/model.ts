/**
 * Domain math for the CoI balance dashboard — BALANCE_WEB_HANDOFF.md §3.
 * All formulas assume the idealized duelist: full acting ratio, uniqueness 1.0,
 * zero madness/tiredness, no amplification. Mirrors dashboard.html reference impl.
 */
import type {CoiBalancePayload, EnrichedAbility, MetricId, PathwayRow,} from '@/types/coi-balance';

export const SEQS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const TICK_SUFFIX = /-(tick|dot|per-second)$/;

export const METRICS: Array<{ id: MetricId; label: string; short: string }> = [
    {id: 'dps60', label: 'Sustained DPS (60s fight)', short: 'DPS-60'},
    {id: 'burst10', label: 'Burst DPS (10s, no regen)', short: 'Burst-10'},
    {id: 'dmgPerSpirit', label: 'Damage per spirit point', short: 'Dmg/Spirit'},
    {id: 'empirical', label: 'Empirical avg damage / cast', short: 'Empirical'},
];

/** Validate raw JSON before accepting it (§2). Returns an error string or null. */
export function validatePayload(raw: unknown): string | null {
    const p = raw as Partial<CoiBalancePayload> | null;
    if (!p || typeof p !== 'object') return 'Not a JSON object.';
    if (!p.sequenceTables || !Array.isArray(p.sequenceTables.damageMultiplier)
        || p.sequenceTables.damageMultiplier.length !== 10)
        return 'sequenceTables.damageMultiplier must have 10 entries — re-run /coi balance export.';
    if (!Array.isArray(p.abilities) || p.abilities.length === 0)
        return 'No abilities in payload — re-run /coi balance export.';
    if (!p.pathways || typeof p.pathways !== 'object')
        return 'Missing pathways table — re-run /coi balance export.';
    if (!Array.isArray(p.damageConfigLines))
        return 'Missing damageConfigLines — re-run /coi balance export.';
    return null;
}

/**
 * Attach pristine copies + primary key to every ability (§5).
 * Idempotent: a payload restored from localStorage already carries them.
 */
export function enrichPayload(payload: CoiBalancePayload): CoiBalancePayload {
    for (const a of payload.abilities) {
        if (!a._orig) a._orig = {...a.damageKeys};
        if (!a._hard) a._hard = {
            cd: a.cooldownSeconds, cats: {...a.categoryCooldowns},
            flat: a.flatCost, pct: a.costPercentage,
        };
        if (!a._eff0) a._eff0 = {
            cd: a.effectiveCooldownSeconds, cats: {...a.effectiveCategoryCooldowns},
            flat: a.effectiveFlatCost, pct: a.effectiveCostPercentage,
        };
        if (a._primary === undefined || a._primary === null) {
            a._primary = null;
            const keys = Object.keys(a.damageKeys);
            if (keys.length) {
                if (a.damageKeys[a.kebabName] !== undefined) a._primary = a.kebabName;
                else {
                    const nonTick = keys.filter(k => !TICK_SUFFIX.test(k));
                    const pool = nonTick.length ? nonTick : keys;
                    a._primary = pool.reduce((b, k) => a.damageKeys[k] > a.damageKeys[b] ? k : b, pool[0]);
                }
            }
        }
    }
    return payload;
}

export type Profiles = Record<string, Record<number, PathwayRow>>;

export function buildProfiles(payload: CoiBalancePayload): Profiles {
    const profiles: Profiles = {};
    for (const [p, rows] of Object.entries(payload.pathways)) {
        profiles[p] = {};
        for (const r of rows) profiles[p][r.sequence] = r;
    }
    return profiles;
}

/** Ability field accessors — `pristine` reads the pre-edit values for ghost lines. */
const getDamage = (a: EnrichedAbility, key: string, pristine: boolean) =>
    pristine ? a._orig[key] : a.damageKeys[key];
const getCd = (a: EnrichedAbility, pristine: boolean) => {
    const v = pristine ? a._eff0.cd : a.effectiveCooldownSeconds;
    return v > 0 ? v : 1;
};
export const effCost = (a: EnrichedAbility, maxSpirit: number, pristine = false): number => {
    const flat = pristine ? a._eff0.flat : a.effectiveFlatCost;
    const pct = pristine ? a._eff0.pct : a.effectiveCostPercentage;
    return flat > 0 ? flat : pct > 0 ? Math.floor(maxSpirit * 0.01 * pct) : 0;
};

export interface PlanRow {
    a: EnrichedAbility;
    dmg: number;
    cost: number;
    ratio: number;
    casts: number;
}

export interface CastPlan {
    total: number;
    spent: number;
    rows: PlanRow[];
    dps: number;
}

export interface ModelCtx {
    payload: CoiBalancePayload;
    profiles: Profiles;
    damageAbilities: EnrichedAbility[];
    dmgByPathSeq: Record<string, { totalDamage: number }>;
    castsByPathSeq: Record<string, { casts: number }>;
}

export function buildCtx(payload: CoiBalancePayload): ModelCtx {
    const tele = payload.telemetry || {available: false};
    const dmgByPathSeq: ModelCtx['dmgByPathSeq'] = {};
    for (const r of tele.damageByPathway || []) dmgByPathSeq[r.pathway + '|' + r.seq] = r;
    const castsByPathSeq: ModelCtx['castsByPathSeq'] = {};
    for (const r of tele.castsByPathway || []) castsByPathSeq[r.pathway + '|' + r.seq] = r;
    return {
        payload,
        profiles: buildProfiles(payload),
        damageAbilities: payload.abilities.filter(a => a._primary),
        dmgByPathSeq,
        castsByPathSeq,
    };
}

/** Greedy cast plan (§3): best damage-per-spirit first, limited by cooldown and budget. */
export function plan(
    ctx: ModelCtx, pathway: string, seq: number,
    fightSecs: number, withRegen: boolean, pristine = false,
): CastPlan | null {
    const prof = ctx.profiles[pathway]?.[seq];
    if (!prof) return null;
    const dmgMult = ctx.payload.sequenceTables.damageMultiplier[seq];
    const avail = ctx.damageAbilities.filter(a => a.pathway === pathway && a.sequence >= seq);
    if (!avail.length) return null;
    let budget = prof.maxSpirituality + (withRegen ? prof.regenPerSecond * fightSecs : 0);
    const rows: PlanRow[] = avail.map(a => {
        const dmg = getDamage(a, a._primary!, pristine) * dmgMult;
        const cost = effCost(a, prof.maxSpirituality, pristine);
        return {a, dmg, cost, ratio: cost > 0 ? dmg / cost : Infinity, casts: 0};
    }).sort((x, y) => y.ratio - x.ratio);
    let total = 0, spent = 0;
    for (const r of rows) {
        const byCd = Math.floor(fightSecs / getCd(r.a, pristine)) + 1;
        const byBudget = r.cost > 0 ? Math.floor(budget / r.cost) : Infinity;
        r.casts = Math.max(0, Math.min(byCd, byBudget));
        total += r.casts * r.dmg;
        budget -= r.casts * r.cost;
        spent += r.casts * r.cost;
    }
    return {total, spent, rows, dps: total / fightSecs};
}

export function metricValue(
    ctx: ModelCtx, metric: MetricId, pathway: string, seq: number, pristine = false,
): number | null {
    if (metric === 'empirical') {
        const d = ctx.dmgByPathSeq[pathway + '|' + seq];
        const c = ctx.castsByPathSeq[pathway + '|' + seq];
        return d && c && c.casts > 0 ? d.totalDamage / c.casts : null;
    }
    const p60 = plan(ctx, pathway, seq, 60, true, pristine);
    if (!p60) return null;
    if (metric === 'dps60') return p60.dps;
    if (metric === 'dmgPerSpirit') return p60.spent > 0 ? p60.total / p60.spent : null;
    const p10 = plan(ctx, pathway, seq, 10, false, pristine);
    return p10 ? p10.total / 10 : null;
}

export const median = (xs: Array<number | null | undefined>): number | null => {
    const s = xs.filter((x): x is number => x != null && isFinite(x)).sort((a, b) => a - b);
    if (!s.length) return null;
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export const fmt = (x: number | null | undefined): string =>
    x == null ? '—'
        : x >= 1000000 ? (x / 1000000).toFixed(1) + 'M'
            : x >= 1000 ? (x / 1000).toFixed(1) + 'K'
                : x >= 100 ? x.toFixed(0)
                    : x.toFixed(1);
