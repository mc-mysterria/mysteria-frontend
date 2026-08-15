// Real verification for a tokens-only DS: the converter's render check is
// vacuous with 0 components, so render a page that actually exercises the
// stylesheet and assert the fonts load and the tokens resolve.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const OUT = process.argv[2];
const SHOT = process.argv[3];

const MIME = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.html': 'text/html' };
const PAGE = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"></head><body>
<section class="container p-responsive">
  <header class="myst-page-header">
    <span class="myst-header-decoration"></span>
    <p class="myst-header-label">Catalogue</p>
    <span class="myst-header-decoration"></span>
  </header>
  <h1>Пізнання Таємниць</h1>
  <h2 id="h2">The Fool</h2>
  <p id="body">Sequence 0 — the pathway of secrets, divination and disguise.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
    <article class="card"><h3>Seer</h3><p class="text-base" style="color:var(--myst-ink-muted)">Sequence 9</p>
      <a class="btn btn-primary" href="#">Begin</a></article>
    <article class="card"><h3>Clown</h3><p class="text-base" style="color:var(--myst-ink-muted)">Sequence 8</p>
      <a class="btn" href="#">Read</a></article>
    <article class="bg-panel p-responsive"><span class="mystical-text">Panel surface</span></article>
  </div>
</section></body></html>`;

const server = createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') { res.setHeader('content-type', 'text/html; charset=utf-8'); return res.end(PAGE); }
  const p = join(OUT, decodeURIComponent(url));
  if (!existsSync(p)) { res.statusCode = 404; return res.end('nope'); }
  res.setHeader('content-type', MIME[extname(p)] ?? 'application/octet-stream');
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const failed = [];
page.on('requestfailed', (r) => failed.push(r.url()));
page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const report = await page.evaluate(() => {
  const cs = (sel, prop) => getComputedStyle(document.querySelector(sel)).getPropertyValue(prop);
  const root = getComputedStyle(document.documentElement);
  return {
    fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`),
    playfairUsable: document.fonts.check('700 16px "Playfair Display"'),
    monoUsable: document.fonts.check('500 13px "JetBrains Mono"'),
    interUsable: document.fonts.check('400 16px "Inter"'),
    h2Family: cs('#h2', 'font-family'),
    labelFamily: cs('.myst-header-label', 'font-family'),
    bodyFamily: cs('#body', 'font-family'),
    bodyBg: cs('body', 'background-color'),
    cardBg: cs('.card', 'background-color'),
    btnBg: cs('.btn-primary', 'background-color'),
    labelColor: cs('.myst-header-label', 'color'),
    gold: root.getPropertyValue('--myst-gold').trim(),
    // an unresolved var() computes to empty
    unresolved: ['--myst-bg', '--myst-radius-lg', '--myst-font-display', '--myst-space-8', '--myst-tracking-label']
      .filter((t) => !root.getPropertyValue(t).trim()),
  };
});

await page.screenshot({ path: join(SHOT, 'dark.png'), fullPage: true });
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'parchment'));
await page.waitForTimeout(200);
const light = await page.evaluate(() => ({
  bodyBg: getComputedStyle(document.body).backgroundColor,
  gold: getComputedStyle(document.documentElement).getPropertyValue('--myst-gold').trim(),
}));
await page.screenshot({ path: join(SHOT, 'parchment.png'), fullPage: true });

await browser.close(); server.close();

writeFileSync(join(SHOT, 'report.json'), JSON.stringify({ ...report, light, failed }, null, 2));
console.log(JSON.stringify({ ...report, fontsLoaded: report.fontsLoaded.length, light, failed }, null, 2));

const problems = [];
if (!report.playfairUsable) problems.push('Playfair Display did not load');
if (!report.monoUsable) problems.push('JetBrains Mono did not load');
if (!report.interUsable) problems.push('Inter did not load');
if (report.unresolved.length) problems.push('unresolved tokens: ' + report.unresolved.join(', '));
if (!/Playfair/.test(report.h2Family)) problems.push('h2 is not Playfair: ' + report.h2Family);
if (!/JetBrains/.test(report.labelFamily)) problems.push('label is not JetBrains Mono: ' + report.labelFamily);
if (failed.length) problems.push('failed requests: ' + failed.join(', '));
if (light.bodyBg === report.bodyBg) problems.push('parchment theme did not change the background');

console.log(problems.length ? '\n✗ ' + problems.join('\n✗ ') : '\n✓ stylesheet renders correctly in both themes');
process.exit(problems.length ? 1 : 0);
