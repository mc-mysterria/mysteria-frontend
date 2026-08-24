/*
 * Emits i18n/crowdin-glossary.csv for import into the Crowdin project Glossary.
 *
 * Generated rather than hand-maintained: glossary.lotm-zh.json is the authority
 * (see i18n/README.md), and a second hand-kept copy of 74 canon terms would
 * drift within a month. Re-run after editing the JSON and re-import.
 *
 * Why it matters more here than on a normal project: for Chinese these are not
 * translation choices at all. The readers are the source fandom of 《诡秘之主》
 * and already know what every term is called, so a paraphrase reads as a bad fan
 * translation however accurate it is. Putting the terms in the Glossary makes
 * them surface inline in the editor, which is the only version of this rule that
 * survives contact with a volunteer translator who has not read the README.
 *
 * The English term and its description are useful to every language, not just
 * Chinese: they say what a Pathway or a Sequence actually *is*, which is what a
 * Spanish or German translator needs before choosing a word.
 *
 * Run: node scripts/build-crowdin-glossary.mjs   (also `npm run build:glossary`)
 */
import fs from "node:fs";
import {p, readJson} from "./lib/repo.mjs";

const glossary = readJson("i18n/glossary.lotm-zh.json");

const OUT = "i18n/crowdin-glossary.csv";

/** RFC 4180: quote always, double any embedded quote. Notes contain commas. */
const cell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

const rows = [["term_en", "description_en", "term_zh-CN", "term_zh-TW"]];

const entriesOf = section =>
    Object.entries(glossary[section] ?? {}).filter(([key]) => key !== "$comment");

/* ---- core terminology ---- */
for (const [, term] of entriesOf("core")) {
    const description = [
        term.canon
            ? "CANON - appears in the novel. Not open to translator preference."
            : "Mysterria's own term, translated in the novel's register.",
        term.note,
    ].filter(Boolean).join(" ");

    rows.push([term.en, description, term["zh-CN"], term["zh-TW"]]);
}

/* ---- pathway names ---- */
/*
 * Two entries per pathway, not one. English reuses a single word for the route
 * and for the god at its summit; Chinese does not, and conflating them is the
 * single easiest thing to get wrong here - so the label and the deity are
 * separate glossary terms with separate warnings rather than one term with a
 * note nobody reads to the end of.
 */
for (const [id, term] of entriesOf("pathways")) {
    const label = [
        `Pathway label (id: ${id}).`,
        term.canonPathway
            ? `Chinese names this route after its Sequence 9: ${term.canonPathway}. Not the Sequence 0 deity.`
            : "",
        term.canon ? "CANON - do not paraphrase." : "",
        term.note,
    ].filter(Boolean).join(" ");

    rows.push([term.en, label, term["zh-CN"], term["zh-TW"]]);

    const deityCN = term["deity-zh-CN"];
    if (!deityCN) continue;

    rows.push([
        `${term.en} (deity)`,
        `The Sequence 0 god at the summit of the ${term.en} pathway - the throne, never the route's label. Used by the Ascension registry only.`,
        deityCN,
        term["deity-zh-TW"] ?? deityCN,
    ]);
}

const csv = rows.map(row => row.map(cell).join(",")).join("\r\n");
fs.writeFileSync(p(OUT), `${csv}\r\n`, "utf8");

const terms = rows.length - 1;
console.log(`wrote ${OUT} - ${terms} terms`);
console.log("Import at: Crowdin project -> Resources -> Glossaries -> Upload,");
console.log("then map the columns to Term / Description / Chinese Simplified / Chinese Traditional.");
