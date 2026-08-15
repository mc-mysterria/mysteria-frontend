/*
 * Generates src/assets/fontawesome-subset.css.
 *
 * The site used to pull the whole Font Awesome stylesheet from cdnjs — an extra
 * DNS + TLS handshake to a third party, ~30 KB gzipped of CSS for a few dozen
 * icons, and icons that could only paint once a remote webfont arrived.
 *
 * This walks src/, collects the `fa-solid fa-<name>` classes actually used, and
 * emits just those glyph rules plus the base/utility rules they need. The font
 * itself is copied to src/assets/fonts/ and referenced relatively, so Vite
 * fingerprints it like any other asset.
 *
 * Re-run with `npm run build:icons` after adding or removing an icon.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import subsetFont from "subset-font";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");
const faRoot = path.join(root, "node_modules/@fortawesome/fontawesome-free");
const OUT_CSS = path.join(src, "assets/fontawesome-subset.css");
const FONT_DIR = path.join(src, "assets/fonts");
const FONT_FILE = "fa-solid-subset.woff2";
const SOURCE_FONT = "fa-solid-900.woff2";

/* ---- 1. which icons does the app actually use? ---- */

const used = new Set();
const styles = new Set();
(function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (/\.(vue|ts|js|json)$/.test(entry.name)) {
            const text = fs.readFileSync(p, "utf8");
            for (const m of text.matchAll(/fa-(solid|regular|brands)\s+fa-([a-z0-9-]+)/g)) {
                styles.add(m[1]);
                used.add(m[2]);
            }
            // standalone utility classes (fa-spin, fa-fw, …) used alongside an icon
            for (const m of text.matchAll(/\bfa-(spin|pulse|fw|border|beat|fade|flip|shake|bounce|spin-reverse|2xs|xs|sm|lg|xl|2xl)\b/g)) {
                used.add(m[1]);
            }
        }
    }
})(src);

const nonSolid = [...styles].filter(s => s !== "solid");
if (nonSolid.length) {
    console.error(
        `\n  This subset ships the solid face only, but found ${nonSolid.join(", ")} usage.\n` +
        `  Either switch those icons to fa-solid or extend this script to emit the extra faces.\n`,
    );
    process.exit(1);
}

/* ---- 2. pull the matching rules out of the full stylesheet ---- */

const full = fs.readFileSync(path.join(faRoot, "css/all.css"), "utf8");

/*
 * Since 6.6 the glyph is carried by a `--fa` custom property rather than a
 * `content:` declaration — `.fa-route { --fa: "\f4d7"; }` — and one shared
 * `::before` rule pipes it into `content`.
 */
const glyphs = new Map();
for (const m of full.matchAll(/\.fa-([a-z0-9-]+)\s*\{\s*--fa:\s*"([^"]+)";?\s*\}/g)) {
    if (!glyphs.has(m[1])) glyphs.set(m[1], m[2]);
}

/** Rules we always need: the .fa/.fa-solid base, sizing, spin, and keyframes. */
const preamble = [
    `.fa,
.fa-solid,
.fas {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: var(--fa-display, inline-block);
  font-style: normal;
  font-variant: normal;
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  line-height: 1;
  text-rendering: auto;
}`,
    `.fa::before,
.fa-solid::before,
.fas::before {
  content: var(--fa);
}`,
];

/* Utility classes are only emitted when the app actually uses one. */
const UTILITIES = {
    fw: `.fa-fw { text-align: center; width: 1.25em; }`,
    lg: `.fa-lg { font-size: 1.25em; line-height: .05em; vertical-align: -.075em; }`,
    sm: `.fa-sm { font-size: .875em; line-height: .07142857em; vertical-align: .05357143em; }`,
    xl: `.fa-xl { font-size: 1.5em; line-height: .04166667em; vertical-align: -.125em; }`,
    spin: `.fa-spin {
  animation-name: fa-spin;
  animation-delay: var(--fa-animation-delay, 0s);
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 2s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, linear);
}

@media (prefers-reduced-motion: reduce) {
  .fa-spin {
    animation-delay: -1ms;
    animation-duration: 1ms;
    animation-iteration-count: 1;
  }
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`,
    pulse: `.fa-pulse,
.fa-spin-pulse {
  animation-name: fa-spin;
  animation-direction: var(--fa-animation-direction, normal);
  animation-duration: var(--fa-animation-duration, 1s);
  animation-iteration-count: var(--fa-animation-iteration-count, infinite);
  animation-timing-function: var(--fa-animation-timing, steps(8));
}`,
};

for (const [name, rule] of Object.entries(UTILITIES)) {
    if (used.has(name)) preamble.push(rule);
}

const iconNames = [...used].filter(n => glyphs.has(n)).sort();
const missing = [...used].filter(n => !glyphs.has(n) && !/^(spin|pulse|fw|border|beat|fade|flip|shake|bounce|spin-reverse|2xs|xs|sm|lg|xl|2xl)$/.test(n));
if (missing.length) {
    console.error(`\n  Unknown Font Awesome icon(s): ${missing.join(", ")}\n`);
    process.exit(1);
}

/* ---- 3. cut the webfont down to the glyphs we reference ---- */

fs.mkdirSync(FONT_DIR, {recursive: true});

const sourceFont = fs.readFileSync(path.join(faRoot, "webfonts", SOURCE_FONT));
// The glyphs live in the Private Use Area; `--fa: "\f4d7"` is the code point.
const codePoints = iconNames
    .map(name => String.fromCodePoint(parseInt(glyphs.get(name).replace(/\\/g, ""), 16)))
    .join("");
const subsetted = await subsetFont(sourceFont, codePoints, {targetFormat: "woff2"});
fs.writeFileSync(path.join(FONT_DIR, FONT_FILE), subsetted);

const css = [
    `/* GENERATED by scripts/build-fontawesome-subset.mjs - do not edit by hand.`,
    `   Font Awesome Free ${JSON.parse(fs.readFileSync(path.join(faRoot, "package.json"), "utf8")).version},`,
    `   solid face only, ${iconNames.length} glyph rules (of ${glyphs.size} available).`,
    `   Licence: CC BY 4.0 (icons) / SIL OFL 1.1 (font) - https://fontawesome.com/license/free */`,
    ``,
    `@font-face {`,
    `  font-family: 'Font Awesome 6 Free';`,
    `  font-style: normal;`,
    `  font-weight: 900;`,
    `  font-display: block;`,
    `  src: url('./fonts/${FONT_FILE}') format('woff2');`,
    `}`,
    ``,
    ...preamble,
    ``,
    ...iconNames.map(name => `.fa-${name} { --fa: "${glyphs.get(name)}"; }`),
    ``,
].join("\n");

fs.writeFileSync(OUT_CSS, css, "utf8");

console.log(`Font Awesome subset: ${iconNames.length} icons of ${glyphs.size}`);
console.log(`  CSS   ${(css.length / 1024).toFixed(1)} KB   -> ${path.relative(root, OUT_CSS)}`);
console.log(
    `  font  ${(subsetted.length / 1024).toFixed(1)} KB   -> ${path.relative(root, path.join(FONT_DIR, FONT_FILE))}` +
    `   (from ${(sourceFont.length / 1024).toFixed(1)} KB)`,
);
