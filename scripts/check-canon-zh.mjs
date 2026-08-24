/*
 * Aligns Mysterria's own Sequence ladder against the novel's canonical one and
 * prints a side-by-side report.
 *
 * Why this exists: the 22 core pathways take their rung names straight from
 * 《诡秘之主》, so the Chinese rendering of a rung is not a translation choice -
 * it is a lookup. But Mysterria has renamed some rungs, and the ten "boon"
 * pathways are Outer God (外神) routes whose canon ladders are not recorded in
 * i18n/canon.sequences-zh.json yet, so they cannot be looked up here.
 *
 * The report marks each rung:
 *   canon    - Mysterria's English matches the canonical rung; use canon Chinese
 *   RENAMED  - Mysterria ships a different name at this rung; needs a decision
 *   outer-god - a boon pathway. Its canon ladder is recorded in
 *               i18n/glossary.lotm-zh.json (canonLadder) rather than in
 *               canon.sequences-zh.json, because two of the ten are shuffled
 *               against canon and this file is keyed by sequence number.
 *
 * Run: node scripts/check-canon-zh.mjs [--renamed-only]
 */
import {norm, readJson as read} from "./lib/repo.mjs";

const abilities = read("src/assets/sources/pathway-abilities.json");
const canon = read("i18n/canon.sequences-zh.json");

/*
 * English glosses of the canonical rungs. These exist only so the script can
 * tell "same rung, same name" from "same rung, renamed" - they are never
 * shipped. Keyed pathway -> sequence.
 */
const GLOSS = read("i18n/canon.sequences-en-gloss.json");

const renamedOnly = process.argv.includes("--renamed-only");

let counts = {canon: 0, renamed: 0, outerGod: 0};
const renamed = [];

for (const pathway of abilities.pathways) {
    const c = canon.pathways[pathway.id];
    const rows = [];

    for (const seq of [...pathway.sequences].sort((a, b) => b.sequence - a.sequence)) {
        const n = String(seq.sequence);
        if (!c) {
            counts.outerGod++;
            rows.push([n, seq.name.en, "-", "outer-god (see i18n/checklist.boon-pathways.md)"]);
            continue;
        }
        const canonZh = c.seq[n] ?? "-";
        const gloss = GLOSS[pathway.id]?.[n];
        const matches = gloss && norm(gloss) === norm(seq.name.en);
        if (matches) {
            counts.canon++;
            rows.push([n, seq.name.en, canonZh, "canon"]);
        } else {
            counts.renamed++;
            rows.push([n, seq.name.en, canonZh, `RENAMED (canon: ${gloss ?? "?"})`]);
            renamed.push({pathway: pathway.id, seq: n, mysterria: seq.name.en, canonEn: gloss, canonZh});
        }
    }

    const shown = renamedOnly ? rows.filter(r => r[3].startsWith("RENAMED")) : rows;
    if (!shown.length) continue;

    console.log(`\n## ${pathway.id}${c ? `  (${c.canonName})` : "  [Outer God route - canon lives in the glossary, not here]"}`);
    for (const [n, mine, zh, verdict] of shown) {
        console.log(`  ${n}  ${mine.padEnd(28)} ${String(zh).padEnd(8)} ${verdict}`);
    }
}

console.log(`\n---\ncanon: ${counts.canon}   renamed: ${counts.renamed}   outer-god: ${counts.outerGod}`);
if (renamed.length) {
    console.log(`\n${renamed.length} rung(s) where Mysterria's English does not match the novel.`);
    console.log("Each needs a call: rename the rung to canon, or translate Mysterria's own name.");
}
