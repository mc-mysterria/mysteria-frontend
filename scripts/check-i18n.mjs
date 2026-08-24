/*
 * Structural checks on the files Crowdin writes.
 *
 * Type-checking already guarantees the *shape* of a locale that the app imports
 * (`Translations`, `GuideContent`). What it cannot see is the two things a
 * translator can break without breaking the shape:
 *
 *   - a placeholder. `{name}`, `{count}` and friends are substituted by the call
 *     site, not by t(), so a dropped or renamed slot renders the literal brace
 *     text to a reader and there is no type error anywhere.
 *   - a field that only looks like copy. `id` and `severity` in the rules files
 *     are identifiers the app switches on; translated, they silently stop
 *     matching.
 *
 * It also covers the locales the app does not import yet. A language added in
 * Crowdin lands its file here well before it is wired into locales.json, and
 * until then nothing else in the repo looks at it at all.
 *
 * Run: node scripts/check-i18n.mjs      (also `npm run check:i18n`)
 */
import fs from "node:fs";
import {p, readJson} from "./lib/repo.mjs";

/*
 * Every Crowdin-managed surface, mirroring the `files` list in crowdin.yml.
 *
 * `match` is how a locale's file is recognised among its siblings, rather than a
 * list of expected codes: the point is to catch a file the moment Crowdin lands
 * it, including for a language nothing else in the repo knows about.
 *
 * `frozen` names fields that are identifiers rather than copy, compared against
 * English position by position.
 */
const SURFACES = [
    {
        label: "UI strings",
        dir: "src/locales",
        match: /^(.+)\.json$/,
    },
    {
        label: "guide",
        dir: "src/data/guide",
        match: /^(.+)\.json$/,
    },
    {
        label: "rules",
        dir: "src/assets/sources",
        match: /^rules_(.+)\.json$/,
        frozen: ["id", "severity"],
    },
    {
        label: "staff rules",
        dir: "src/assets/sources",
        match: /^staff_rules_(.+)\.json$/,
        frozen: ["id"],
    },
    {
        label: "link previews",
        dir: "src/assets/sources",
        match: /^meta-copy\.(.+)\.json$/,
    },
];

/** `{name}`, `{count}` - the slots the call sites fill in. */
const PLACEHOLDER = /\{(\w+)}/g;

const placeholdersIn = text => [...text.matchAll(PLACEHOLDER)].map(m => m[0]).sort();

/*
 * Flattens a tree to `path -> leaf`. Array indices become path segments, so a
 * reordered array reads as a set of changed leaves rather than as a rename - and
 * `$comment` banners, which are generated rather than translated, are skipped.
 */
function flatten(node, prefix = "", out = {}) {
    if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
        out[prefix] = node;
        return out;
    }
    if (Array.isArray(node)) {
        node.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
        return out;
    }
    if (node && typeof node === "object") {
        for (const [key, value] of Object.entries(node)) {
            if (key === "$comment") continue;
            flatten(value, prefix ? `${prefix}.${key}` : key, out);
        }
    }
    return out;
}

const problems = [];
const notes = [];
let compared = 0;

for (const surface of SURFACES) {
    const files = fs.readdirSync(p(surface.dir));

    const codeOf = name => {
        const hit = surface.match.exec(name);
        return hit ? hit[1] : null;
    };

    const englishName = files.find(name => codeOf(name) === "en");
    if (!englishName) {
        problems.push(`${surface.label}: no English source in ${surface.dir}`);
        continue;
    }

    const english = flatten(readJson(`${surface.dir}/${englishName}`));

    for (const name of files) {
        const code = codeOf(name);
        if (!code || code === "en") continue;

        const target = flatten(readJson(`${surface.dir}/${name}`));
        const where = `${surface.label} [${code}]`;
        compared++;

        for (const [path, value] of Object.entries(target)) {
            const source = english[path];

            if (source === undefined) {
                // A key English does not have can never render: nothing reads it.
                notes.push(`${where}: extra key not in English - ${path}`);
                continue;
            }

            const frozen = surface.frozen?.some(field => path === field || path.endsWith(`.${field}`));
            if (frozen) {
                if (value !== source) {
                    problems.push(`${where}: ${path} is an identifier, not copy - expected ${JSON.stringify(source)}, found ${JSON.stringify(value)}`);
                }
                continue;
            }

            if (typeof value !== "string" || typeof source !== "string") continue;

            const want = placeholdersIn(source);
            const got = placeholdersIn(value);
            if (want.join(",") !== got.join(",")) {
                problems.push(`${where}: ${path} placeholders changed - expected ${want.length ? want.join(" ") : "none"}, found ${got.length ? got.join(" ") : "none"}`);
            }
        }

        // A missing key is legitimate: every lookup falls back to English.
        const missing = Object.keys(english).filter(path => target[path] === undefined).length;
        if (missing) notes.push(`${where}: ${missing} key(s) untranslated, showing English`);
    }
}

for (const note of notes) console.log(`note  ${note}`);

if (problems.length) {
    console.error(`\n${problems.length} problem(s) in translated files:\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error("\nFix these in Crowdin, not in the repo - a repo-side edit is overwritten by the next sync.");
    process.exit(1);
}

console.log(`\nok - ${compared} translated file(s) checked, placeholders and identifiers intact.`);
