/*
 * Merges a batch of Simplified Chinese ability translations into
 * src/assets/sources/pathways.zh-CN.json.
 *
 * Batch format - compact on purpose, since these are authored in bulk:
 *
 *   {
 *     "fool": {
 *       "9": {
 *         "divination": ["占卜", "抛硬币或摆动钟摆以求得指引。"],
 *         ...
 *       }
 *     }
 *   }
 *
 * Each value is [name, description]. Either may be an empty string to leave
 * that field untranslated (English shows instead).
 *
 * The script refuses to write if a batch names a pathway, Sequence or ability
 * id that does not exist in pathway-abilities.json - a typo in an id would
 * otherwise silently produce a translation nothing ever reads.
 *
 * Run: node scripts/apply-abilities-zh.mjs <batch.json> [...]
 */
import fs from "node:fs";
import {readJson, writeJson} from "./lib/repo.mjs";

/*
 * Batch paths come from the command line, so they are cwd-relative and read
 * directly. Everything else is repo-relative and goes through readJson - the
 * two used to share the name `readJson` with different contracts.
 */
const readBatch = file => JSON.parse(fs.readFileSync(file, "utf8"));

const batchPaths = process.argv.slice(2);
if (!batchPaths.length) {
    console.error("usage: node scripts/apply-abilities-zh.mjs <batch.json> [...]");
    process.exit(1);
}

const OVERLAY = "src/assets/sources/pathways.zh-CN.json";
const overlay = readJson(OVERLAY);
const source = readJson("src/assets/sources/pathway-abilities.json");

/** Valid pathway -> sequence -> Set(abilityId), for id validation. */
const known = new Map();
for (const pathway of source.pathways) {
    const sequences = new Map();
    for (const sequence of pathway.sequences) {
        sequences.set(String(sequence.sequence), new Set(sequence.abilities.map(a => a.id)));
    }
    known.set(pathway.id, sequences);
}

const errors = [];
let applied = 0;
let skipped = 0;

overlay.abilities ??= {};

for (const batchPath of batchPaths) {
    const batch = readBatch(batchPath);

    for (const [pathwayId, sequences] of Object.entries(batch)) {
        if (pathwayId.startsWith("$")) continue;

        const knownSequences = known.get(pathwayId);
        if (!knownSequences) {
            errors.push(`${batchPath}: unknown pathway "${pathwayId}"`);
            continue;
        }

        for (const [sequenceKey, abilities] of Object.entries(sequences)) {
            const knownAbilities = knownSequences.get(sequenceKey);
            if (!knownAbilities) {
                errors.push(`${batchPath}: ${pathwayId} has no Sequence ${sequenceKey}`);
                continue;
            }

            for (const [abilityId, value] of Object.entries(abilities)) {
                if (!knownAbilities.has(abilityId)) {
                    errors.push(`${batchPath}: ${pathwayId}:${sequenceKey} has no ability "${abilityId}"`);
                    continue;
                }
                if (!Array.isArray(value) || value.length !== 2) {
                    errors.push(`${batchPath}: ${pathwayId}:${sequenceKey}:${abilityId} must be [name, description]`);
                    continue;
                }

                const [name, description] = value;
                overlay.abilities[pathwayId] ??= {};
                overlay.abilities[pathwayId][sequenceKey] ??= {};

                const entry = overlay.abilities[pathwayId][sequenceKey][abilityId] ?? {};
                if (name) entry.name = name;
                if (description) entry.description = description;

                if (Object.keys(entry).length) {
                    overlay.abilities[pathwayId][sequenceKey][abilityId] = entry;
                    applied++;
                } else {
                    skipped++;
                }
            }
        }
    }
}

if (errors.length) {
    console.error(`refusing to write - ${errors.length} problem(s):`);
    for (const error of errors.slice(0, 25)) console.error(`  ${error}`);
    if (errors.length > 25) console.error(`  ... and ${errors.length - 25} more`);
    process.exit(1);
}

writeJson(OVERLAY, overlay);
console.log(`applied ${applied} ability translation(s)${skipped ? `, skipped ${skipped} empty` : ""}`);
