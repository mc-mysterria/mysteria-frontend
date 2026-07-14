import {describe, expect, it} from 'vitest';
import type {CoiBalancePayload, DamageKeyProfile, EnrichedAbility} from '@/types/coi-balance';
import {buildCtx, castDamage, enrichPayload, median, metricValue, plan, profileMath, validatePayload} from '../model';
import {patchedDamageYaml, tuningEntries, tuningYaml} from '../yaml';

const ability = (over: Partial<EnrichedAbility>): EnrichedAbility => ({
    id: 'sun-9-0',
    pathway: 'sun',
    sequence: 9,
    plainName: 'holy light',
    kebabName: 'holy-light',
    type: 'ATTACK',
    activated: false,
    flatCost: 10,
    costPercentage: 0,
    cooldownSeconds: 5,
    categoryCooldowns: {},
    effectiveCooldownSeconds: 5,
    effectiveCategoryCooldowns: {},
    effectiveFlatCost: 10,
    effectiveCostPercentage: 0,
    damageKeys: {'holy-light': 4},
    ...over,
} as EnrichedAbility);

const makePayload = (): CoiBalancePayload => ({
    meta: {pluginVersion: '1.0', generatedAt: '2026-07-14T00:00:00Z', assumptions: ''},
    exportMeta: {windowDays: 30, fairnessDeviationPercent: 25},
    sequenceTables: {
        damageMultiplier: [28, 10.6, 8.6, 6.2, 4.5, 2.5, 2.2, 1.8, 1.25, 1],
        baseMaxSpirituality: [1000000, 500000, 25000, 12000, 6000, 3000, 1500, 800, 300, 100],
        healthMultiplier: [10, 8, 6, 5, 4, 3, 2.5, 2, 1.5, 1],
        baseHealth: 50,
    },
    pathways: {
        sun: [{sequence: 9, spiritualityMultiplier: 1, maxSpirituality: 100, regenPerSecond: 1.25, maxHealth: 50}],
        fool: [{sequence: 9, spiritualityMultiplier: 1.6, maxSpirituality: 160, regenPerSecond: 1.4, maxHealth: 50}],
    },
    abilities: [
        ability({}),
        ability({
            id: 'sun-9-1', kebabName: 'flame-wave', plainName: 'flame wave',
            flatCost: 0, costPercentage: 20, effectiveFlatCost: 0, effectiveCostPercentage: 20,
            damageKeys: {'flame-wave': 6, 'flame-wave-tick': 9},
        }),
        ability({
            id: 'fool-9-0', pathway: 'fool', kebabName: 'paper-cut', plainName: 'paper cut',
            damageKeys: {'paper-cut': 4},
        }),
    ],
    orphanKeys: {},
    damageConfigLines: [
        'version: 1.0.0',
        'sun:',
        '  holy-light: 4  # base',
        '  flame-wave: 6',
        'fool:',
        '  paper-cut: 4',
    ],
    bypassSites: [],
    telemetry: {available: false},
});

describe('validatePayload', () => {
    it('accepts a well-formed payload and rejects a malformed one', () => {
        expect(validatePayload(makePayload())).toBeNull();
        expect(validatePayload({})).toMatch(/damageMultiplier/);
    });
});

describe('enrichPayload', () => {
    it('assigns primary keys: exact kebab match wins, tick variants excluded', () => {
        const p = enrichPayload(makePayload());
        const flame = p.abilities.find(a => a.id === 'sun-9-1')!;
        expect(flame._primary).toBe('flame-wave'); // exact match beats higher-valued -tick key
        expect(p.abilities[0]._orig).toEqual({'holy-light': 4});
    });
});

describe('plan / metricValue', () => {
    it('greedy plan limits casts by cooldown and budget', () => {
        const ctx = buildCtx(enrichPayload(makePayload()));
        // sun @ S9, 10s burst, no regen: budget 100.
        // holy-light: dmg 4, cost 10, ratio 0.4; flame-wave: dmg 6, cost floor(100*0.2)=20, ratio 0.3
        // holy-light first: byCd = floor(10/5)+1 = 3, byBudget = 10 → 3 casts (12 dmg, 30 spent, 70 left)
        // flame-wave: byCd = 3, byBudget = floor(70/20) = 3 → 3 casts (18 dmg)
        const p = plan(ctx, 'sun', 9, 10, false)!;
        expect(p.total).toBe(30);
        expect(p.spent).toBe(90);
        expect(metricValue(ctx, 'burst10', 'sun', 9)).toBe(3);
        expect(metricValue(ctx, 'empirical', 'sun', 9)).toBeNull(); // telemetry off
    });

    it('returns null for a pathway/sequence with no profile', () => {
        const ctx = buildCtx(enrichPayload(makePayload()));
        expect(plan(ctx, 'sun', 5, 60, true)).toBeNull();
    });
});

describe('damage-key profiles', () => {
    const profile = (over: Partial<DamageKeyProfile>): DamageKeyProfile => ({
        trigger: 'ACTIVE_CAST', procChance: 1, internalCooldownSeconds: 0,
        tickIntervalSeconds: 0, maxDurationSeconds: 0, expectedDurationSeconds: 0,
        aoe: false, ...over,
    });

    // handoff example: disease-fatal-minor — 3.0 base, 50% roll every second, ~30s infection
    const diseaseAbility = () => ability({
        id: 'sun-9-2', kebabName: 'disease', plainName: 'disease',
        cooldownSeconds: 30, effectiveCooldownSeconds: 30,
        damageKeys: {'disease-fatal-minor': 3},
        damageProfiles: {
            'disease-fatal-minor': profile({
                trigger: 'DOT_TICK', procChance: 0.5, tickIntervalSeconds: 1,
                maxDurationSeconds: -1, expectedDurationSeconds: 30, aoe: true,
                notes: 'Infection ticks every second after a 10s incubation.',
            }),
        },
    });

    it('DoT: ≈1.5 sustained dps, ≈45 per application, "until cured" sentinel never used in math', () => {
        const m = profileMath(diseaseAbility(), 'disease-fatal-minor')!;
        expect(m.sustainedDps).toBeCloseTo(1.5);
        expect(m.expectedTotalPerApplication).toBeCloseTo(45);
        expect(m.durationSeconds).toBe(30); // expectedDuration, not the -1 sentinel
        expect(m.indefinite).toBe(true);

        const cd = castDamage(diseaseAbility(), 'disease-fatal-minor', 60);
        expect(cd.kind).toBe('dot');
        expect(cd.dmg).toBeCloseTo(45);
        expect(cd.maxCasts).toBe(2); // re-applying refreshes, never stacks, on the single duelist target
        // a 10s burst window only fits 10s of ticks
        expect(castDamage(diseaseAbility(), 'disease-fatal-minor', 10).dmg).toBeCloseTo(15);
    });

    it('throttled on-hit: ≈7 dps stream with a 1s period despite cooldownSeconds -1', () => {
        const a = ability({
            kebabName: 'corrosive-claw', cooldownSeconds: -1, effectiveCooldownSeconds: -1,
            damageKeys: {'corrosive-claw': 7},
            damageProfiles: {'corrosive-claw': profile({trigger: 'ON_HIT', internalCooldownSeconds: 1})},
        });
        const m = profileMath(a, 'corrosive-claw')!;
        expect(m.effectivePeriodSeconds).toBe(1);
        expect(m.sustainedDps).toBeCloseTo(7);
        const cd = castDamage(a, 'corrosive-claw', 60);
        expect(cd.kind).toBe('stream');
        expect(cd.maxCasts).toBe(1);
        expect(cd.dmg).toBeCloseTo(420);
    });

    it('unthrottled on-hit: attack-speed-bound (dps unknown), never ranked as zero', () => {
        const a = ability({
            damageKeys: {'holy-light': 4},
            damageProfiles: {'holy-light': profile({trigger: 'ON_HIT'})}, // icd 0 = none
        });
        expect(profileMath(a, 'holy-light')!.sustainedDps).toBeNull();
        const cd = castDamage(a, 'holy-light', 60);
        expect(cd.kind).toBe('attack-speed');
        expect(cd.dmg).toBe(4); // falls back to the per-cast baseline, not 0
    });

    it('ACTIVE_CAST: damage weighted by proc chance, pacing left to the cast plan', () => {
        const a = ability({damageProfiles: {'holy-light': profile({procChance: 0.5})}});
        expect(castDamage(a, 'holy-light', 60)).toEqual({dmg: 2, maxCasts: null, kind: 'per-cast'});
    });

    it('derived values track live edits to the base damage', () => {
        const a = diseaseAbility();
        a._orig = {...a.damageKeys};
        a.damageKeys['disease-fatal-minor'] = 6;
        expect(profileMath(a, 'disease-fatal-minor')!.sustainedDps).toBeCloseTo(3);
        expect(profileMath(a, 'disease-fatal-minor', true)!.sustainedDps).toBeCloseTo(1.5); // pristine ghost
    });

    it('plan uses per-application totals and caps DoT re-applications', () => {
        const raw = makePayload();
        raw.abilities.push(diseaseAbility());
        const ctx = buildCtx(enrichPayload(raw));
        // sun @ S9, 60s with regen: budget 100 + 60×1.25 = 175.
        // disease: 45/cast cost 10 ratio 4.5 → first; byCd floor(60/30)+1 = 3 but capped at 2 applications → 90 dmg
        // holy-light: 13 casts × 4 = 52 (budget 155 → 25 left); flame-wave: floor(25/20) = 1 cast × 6
        const p = plan(ctx, 'sun', 9, 60, true)!;
        const disease = p.rows.find(r => r.a.kebabName === 'disease')!;
        expect(disease.casts).toBe(2);
        expect(p.total).toBe(148);
    });

    it('a payload without any profiles plans exactly as before', () => {
        const ctx = buildCtx(enrichPayload(makePayload()));
        const p = plan(ctx, 'sun', 9, 10, false)!;
        expect(p.total).toBe(30); // same as the pre-profile regression numbers
        expect(p.spent).toBe(90);
    });
});

describe('median', () => {
    it('ignores nulls and averages even-length middles', () => {
        expect(median([1, null, 3])).toBe(2);
        expect(median([1, 2, 3, 4])).toBe(2.5);
        expect(median([null, undefined])).toBeNull();
    });
});

describe('yaml generation', () => {
    it('patches only the edited line, preserving comments and structure', () => {
        const p = enrichPayload(makePayload());
        const out = patchedDamageYaml(p, [
            {pathway: 'sun', key: 'holy-light', oldVal: 4, newVal: 5.5},
            {pathway: 'moon', key: 'ghost-key', oldVal: 1, newVal: 2}, // unknown section → skipped
        ]);
        expect(out).toContain('  holy-light: 5.5');
        expect(out).toContain('version: 1.0.0');
        expect(out).toContain('  flame-wave: 6');
        expect(out).not.toContain('moon');
        expect(out.split('\n').length).toBe(makePayload().damageConfigLines.length + 1);
    });

    it('does not patch a same-named key in another pathway section', () => {
        const p = enrichPayload(makePayload());
        const out = patchedDamageYaml(p, [{pathway: 'fool', key: 'paper-cut', oldVal: 4, newVal: 9}]);
        expect(out).toContain('  holy-light: 4');
        expect(out).toContain('  paper-cut: 9');
    });

    it('emits tuning entries only where effective ≠ hardcoded; flat beats percentage', () => {
        const p = enrichPayload(makePayload());
        expect(tuningYaml(p.abilities)).toContain('overrides: {}');

        const flame = p.abilities.find(a => a.id === 'sun-9-1')!;
        flame.effectiveCooldownSeconds = 8;
        flame.effectiveFlatCost = 30; // flat override on a %-cost ability
        const entries = tuningEntries(p.abilities);
        expect(entries.sun['flame-wave']).toEqual({cooldown: 8, cost: 30});

        const yml = tuningYaml(p.abilities);
        expect(yml).toContain('overrides:');
        expect(yml).toContain('  sun:');
        expect(yml).toContain('    flame-wave:');
        expect(yml).toContain('      cooldown: 8');
        expect(yml).toContain('      cost: 30');
        expect(yml).not.toContain('cost-percentage');
    });

    it('pre-existing server overrides survive regeneration (diff vs hardcoded)', () => {
        const raw = makePayload();
        // simulate a server-side override already applied at export time
        raw.abilities[0].effectiveCooldownSeconds = 12;
        const p = enrichPayload(raw);
        expect(tuningEntries(p.abilities).sun['holy-light']).toEqual({cooldown: 12});
    });
});
