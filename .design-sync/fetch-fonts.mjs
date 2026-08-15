// Downloads the three Mysterria families from Google Fonts, keeps only the
// subsets the site needs (English + Ukrainian), and rewrites the @font-face
// url()s to local files under ds-bundle/fonts/.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const KEEP = new Set(['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext']);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@600;700&display=swap';

const css = await (await fetch(URL, { headers: { 'User-Agent': UA } })).text();

// Each @font-face is preceded by a `/* <subset> */` comment.
const blocks = [...css.matchAll(/\/\* (\S+) \*\/\s*(@font-face \{[^}]*\})/g)];
const out = [];
let kept = 0;

for (const [, subset, block] of blocks) {
  if (!KEEP.has(subset)) continue;
  const family = /font-family: '([^']+)'/.exec(block)[1];
  const weight = /font-weight: (\d+)/.exec(block)[1];
  const url = /url\((https:[^)]+)\)/.exec(block)[1];

  const slug = family.toLowerCase().replace(/\s+/g, '-');
  const file = `${slug}-${weight}-${subset}.woff2`;

  const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  writeFileSync(join(OUT, file), buf);
  kept++;

  out.push(`/* ${subset} */\n${block.replace(/url\(https:[^)]+\)/, `url(./${file})`)}`);
}

writeFileSync(join(OUT, 'fonts.css'), `/* Mysterria brand typefaces — self-hosted, subset to latin + cyrillic.
   Generated from Google Fonts by the design sync; do not hand-edit. */\n\n${out.join('\n\n')}\n`);
console.log(`wrote ${kept} woff2 + fonts.css`);
