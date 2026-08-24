/*
 * Generates the Traditional Chinese locale from the Simplified one.
 *
 * zh-CN is authored by hand; zh-TW is derived. That is deliberate: keeping two
 * hand-maintained Chinese trees in sync is a losing game, and the difference
 * between them is mechanical enough that OpenCC's `s2twp` profile - which does
 * Taiwan *vocabulary* substitution, not just character mapping - gets it right
 * for almost everything.
 *
 * Conversion runs over the whole file text rather than per-string. Every key,
 * placeholder and bit of syntax in these files is ASCII, so OpenCC leaves the
 * structure untouched and only rewrites Chinese characters. That is what makes
 * this safe on a .ts file.
 *
 * Two escape hatches, in order:
 *   1. i18n/glossary.lotm-zh.json -> openccOverrides, for phrases where s2twp is
 *      outright wrong (e.g. a title whose published form keeps a character
 *      s2twp would swap).
 *   2. i18n/zh-TW.overrides.json, for the native TW/HK reviewer pass - Taiwan
 *      vocabulary and register that s2twp does not know about.
 *
 * Overrides are applied longest-phrase-first, and never as single characters:
 * a bare 秘->祕 rule would corrupt 詭秘之主.
 *
 * Run: npm run build:zh-tw   (also runs as part of `npm run build`)
 *      npm run build:zh-tw -- --check   (CI: fail if the committed file is stale)
 */
import fs from "node:fs";
import * as OpenCC from "opencc-js";
import {p, readJson} from "./lib/repo.mjs";

const checkOnly = process.argv.includes("--check");

/* `cn` -> `twp`: Simplified to Traditional with Taiwan phrase substitution. */
const convert = OpenCC.Converter({from: "cn", to: "twp"});

const glossary = readJson("i18n/glossary.lotm-zh.json");
const reviewerOverrides = fs.existsSync(p("i18n/zh-TW.overrides.json"))
    ? readJson("i18n/zh-TW.overrides.json")
    : {};

/** Merged override map, with the `$comment` documentation keys stripped out. */
const overrides = Object.fromEntries(
    Object.entries({
        ...(glossary.openccOverrides ?? {}),
        ...(reviewerOverrides.overrides ?? {}),
    }).filter(([from, to]) => !from.startsWith("$") && typeof to === "string"),
);

/* Longest first, so a longer phrase wins over a substring of itself. */
const overridePairs = Object.entries(overrides).sort((a, b) => b[0].length - a[0].length);

for (const [from] of overridePairs) {
    if ([...from].length < 2) {
        console.error(`refusing single-character override "${from}" - it would corrupt unrelated phrases`);
        process.exit(1);
    }
}

/*
 * Regex overrides, for a rule that grows with the volume of copy rather than
 * with vocabulary - a literal list would need one entry per sentence. Applied
 * after the literal pass, so a specific phrase can still opt out by being
 * listed above.
 */
const patternPairs = Object.entries(reviewerOverrides.patterns ?? {})
    .filter(([source]) => !source.startsWith("$"))
    .map(([source, to]) => [new RegExp(source, "gu"), to]);

function toTraditional(text) {
    let out = convert(text);
    for (const [from, to] of overridePairs) out = out.split(from).join(to);
    for (const [re, to] of patternPairs) out = out.replace(re, to);
    return out;
}

/**
 * Simplified-only characters that must never survive conversion. Every one of
 * these has a distinct Traditional form, so finding one means s2twp missed it.
 * Traditional forms are deliberately absent from this set.
 */
const SIMPLIFIED_LEFTOVER = /[这个国说话让为门开关东车马达发无爱见错误历练]/u;

/**
 * Standard banner for a generated file. The source path is the only thing that
 * differs between targets, so there is one wording, not six. The full path, not
 * the basename: two targets are both named zh-CN.json.
 */
const banner = from => [
    "Traditional Chinese. GENERATED - do not edit.",
    `Produced from ${from} by scripts/build-zh-tw.mjs (OpenCC s2twp plus the`,
    "override lists in i18n/). Any edit here is overwritten on the next build.",
    "",
    "To change a string: if it is wrong in both Chinese locales, fix the",
    `Simplified source (${from}); if only the Traditional form is wrong, add it`,
    "to i18n/zh-TW.overrides.json.",
];

/**
 * A JSON document. Re-parsed and re-serialised so a conversion that breaks the
 * syntax fails here rather than at runtime.
 *
 * Whether a banner can be stamped is a property of the document rather than of
 * the target: an object root takes a `$comment` key, an array root has nowhere
 * to put one - an extra element would read as a real rule - so the factory asks
 * instead of each target deciding for itself.
 */
const jsonTarget = (from, to) => ({
    from,
    to,
    transform(text) {
        const converted = JSON.parse(toTraditional(text));
        if (!Array.isArray(converted)) converted.$comment = banner(from);
        return `${JSON.stringify(converted, null, 2)}\n`;
    },
});

/*
 * Every Chinese surface. Adding one is a line here rather than a new transform:
 * every translatable file in the repo is now JSON, so one factory covers them
 * all. The UI strings and the guide copy used to be `.ts` modules with a second
 * transform of their own; they became JSON so Crowdin could write them, and the
 * transform went with them.
 */
const targets = [
    jsonTarget("src/locales/zh-CN.json", "src/locales/zh-TW.json"),
    jsonTarget("src/data/guide/zh-CN.json", "src/data/guide/zh-TW.json"),
    jsonTarget("src/assets/sources/meta-copy.zh-CN.json", "src/assets/sources/meta-copy.zh-TW.json"),
    jsonTarget("src/assets/sources/pathways.zh-CN.json", "src/assets/sources/pathways.zh-TW.json"),
    jsonTarget("src/assets/sources/rules_zh-CN.json", "src/assets/sources/rules_zh-TW.json"),
    jsonTarget("src/assets/sources/staff_rules_zh-CN.json", "src/assets/sources/staff_rules_zh-TW.json"),
];


/*
 * Output that must never ship, checked after the overrides have run.
 *
 * Only patterns that can still *fire* are listed. A phrase with a global
 * override - 裡克, 精準採集, 自定義, 許可權, 語音訊道, 頻道里, 私信 and every
 * instrumental 通過 - is unreachable here by construction, so listing it would
 * be a tripwire that reads as protection while being provably dead. What is left
 * is what an override cannot cover: bare characters, and words whose override is
 * deliberately narrow.
 */
const OUTPUT_CHECKS = [
    {re: SIMPLIFIED_LEFTOVER, fix: "Simplified character survived conversion - s2twp missed this string"},
    {re: /賬/u, fix: "賬 -> 帳 (TW writes 帳號/帳戶/入帳; only known words are overridden)"},
    {re: /質量/u, fix: "質量 -> 品質 (質量 is 'mass' in TW; only 程式碼質量 is overridden)"},
];

/** 1-based line number of an index, so the error names a line a reader can open. */
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

let stale = 0;

for (const target of targets) {
    const source = fs.readFileSync(p(target.from), "utf8");
    const generated = target.transform(source);

    for (const {re, fix} of OUTPUT_CHECKS) {
        const hit = generated.match(re);
        if (!hit) continue;
        const at = generated.indexOf(hit[0]);
        console.error(`${target.to}:${lineOf(generated, at)}: ${fix}`);
        console.error(`  context: ${generated.slice(Math.max(0, at - 30), at + 30).replace(/\n/g, " ")}`);
        process.exit(1);
    }

    const existing = fs.existsSync(p(target.to)) ? fs.readFileSync(p(target.to), "utf8") : null;
    if (existing === generated) {
        console.log(`${target.to} up to date`);
        continue;
    }
    if (checkOnly) {
        console.error(`${target.to} is stale - run \`npm run build:zh-tw\` and commit the result`);
        stale++;
        continue;
    }
    fs.writeFileSync(p(target.to), generated, "utf8");
    console.log(`wrote ${target.to}`);
}

if (stale) process.exit(1);

console.log(
    `${overridePairs.length} override(s) applied` +
    (overridePairs.length ? `: ${overridePairs.map(([f, t]) => `${f}->${t}`).join(", ")}` : ""),
);
