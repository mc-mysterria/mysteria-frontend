/**
 * Types for the Circle of Imagination balance payload (export-latest.json),
 * produced server-side by BalanceExportService.export() + BalanceSpecService.buildPayload().
 * Contract reference: BALANCE_WEB_HANDOFF.md §2
 */

export interface SequenceTables {
    damageMultiplier: number[];      // index = sequence, [0] = S0 (god tier) … [9] = S9
    baseMaxSpirituality: number[];
    healthMultiplier: number[];
    baseHealth: number;
}

export interface PathwayRow {
    sequence: number;
    spiritualityMultiplier: number;
    maxSpirituality: number;
    regenPerSecond: number;
    maxHealth: number;
}

/** How a damage key actually lands, when the owning ability declares it (§handoff "damage-key profiles"). */
export type DamageTrigger = 'ACTIVE_CAST' | 'ON_HIT' | 'DOT_TICK' | 'AURA_TICK' | 'SUMMON_HIT' | 'OTHER';

export interface DamageKeyProfile {
    trigger: DamageTrigger;
    procChance: number;              // 0–1, always present; 1.0 = guaranteed
    internalCooldownSeconds: number; // ability-enforced throttle between procs; 0 = none
    tickIntervalSeconds: number;     // seconds between DoT/aura applications; 0 = not tick-based
    maxDurationSeconds: number;      // 0 = n/a, -1 = until cured/cleared (sentinel – never use in math)
    expectedDurationSeconds: number; // author's typical-length estimate; 0 = unset
    aoe: boolean;                    // display flag, not math
    notes?: string;                  // conditions the numbers can't express – show verbatim
}

/** Flat per-key row in the export. Derived fields are Sequence-9 baselines, each independently absent. */
export interface DamageEntry {
    pathway: string;
    key: string;
    baseDamage: number;
    abilityId?: string;
    abilityName?: string;
    abilitySequence?: number;
    attribution?: string;
    profile?: DamageKeyProfile;
    expectedDamagePerTrigger?: number;    // baseDamage × procChance
    effectivePeriodSeconds?: number;      // absent = period unknown (e.g. attack-speed-bound)
    sustainedDps?: number;                // absent on a profiled entry ≠ 0 DPS
    expectedTotalPerApplication?: number; // DOT/AURA with a known duration only
}

export interface AbilitySpec {
    id: string;                      // "sun-0-1" = pathway-seqLevel-index
    pathway: string;                 // lowercase
    sequence: number;                // native sequence; available at S ⇔ sequence >= S
    plainName: string;
    kebabName: string;               // join key for damage keys and telemetry
    type: string;                    // ATTACK, PASSIVE, MOBILITY, …
    activated: boolean;
    flatCost: number;
    costPercentage: number;
    cooldownSeconds: number;         // -1 = no cooldown contract
    categoryCooldowns: Record<string, number>;
    effectiveCooldownSeconds: number;
    effectiveCategoryCooldowns: Record<string, number>;
    effectiveFlatCost: number;
    effectiveCostPercentage: number;
    damageKeys: Record<string, number>; // key → Sequence-9 base damage
    damageProfiles?: Record<string, DamageKeyProfile>; // absent on pre-profile exports; enrich defaults to {}
}

/** Pristine copies attached on load so edits can be tracked and reset (§5). */
export interface EnrichedAbility extends AbilitySpec {
    _orig: Record<string, number>;   // damageKeys at load time
    _hard: { cd: number; cats: Record<string, number>; flat: number; pct: number };
    _eff0: { cd: number; cats: Record<string, number>; flat: number; pct: number };
    _primary: string | null;         // primary damage key (★)
}

export interface DamageByKeyRow {
    key: string;
    hits: number;
    pvpHits: number;
    avgFinal: number;
    pvpAvgFinal: number | null;
    avgBase: number;
    attackers: number;
}

export interface CastsByKeyRow {
    key: string;
    casts: number;
    casters: number;
    avgCost: number;
}

export interface Telemetry {
    available: boolean;
    error?: string;
    damageByKey?: DamageByKeyRow[];
    castsByKey?: CastsByKeyRow[];
    damageByPathway?: Array<{ pathway: string; seq: number; hits: number; totalDamage: number; pvpDamage: number }>;
    castsByPathway?: Array<{ pathway: string; seq: number; casts: number }>;
    killsByPathway?: Array<{ pathway: string; seq: number; kills: number; pvpKills: number }>;
    deathsByPathway?: Array<{ pathway: string; seq: number; deaths: number }>;
    topPvpKillKeys?: Array<{ key: string; kills: number }>;
}

export interface CoiBalancePayload {
    schemaVersion?: number;          // still 2 with profiles (additive); plugin bumps to 3 once we render them
    meta: { pluginVersion: string; generatedAt: string; assumptions: string; damageProfiles?: string };
    exportMeta: { windowDays: number; fairnessDeviationPercent: number };
    sequenceTables: SequenceTables;
    pathways: Record<string, PathwayRow[]>;
    abilities: EnrichedAbility[];
    damageEntries?: DamageEntry[];
    unownedDamageKeys?: unknown;
    orphanKeys: Record<string, string[]>;
    damageConfigLines: string[];
    bypassSites: string[];
    telemetry: Telemetry;
}

export type MetricId = 'dps60' | 'burst10' | 'dmgPerSpirit' | 'empirical';

export interface DamageChange {
    pathway: string;
    key: string;
    oldVal: number;
    newVal: number;
}
