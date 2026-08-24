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
import {p, readJson} from "./lib/repo.mjs";

const wanted = process.argv.includes("--missing")
    ? process.argv[process.argv.indexOf("--missing") + 1]
    : null;

/* ------------------------------------------------------------------ *
 * UI strings and guide prose: how much of each locale is really translated.
 * ------------------------------------------------------------------ */
/*
 * A leaf counts as translated when it DIFFERS from English at the same path,
 * rather than merely existing.
 *
 * The distinction arrived with Crowdin. A Crowdin export fills every
 * untranslated string with the English source, so a language nobody has started
 * yet downloads as a file with exactly as many strings as English and no
 * translation in it whatsoever. Counting strings reported those at 100%, which
 * is the one number this script exists to not print.
 *
 * It reads a shade low in the other direction: "Mysterria", "Discord" and the
 * guide's search tags are the same word in every language, so a finished locale
 * lands in the high nineties rather than at exactly 100. That is the right
 * direction to be wrong in.
 */
function flatten(node, prefix = "", out = {}) {
    if (typeof node === "string") {
        out[prefix] = node;
        return out;
    }
    if (Array.isArray(node)) {
        node.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
        return out;
    }
    if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
            // Generated banners are not copy and would inflate the score.
            if (key === "$comment") continue;
            flatten(value, prefix ? `${prefix}.${key}` : key, out);
        }
    }
    return out;
}

/** `{total, translated}` for one locale file against the English tree. */
function coverage(englishLeaves, file) {
    const theirs = flatten(readJson(file));
    let translated = 0;
    for (const [path, english] of Object.entries(englishLeaves)) {
        const value = theirs[path];
        if (value !== undefined && value !== english) translated++;
    }
    return {total: Object.keys(englishLeaves).length, translated};
}

/*
 * Locales are discovered from the directory, not from locales.json, because the
 * interesting case is a language Crowdin has landed but the app does not import
 * yet - which is exactly the one locales.json does not know about.
 */
function localeRows(dir, englishLeaves) {
    return fs.readdirSync(p(dir))
        .filter(name => name.endsWith(".json"))
        .map(name => {
            const file = `${dir}/${name}`;
            return {
                code: name.replace(/\.json$/, ""),
                ...coverage(englishLeaves, file),
                generated: /GENERATED - do not edit/.test(fs.readFileSync(p(file), "utf8")),
            };
        })
        .sort((a, b) => (a.code === "en" ? -1 : b.code === "en" ? 1 : a.code.localeCompare(b.code)));
}

const uiLeaves = flatten(readJson("src/locales/en.json"));
const uiRows = localeRows("src/locales", uiLeaves);

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
 * The guide is one file per locale, scored the same way as the UI strings above:
 * against English, leaf by leaf. It reads lower than the UI does because a good
 * fraction of the tree is search tags and proper nouns that stay English on
 * purpose.
 */
const guideRows = localeRows("src/data/guide", flatten(readJson("src/data/guide/en.json")));

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

/** One locale's line: how many leaves differ from English, out of how many. */
const localeLine = (row, indent) => {
    const label = row.code.padEnd(6);
    const note = row.generated ? " generated" : "";
    if (row.code === "en") return `${indent}${label} ${String(row.total).padStart(4)} strings   baseline`;
    const count = `${String(row.translated).padStart(4)}/${row.total}`;
    return `${indent}${label} ${count}   ${bar(row.translated, row.total)} ${pct(row.translated, row.total)}${note}`;
};

console.log("\nUI strings (src/locales/*.json) - leaves differing from English");
for (const row of uiRows) console.log(localeLine(row, "  "));

console.log("\nPathway data (zh-CN overlay; zh-TW is generated from it)");
console.log(`  pathway names   ${String(pathwayDone).padStart(4)}/${pathwayTotal}   ${bar(pathwayDone, pathwayTotal)} ${pct(pathwayDone, pathwayTotal)}`);
console.log(`  sequence names  ${String(sequenceDone).padStart(4)}/${sequenceTotal}   ${bar(sequenceDone, sequenceTotal)} ${pct(sequenceDone, sequenceTotal)}`);
console.log(`  ability strings ${String(abilityDone).padStart(4)}/${abilityTotal}   ${bar(abilityDone, abilityTotal)} ${pct(abilityDone, abilityTotal)}`);

console.log("\nLong-form prose (separate passes, English fallback until done)");
console.log("  guide (src/data/guide/*.json)");
for (const row of guideRows) console.log(localeLine(row, "    "));
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
