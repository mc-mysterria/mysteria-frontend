# design-sync notes — mysterria-frontend

## This repo cannot use the standard converter

`mysterria-frontend` is a **Vue 3 SPA**, not a React component library:

- 98 `.vue` single-file components, zero `.tsx`/`.jsx`, no Storybook.
- `dist/` is a built application (`index.html` + hashed assets), not a library dist.
- `package.json` is `private: true` with no `exports`/`main`.

The design-sync converter is React-only — `lib/bundle.mjs` externalises `react`/`react-dom` to `window.React`, emits `.jsx` re-export stubs and `<Name>Props` `.d.ts`, and the design agent renders components off `window.<globalName>.*`. There is no path from `.vue` SFCs to that runtime. **Do not attempt a component sync.**

What is synced instead is a **foundations-only** design system: tokens, self-hosted fonts, the CSS class layer, guidelines and the README. It is hand-authored (off-script), not converter-generated. `package-validate.mjs` is still the gate and exits clean.

## How to rebuild it

There is no `buildCmd` — nothing compiles. The bundle is authored directly under `ds-bundle/`:

- `tokens/color.css` — verbatim from `src/assets/main.css`, plus derived surface/border tokens.
- `tokens/typography.css`, `tokens/space.css` — **names introduced by the design system**; values are the most frequent literals across the 98 components (measured, not invented).
- `base.css`, `utilities.css` — the app's real element defaults and class vocabulary from `main.css`.
- `fonts/` — regenerate with `node .design-sync/fetch-fonts.mjs ./ds-bundle/fonts`.
- `_ds_bundle.js` — deliberately empty-bodied with a `componentCount: 0` header.

Committed helper scripts in `.design-sync/`:

| Script | Run it as | Needs |
|---|---|---|
| `fetch-fonts.mjs` | `node .design-sync/fetch-fonts.mjs ./ds-bundle/fonts` | network |
| `check-names.mjs` | `node .design-sync/check-names.mjs ./ds-bundle .design-sync/conventions.md` | — |
| `verify-render.mjs` | copy into `.ds-sync/` first, then `node .ds-sync/verify-render.mjs ./ds-bundle <shotdir>` | playwright + chromium, installed in `.ds-sync/` |

`verify-render.mjs` imports `playwright`, which only resolves from inside `.ds-sync/` (where the converter deps are installed) — hence the copy step. Set `.ds-sync/` up with:

```
npm i esbuild ts-morph @types/react playwright && npx playwright install chromium
```

Gate on both: `node .ds-sync/package-validate.mjs ./ds-bundle` must exit 0, and `verify-render.mjs` must exit 0.

### Two converter quirks to expect

- **`package-validate.mjs` crashes without a `components/` directory.** The tokens-only guard exists for the preview count check (`tokensOnly` at ~line 368) but the render collector at ~line 417 calls `readdirSync` unguarded. Keep an empty `ds-bundle/components/` directory present. It does not upload (empty dirs aren't files) and does no harm.
- **The validator's render check is vacuous here** — it reports `0/0 previews render cleanly` because there are no component cards. It proves nothing about the CSS. `.ds-sync/verify-render.mjs` is the real verification: it serves the bundle, renders a page using the actual classes and tokens, and asserts all three fonts load, no token resolves empty, headings compute to Playfair, labels to JetBrains Mono, and `data-theme="parchment"` actually swaps the background. Run it on every rebuild.

## Fonts

`index.html` loads **only Inter**. The components declare `'JetBrains Mono'` 174 times and `'Playfair Display'` 82 times, and neither is loaded anywhere — verified against `main.ts`, `dist/index.html` and the built CSS. **In production both fall back to generic `monospace`/`serif`.** This is a live bug in the app, not in the sync.

The design system self-hosts all three (26 woff2, ~860 KB), subset to `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext` — Cyrillic is required, the site supports Ukrainian. Regenerating them re-downloads from Google Fonts; the fetch script filters subsets and rewrites `@font-face` `url()`s to local paths.

If the app is ever fixed to load these fonts, keep the family names identical or the design system and the app will drift.

## Re-sync risks

- **Token drift.** `tokens/color.css` duplicates the `:root` block in `src/assets/main.css`. If the palette changes there, nothing detects it — re-diff the two by hand on each sync.
- **Extracted scales rot silently.** The spacing/radius/motion values were measured from the component tree at sync time. Heavy refactoring makes them stale without any error.
- **`utilities.css` is a hand-copy** of `main.css`'s class layer with token substitutions. New classes added to `main.css` will not appear until someone copies them.
- **`conventions.md` names must stay true.** Re-run the name-validation pass on every sync: every `--myst-*` token and every class enumerated there must exist in the built CSS. A name that stops resolving makes the design agent emit silently unstyled output.
- **Network-fetched fonts.** The build assumed Google Fonts reachable. A future run offline must reuse the existing `ds-bundle/fonts/`.
- **`h1`–`h6` default to Playfair here but not in the app.** Deliberate (documented in the README's provenance section). If the app adopts the same default, they converge; until then a design will show heading fonts the Vue app only applies per-component.
