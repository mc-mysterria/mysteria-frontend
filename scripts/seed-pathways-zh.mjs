/*
 * Seeds / refreshes src/assets/sources/pathways.zh-CN.json - the Simplified
 * Chinese overlay for pathway names, Sequence names and ability text.
 *
 * Why an overlay instead of adding `zh-CN` fields to pathway-abilities.json:
 * that file is regenerated from the Circle of Imagination plugin, so anything
 * written into it is lost on the next export. The overlay is keyed by
 * pathway/sequence/ability id and merged at import time.
 *
 * What this script fills in automatically:
 *   - pathway names, from the canonical Sequence 9 name. Chinese names a pathway
 *     after its Sequence 9 where English names it after its Sequence 0: English
 *     "Fool pathway" is 占卜家途径 (Seer pathway), and 愚者 is the god at the top
 *     of that route rather than the route itself.
 *   - deity names, from the canonical Sequence 0 name. The Ascension registry
 *     needs these for the Sequence 0 throne, which no longer coincides with the
 *     pathway label in Chinese.
 *   - boon pathways currently keep a direct translation of Mysterria's own
 *     English label (from the glossary). These are Outer God (外神) routes from
 *     the novel, NOT inventions, so their names are canon that has not been
 *     looked up yet - see i18n/checklist.boon-pathways.md.
 *   - Sequence names for the 22 canonical pathways, from
 *     i18n/canon.sequences-zh.json, but ONLY where Mysterria's English name
 *     actually matches the canonical rung (checked via the English gloss).
 *     A rung Mysterria renamed is left blank rather than given the canon name,
 *     because that would be putting words in the novel's mouth.
 *
 * What it deliberately leaves for a human:
 *   - Sequence names Mysterria renamed, and every boon-pathway rung
 *   - all ability names and descriptions
 * Blank values are dropped on write, so an untranslated entry simply falls back
 * to English at runtime rather than shipping an empty string.
 *
 * Existing translations are never overwritten. Run it again after the plugin
 * adds abilities and it will only add the new empty slots.
 *
 * Run: node scripts/seed-pathways-zh.mjs
 */
import {exists, norm, readJson, writeJson} from "./lib/repo.mjs";

const OUT = "src/assets/sources/pathways.zh-CN.json";

const source = readJson("src/assets/sources/pathway-abilities.json");
const canon = readJson("i18n/canon.sequences-zh.json");
const gloss = readJson("i18n/canon.sequences-en-gloss.json");
const glossary = readJson("i18n/glossary.lotm-zh.json");

const existing = exists(OUT) ? readJson(OUT) : {};

/*
 * One-shot escape hatch. The first cut of this file labelled pathways by their
 * Sequence 0 (愚者) before a native reader pointed out that Chinese names a
 * pathway after its Sequence 9 (占卜家途径). Pass --reseed-labels to recompute
 * pathway labels from canon instead of preserving what is already on disk.
 */
const RESEED_LABELS = process.argv.includes("--reseed-labels");


const out = {
    $comment: [
        "Simplified Chinese overlay for pathway data. AUTHORED - the Traditional",
        "counterpart (pathways.zh-TW.json) is generated from this file by",
        "scripts/build-zh-tw.mjs, so corrections belong here.",
        "",
        "Keys are ids from pathway-abilities.json. `sequences` is keyed by pathway",
        "id then Sequence number; `abilities` by pathway id, Sequence number and",
        "ability id, because the same ability id carries different text on",
        "different pathways.",
        "",
        "Sequence names for the 22 canonical pathways come from the novel and must",
        "not be paraphrased - see i18n/canon.sequences-zh.json. Anything missing",
        "here falls back to English at runtime.",
        "",
        "Regenerate empty slots with: node scripts/seed-pathways-zh.mjs",
    ],
    // Divine rank titles for Sequences 4-0. Mysterria ranks, not canon: the
    // novel has no single fixed word at every one of these rungs.
    sequenceRanks: existing.sequenceRanks ?? {
        4: "半神",
        3: "圣者",
        2: "天使",
        1: "大天使",
        0: "神灵",
    },
    pathwayNames: {},
    deityNames: {},
    sequences: {},
    abilities: {},
};

const stats = {pathwayNames: 0, deityNames: 0, canonSeq: 0, renamedSeq: 0, boonSeq: 0, abilities: 0, kept: 0};

for (const pathway of source.pathways) {
    const id = pathway.id;
    const canonSeqAll = canon.pathways[id]?.seq;

    /*
     * Pathway label: the canonical Sequence 9 name for the 22 core routes, since
     * that is what Chinese calls a pathway. Boons have no canon, so they fall
     * back to the glossary's translation of Mysterria's own English label.
     */
    const kept = RESEED_LABELS ? undefined : existing.pathwayNames?.[id];
    const fromCanon = canonSeqAll?.["9"];
    const fromGlossary = glossary.pathways?.[id]?.["zh-CN"];
    const name = kept || fromCanon || fromGlossary || "";
    if (name) {
        out.pathwayNames[id] = name;
        if (kept) stats.kept++;
        else stats.pathwayNames++;
    }

    /* Deity title: the canonical Sequence 0 name. Only the 22 core routes have one. */
    const keptDeity = existing.deityNames?.[id];
    const deity = keptDeity || canonSeqAll?.["0"] || "";
    if (deity) {
        out.deityNames[id] = deity;
        if (keptDeity) stats.kept++;
        else stats.deityNames++;
    }

    /* ---- sequence names ---- */
    out.sequences[id] = {};

    for (const sequence of [...pathway.sequences].sort((a, b) => b.sequence - a.sequence)) {
        const n = String(sequence.sequence);
        const previous = existing.sequences?.[id]?.[n];

        if (previous) {
            out.sequences[id][n] = previous;
            stats.kept++;
            continue;
        }

        const canonName = canonSeqAll?.[n];
        const canonEn = gloss[id]?.[n];
        const matchesCanon = canonName && canonEn && norm(canonEn) === norm(sequence.name.en);

        if (matchesCanon) {
            out.sequences[id][n] = canonName;
            stats.canonSeq++;
        } else {
            // Left blank on purpose - a human decides, and English shows until then.
            out.sequences[id][n] = "";
            if (canonSeqAll) stats.renamedSeq++;
            else stats.boonSeq++;
        }
    }

    /* ---- abilities ---- */
    out.abilities[id] = {};
    for (const sequence of [...pathway.sequences].sort((a, b) => b.sequence - a.sequence)) {
        const n = String(sequence.sequence);
        if (!sequence.abilities.length) continue;
        out.abilities[id][n] = {};

        for (const ability of sequence.abilities) {
            const previous = existing.abilities?.[id]?.[n]?.[ability.id];
            if (previous?.name || previous?.description) {
                out.abilities[id][n][ability.id] = previous;
                stats.kept++;
                continue;
            }
            out.abilities[id][n][ability.id] = {name: "", description: ""};
            stats.abilities++;
        }
    }
}

/** Strips empty strings and now-empty containers, so absent means "use English". */
function prune(value) {
    if (typeof value === "string") return value === "" ? undefined : value;
    if (Array.isArray(value)) return value;
    const result = {};
    for (const [key, inner] of Object.entries(value)) {
        const cleaned = prune(inner);
        if (cleaned === undefined) continue;
        if (typeof cleaned === "object" && !Array.isArray(cleaned) && !Object.keys(cleaned).length) continue;
        result[key] = cleaned;
    }
    return result;
}

const pruned = prune(out);

writeJson(OUT, pruned);

console.log(`wrote ${OUT}`);
console.log(`  pathway names (Seq 9 canon)  : ${stats.pathwayNames}`);
console.log(`  deity names (Seq 0 canon)    : ${stats.deityNames}`);
console.log(`  sequence names from canon   : ${stats.canonSeq}`);
console.log(`  kept existing translations  : ${stats.kept}`);
console.log(`  left blank (renamed rungs)  : ${stats.renamedSeq}`);
console.log(`  left blank (boon rungs)     : ${stats.boonSeq}`);
console.log(`  left blank (abilities)      : ${stats.abilities}`);
