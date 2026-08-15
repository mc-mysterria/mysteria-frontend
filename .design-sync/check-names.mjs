// Verifies every token and class named in conventions.md is actually defined
// in the built ds-bundle CSS. A name that doesn't resolve is worse than no
// documentation at all — the design agent would trust it and ship unstyled output.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
const doc = readFileSync(process.argv[3], 'utf8');

// Every CSS file reachable from the bundle
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) walk(join(d, e.name));
    else if (e.name.endsWith('.css')) files.push(join(d, e.name));
  }
})(OUT);
const css = files.map((f) => readFileSync(f, 'utf8')).join('\n');

const definedTokens = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]));
const definedClasses = new Set([...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]));

// Expand the doc's shorthand: `--myst-radius-xs|sm|md` and `--myst-space-1 … --myst-space-12`
const claimedTokens = new Set();
for (const m of doc.matchAll(/`(--myst-[a-z0-9-]+(?:\|[a-z0-9]+)*)`/g)) {
  const raw = m[1];
  if (raw.includes('|')) {
    const [, stem, first] = /^(--myst-[a-z0-9-]+?-)([a-z0-9]+)((?:\|[a-z0-9]+)+)$/.exec(raw) ?? [];
    if (stem) {
      claimedTokens.add(stem + first);
      for (const v of raw.slice(raw.indexOf('|') + 1).split('|')) claimedTokens.add(stem + v);
      continue;
    }
  }
  claimedTokens.add(raw);
}
// the "--myst-space-1 … --myst-space-12" range
if (doc.includes('--myst-space-1` … `--myst-space-12')) {
  for (let i = 1; i <= 12; i++) claimedTokens.add(`--myst-space-${i}`);
}
if (doc.includes('--myst-text-xs` … `--myst-text-4xl')) {
  for (const s of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl']) claimedTokens.add(`--myst-text-${s}`);
}

const claimedClasses = new Set(
  [...doc.matchAll(/`\.([a-zA-Z][\w-]*)`/g)].map((m) => m[1])
    .concat([...doc.matchAll(/`\.h1`–`\.h6`/g)].length ? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] : []),
);

const badTokens = [...claimedTokens].filter((t) => !definedTokens.has(t)).sort();
const badClasses = [...claimedClasses].filter((c) => !definedClasses.has(c)).sort();

console.log(`tokens: ${claimedTokens.size} claimed, ${definedTokens.size} defined in CSS`);
console.log(`classes: ${claimedClasses.size} claimed, ${definedClasses.size} defined in CSS`);
if (badTokens.length) console.log(`\n✗ UNDEFINED TOKENS (${badTokens.length}):\n  ` + badTokens.join('\n  '));
if (badClasses.length) console.log(`\n✗ UNDEFINED CLASSES (${badClasses.length}):\n  ` + badClasses.join('\n  '));
if (!badTokens.length && !badClasses.length) console.log('\n✓ every name in conventions.md resolves');
process.exit(badTokens.length + badClasses.length ? 1 : 0);
