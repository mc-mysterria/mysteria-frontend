# Handoff: Damage-Key Profiles in the Balance Export

**Audience:** the balance web app (separate Vite project that consumes
`plugins/CircleOfImagination/balance/export-latest.json`).
**Status:** plugin side is shipped; this is the parser/UI work on the web-app side.
**Breaking:** no — all changes are additive. An untouched parser keeps working.

## Background

Until now every damage key was exported as a bare base value, and the app could only
assume "dealt once per cast, on the ability's cooldown". That assumption is wrong for
a whole class of spells: on-hit passives with an internal throttle (Corrosive Claw:
7.0 per bare-hand hit, max once per second, **no cast cooldown**) and DoT loops
(Disease: `disease-fatal-minor` 3.0 is a 50% roll *every second* for a ~14–50 s
infection ≈ 1.5 sustained DPS, ~45 total per application).

The plugin now lets abilities declare these mechanics as a **damage-key profile**, and
the export carries both the raw profile and pre-derived rate numbers. Profiles are
being added incrementally — today only `corrosive-claw` and the four `disease-*` keys
have one; more land as the sweep progresses (see `docs/DAMAGE_PROFILES.md`).

## The task

1. Parse the new optional fields (reference below) without breaking on exports that
   lack them.
2. Wherever the app ranks or charts damage (fairness matrix, DPS-60, burst-10,
   damage-per-spirit), use `sustainedDps` / `expectedTotalPerApplication` for
   profiled keys instead of raw `baseDamage` ÷ cast cooldown.
3. Surface the profile in the key/ability detail view: trigger type, proc chance,
   period, duration, AoE flag, and `notes` verbatim (notes carry conditions the
   numbers can't express — stage gating, weapon requirements, etc.).
4. Visually distinguish profiled vs unprofiled keys (badge or muted styling), so
   analysts know which numbers are mechanically accurate and which still ride the
   once-per-cast assumption.
5. Decide on `schemaVersion` handling: the export still says `2`. If the app
   validates it strictly, keep accepting 2; if tolerant, tell the plugin team once
   profile rendering ships and we bump to 3 so pre-profile exports are
   distinguishable.

## New fields

### `damageEntries[].profile` — present only when the owning ability declares one

```json
{
  "pathway": "demoness",
  "key": "disease-fatal-minor",
  "baseDamage": 3.0,
  "abilityId": "…",
  "abilityName": "Disease",
  "abilitySequence": 6,
  "attribution": "CODE_REFERENCE",
  "profile": {
    "trigger": "DOT_TICK",
    "procChance": 0.5,
    "internalCooldownSeconds": 0.0,
    "tickIntervalSeconds": 1.0,
    "maxDurationSeconds": -1.0,
    "expectedDurationSeconds": 30.0,
    "aoe": true,
    "notes": "Infection ticks every second after a 10s incubation…"
  },
  "expectedDamagePerTrigger": 1.5,
  "effectivePeriodSeconds": 1.0,
  "sustainedDps": 1.5,
  "expectedTotalPerApplication": 45.0
}
```

Profile object:

| Field | Type | Meaning |
|---|---|---|
| `trigger` | string enum | `ACTIVE_CAST`, `ON_HIT`, `DOT_TICK`, `AURA_TICK`, `SUMMON_HIT`, `OTHER` |
| `procChance` | number 0–1 | chance a trigger opportunity actually deals the damage (always present; 1.0 = guaranteed) |
| `internalCooldownSeconds` | number | ability-enforced throttle between procs; `0` = none |
| `tickIntervalSeconds` | number | seconds between DoT/aura applications; `0` = not tick-based |
| `maxDurationSeconds` | number | hard cap on effect length; `0` = n/a, **`-1` = lasts until cleared/cured (sentinel — never use in math)** |
| `expectedDurationSeconds` | number | author's typical-length estimate when there's no hard cap; `0` = unset |
| `aoe` | boolean | one application can afflict multiple victims (display flag, not math) |
| `notes` | string, may be absent | conditions the numbers can't express — show verbatim |

Derived fields (siblings of `profile`, each **independently absent** when its inputs
were unknown):

| Field | Formula | Absent when |
|---|---|---|
| `expectedDamagePerTrigger` | `baseDamage × procChance` | no profile |
| `effectivePeriodSeconds` | tick interval (DOT/AURA), internal cooldown (ON_HIT/SUMMON), effective cast cooldown (ACTIVE_CAST) | the relevant input is 0 — e.g. an unthrottled on-hit is attack-speed-bound |
| `sustainedDps` | `expectedDamagePerTrigger ÷ effectivePeriodSeconds` | period unknown |
| `expectedTotalPerApplication` | `sustainedDps × (max or expected duration)` | not DOT/AURA, or no duration known |

### `abilities[].damageProfiles` — always present, usually `{}`

The same profile objects keyed by damage key, attached to the owning ability spec.
Convenience mirror of `damageEntries[].profile`; use whichever join is easier.

### `meta.damageProfiles` — string

Human-readable explanation of the semantics; suitable as tooltip/help text.

## Parsing rules

1. **Absent ≠ zero.** Serialization omits null fields. A missing `profile` means
   "unprofiled — fall back to the once-per-cast assumption". A missing `sustainedDps`
   on a *profiled* entry means "period unknown", not 0 DPS — don't rank it as
   zero-damage.
2. **All derived values are Sequence-9 baselines.** Multiply by
   `sequenceTables.damageMultiplier[sequence]` before display, exactly as the app
   already does for `baseDamage`.
3. **`maxDurationSeconds: -1`** means indefinite; use `expectedDurationSeconds` for
   any math and label the duration "until cured/cleared" in the UI.
4. `procChance`, `aoe`, and the four `…Seconds` fields are always present inside a
   profile (primitives); only `notes` and the top-level derived fields can be absent.
5. Cross-referencing telemetry: `damageByKey[].key` matches `damageEntries[].key`.
   For profiled DoT keys, expect telemetry `hits` to be much higher and `avgFinal`
   much lower than unprofiled burst keys — that's the mechanic, not bad data.

## Everything else in the payload

Unchanged: `meta` (plus the one new string), `sequenceTables`, `pathways`,
`abilities` (plus `damageProfiles`), `damageEntries` (plus the fields above),
`unownedDamageKeys`, `orphanKeys`, `damageConfigLines`, `bypassSites`, `exportMeta`
(`windowDays`, `fairnessDeviationPercent`), `telemetry` (`available`, `damageByKey`,
`castsByKey`, `damageByPathway`, `castsByPathway`, `killsByPathway`,
`deathsByPathway`, `topPvpKillKeys`).

Note: the plugin no longer ships or generates any HTML dashboard — `export-latest.json`
is the only artifact, and the payload shape produced by `BalanceSpecService` /
`BalanceExportService` is the contract. Changes on the plugin side will be reflected
in this document.

## Acceptance checklist

- [x] Export without any profiles renders identically to today (no regressions).
- [x] `disease-fatal-minor` shows ≈1.5 sustained DPS and ≈45 per application at
      Sequence 9 (not a "3.0 hit"), scaled correctly at other sequences.
- [x] `corrosive-claw` shows ≈7 DPS with trigger ON_HIT and a 1 s period, despite the
      owning ability having `cooldownSeconds: -1`.
- [x] Unprofiled keys are visually marked as "assumed once per cast" (only once the
      payload carries at least one profile, so pre-profile exports stay unchanged).
- [x] A profiled entry with no `sustainedDps` (unthrottled ON_HIT) renders as
      "attack-speed-bound", not 0.
- [x] `notes` visible in the detail view.

**Implementation note (web side):** derived values are recomputed client-side from
the raw `profile` using the documented formulas (joined via `abilities[].damageProfiles`),
so live edits to base damage / cooldown in the drilldown keep the profiled rates accurate.
The export's precomputed derived fields serve as the reference contract.
**schemaVersion:** the app validates structurally and ignores `schemaVersion` (tolerant) —
plugin team can bump to 3 whenever ready; profile rendering is shipped.
