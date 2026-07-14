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
    meta: { pluginVersion: string; generatedAt: string; assumptions: string };
    exportMeta: { windowDays: number; fairnessDeviationPercent: number };
    sequenceTables: SequenceTables;
    pathways: Record<string, PathwayRow[]>;
    abilities: EnrichedAbility[];
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
