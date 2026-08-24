/*
 * Reports how much of each locale is actually translated.
 *
 * Nothing here fails a build - a partial locale is a valid state, because every
 * lookup falls back to English (see useI18n.ts `resolve` and pathways.ts
 * `pick`). The point is to make "how far along is Chinese" a number rather than
 * a guess, and to name the specific files a reviewer should pick up next.
 *
 * Run: node scripts/i18n-coverage.mjs
 *      node scripts/i18n-coverage.mjs --missing pathways.abilities   (list gaps)
 */
import fs from "node:fs";
import path from "node:path";
import {p, readJson} from "./lib/repo.mjs";

const wanted = process.argv.includes("--missing")
    ? process.argv[process.argv.indexOf("--missing") + 1]
    : null;

/* ------------------------------------------------------------------ *
 * UI strings: count leaf string literals per locale file.
 * ------------------------------------------------------------------ */
/*
 * Counts leaf strings in a locale or guide tree. These files used to be `.ts`
 * modules counted with a regex over their text; they are JSON now, so the tree
 * is walked for real - which also stops `$comment` banners in the generated
 * Traditional files from inflating their score.
 */
function countStrings(file) {
    const walk = node => {
        if (typeof node === "string") return 1;
        if (Array.isArray(node)) return node.reduce((sum, item) => sum + walk(item), 0);
        if (node && typeof node === "object") {
            return Object.entries(node)
                .filter(([key]) => key !== "$comment")
                .reduce((sum, [, value]) => sum + walk(value), 0);
        }
        return 0;
    };
    return walk(readJson(file));
}

const uiRows = readJson("src/assets/sources/locales.json").locales
    .map(({code}) => ({code, file: `src/locales/${code}.json`}))
    .map(row => ({...row, count: countStrings(row.file)}));

const uiBaseline = uiRows.find(row => row.code === "en").count;

/* ------------------------------------------------------------------ *
 * Pathway data: names, Sequence names, ability names + descriptions.
 * ------------------------------------------------------------------ */
const source = readJson("src/assets/sources/pathway-abilities.json");
const overlay = readJson("src/assets/sources/pathways.zh-CN.json");

let pathwayTotal = 0, pathwayDone = 0;
let sequenceTotal = 0, sequenceDone = 0;
let abilityTotal = 0, abilityDone = 0;
const missing = {pathwayNames: [], sequences: [], abilities: []};

for (const pathway of source.pathways) {
    pathwayTotal++;
    if (overlay.pathwayNames?.[pathway.id]) pathwayDone++;
    else missing.pathwayNames.push(pathway.id);

    for (const sequence of pathway.sequences) {
        const key = String(sequence.sequence);
        sequenceTotal++;
        if (overlay.sequences?.[pathway.id]?.[key]) sequenceDone++;
        else missing.sequences.push(`${pathway.id}:${key} (${sequence.name.en})`);

        for (const ability of sequence.abilities) {
            // name and description are counted as one unit of work each
            const entry = overlay.abilities?.[pathway.id]?.[key]?.[ability.id];
            abilityTotal += 2;
            if (entry?.name) abilityDone++;
            else missing.abilities.push(`${pathway.id}:${key}:${ability.id} name`);
            if (entry?.description) abilityDone++;
            else missing.abilities.push(`${pathway.id}:${key}:${ability.id} description`);
        }
    }
}

/* ------------------------------------------------------------------ *
 * Long-form prose that has its own translation pass.
 * ------------------------------------------------------------------ */
/*
 * The guide is one file per locale. There is no key-by-key diff to do because
 * GuideContent is a closed type - a locale that compiles has every field - so
 * what is worth reporting is whether a locale exists at all, and whether its
 * prose looks complete rather than half-copied from English.
 */
const guideDir = p("src/data/guide");
const guideRows = fs.readdirSync(guideDir)
    .filter(name => name.endsWith(".json"))
    .map(name => ({
        code: name.replace(/\.json$/, ""),
        strings: countStrings(`src/data/guide/${name}`),
        generated: /GENERATED - do not edit/.test(fs.readFileSync(path.join(guideDir, name), "utf8")),
    }))
    .sort((a, b) => (a.code === "en" ? -1 : b.code === "en" ? 1 : a.code.localeCompare(b.code)));
const guideBaseline = guideRows.find(row => row.code === "en")?.strings ?? 0;

const ruleFiles = fs.readdirSync(p("src/assets/sources"))
    .filter(name => /^(staff_)?rules_/.test(name))
    .sort();

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */
const pct = (done, total) => (total ? `${Math.round((done / total) * 100)}%` : "n/a");
const bar = (done, total) => {
    const width = 24;
    const filled = total ? Math.round((done / total) * width) : 0;
    return `[${"#".repeat(filled)}${".".repeat(width - filled)}]`;
};

console.log("\nUI strings (src/locales/*.json)");
for (const row of uiRows) {
    const label = row.code.padEnd(6);
    const ratio = row.code === "en" ? "baseline" : `${bar(row.count, uiBaseline)} ${pct(row.count, uiBaseline)}`;
    console.log(`  ${label} ${String(row.count).padStart(4)} strings   ${ratio}`);
}

console.log("\nPathway data (zh-CN overlay; zh-TW is generated from it)");
console.log(`  pathway names   ${String(pathwayDone).padStart(4)}/${pathwayTotal}   ${bar(pathwayDone, pathwayTotal)} ${pct(pathwayDone, pathwayTotal)}`);
console.log(`  sequence names  ${String(sequenceDone).padStart(4)}/${sequenceTotal}   ${bar(sequenceDone, sequenceTotal)} ${pct(sequenceDone, sequenceTotal)}`);
console.log(`  ability strings ${String(abilityDone).padStart(4)}/${abilityTotal}   ${bar(abilityDone, abilityTotal)} ${pct(abilityDone, abilityTotal)}`);

console.log("\nLong-form prose (separate passes, English fallback until done)");
console.log("  guide (src/data/guide/*.json)");
for (const row of guideRows) {
    const label = row.code.padEnd(6);
    const note = row.generated ? " generated" : "";
    const ratio = row.code === "en"
        ? "baseline"
        : `${bar(row.strings, guideBaseline)} ${pct(row.strings, guideBaseline)}`;
    console.log(`    ${label} ${String(row.strings).padStart(4)} strings   ${ratio}${note}`);
}
console.log(`  rules            files present:   ${ruleFiles.join(", ")}`);

const gaps = missing.abilities.length + missing.sequences.length + missing.pathwayNames.length;
if (gaps) {
    console.log(`\n${gaps} untranslated pathway string(s). Anything missing shows English.`);
    console.log("Inspect with: node scripts/i18n-coverage.mjs --missing pathways.abilities");
}

if (wanted) {
    const key = wanted.replace(/^pathways\./, "");
    const list = missing[key];
    if (!list) {
        console.error(`\nunknown group "${wanted}" - expected one of ${Object.keys(missing).join(", ")}`);
        process.exit(1);
    }
    console.log(`\n--- missing ${key} (${list.length}) ---`);
    for (const item of list) console.log(`  ${item}`);
}

console.log("");
