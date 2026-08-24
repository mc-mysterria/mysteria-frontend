# Localization

Four locales: `en`, `uk`, `zh-CN` (Simplified), `zh-TW` (Traditional).

Chinese ships as two locales rather than one. Traditional is the official-facing
one for Taiwan and Hong Kong; Simplified serves mainland readers who arrive on
their own. They are separate locales, not a render-time character swap, so a
reviewer can correct either without touching the other.

---

## The one rule

**Chinese terminology is a lookup, not a translation choice.**

The readers of these locales are the source fandom of 《诡秘之主》. They already
know what every Pathway, Sequence and mechanic is called, and a paraphrase reads
as a bad fan translation no matter how accurate it is. Everything canonical is
locked in [`glossary.lotm-zh.json`](glossary.lotm-zh.json) and
[`canon.sequences-zh.json`](canon.sequences-zh.json).

途径 · 序列 · 非凡者 · 魔药 · 灰雾 · 扮演 · 晋升 · 失控 — never substitute these.

### Pathways are named after Sequence 9, not Sequence 0

The single easiest thing to get wrong. **English names a pathway after its
Sequence 0; Chinese names it after its Sequence 9.**

|                       | English      | Chinese                  |
|-----------------------|--------------|--------------------------|
| the route             | Fool pathway | **占卜家途径** (Seer pathway) |
| the god at its summit | Fool         | **愚者**                   |

English reuses one word for both. Chinese does not, and 愚者途径 is not how the
fandom refers to the route — the Chinese LOTM wiki files it under 占卜家途径, and
百度百科's 愚者 entry is about the Sequence 0 deity
(*序列0代表最高的真神层级，获得相应的神话名号*).

So two separate fields ship, and conflating them is a bug:

- `pathwayNames` in `pathways.zh-CN.json` → the **label** (Sequence 9). Used
  everywhere a pathway is named.
- `deityNames` → the **Sequence 0 title**. Used by the Ascension registry for the
  Deity throne, via `deityName()` in `src/data/pathways.ts`.

`deityName()` falls back to the label, so English and Ukrainian are unaffected.

The ten boon pathways currently keep a direct translation of Mysterria's own
English label (永恒纪元, 第二法则, 月下). **This is unverified and probably wrong
— see "Boon pathways need a canon pass" below.**

One knock-on: on the home page's tarot cards the pathway label and the "SEQ 9"
role are now the same word in Chinese, so the role is suppressed when it would
duplicate the title (`HomeView.vue`). If you would rather show the deity there —
占卜家 crowned by 愚者 — that is a design call, not a translation one.

---

## Who owns what

| File                                      | Status                                       |
|-------------------------------------------|----------------------------------------------|
| `src/locales/en.ts`                       | authored — the reference key shape           |
| `src/locales/uk.ts`                       | authored                                     |
| `src/locales/zh-CN.ts`                    | **authored** — the Chinese source of truth   |
| `src/locales/zh-TW.ts`                    | **generated** — do not edit                  |
| `src/assets/sources/pathways.zh-CN.json`  | **authored** — pathway/Sequence/ability text |
| `src/assets/sources/pathways.zh-TW.json`  | **generated**                                |
| `src/assets/sources/meta-copy.zh-CN.json` | **authored** — link-preview copy             |
| `src/assets/sources/meta-copy.zh-TW.json` | **generated**                                |
| `src/data/guide/zh-CN.ts`                 | **authored** — long-form onboarding prose    |
| `src/data/guide/zh-TW.ts`                 | **generated**                                |
| `src/assets/sources/rules_zh-CN.json`     | **authored** — player rules                  |
| `src/assets/sources/rules_zh-TW.json`     | **generated**                                |
| `staff_rules_zh-CN.json` (same dir)       | **authored** — staff rules                   |
| `staff_rules_zh-TW.json` (same dir)       | **generated**                                |
| `i18n/glossary.lotm-zh.json`              | authored — locked terminology                |
| `i18n/canon.sequences-zh.json`            | reference — the novel's own ladder           |
| `i18n/zh-TW.overrides.json`               | authored — where the TW reviewer pass lands  |

Fix Simplified text in the `zh-CN` files. Fix Traditional-only wording in
`zh-TW.overrides.json`. Never edit a generated file: the next build overwrites it.

---

## Commands

```bash
npm run build:zh-tw       # regenerate every Traditional file (runs in `npm run build`)
npm run check:zh-tw       # CI: fail if a committed generated file is stale
npm run seed:zh           # add empty slots after the plugin exports new abilities
npm run check:canon-zh    # report where Mysterria's rungs diverge from the novel
node scripts/i18n-coverage.mjs   # translation coverage per surface
```

## How Traditional is produced

`zh-CN` → OpenCC `s2twp` (Taiwan *vocabulary* substitution, not just characters)
→ glossary overrides → reviewer overrides → `zh-TW`.

Conversion runs over whole files. Every key, id and placeholder in them is ASCII,
so OpenCC only rewrites Chinese characters and leaves structure untouched.

The converter is good but not correct. Two failures it made here, both caught and
overridden — worth re-checking after any `opencc-js` upgrade:

- **无面人 → 無麵人.** Read 面 (face) as 麵 (noodles) and renamed the Fool
  pathway's Sequence 6 to "Noodle-less Man".
- **循环 → 迴圈.** Correct for a programming loop, wrong for the dozens of
  descriptions meaning "left-click cycles modes" or "the cycle of decay", which
  want 循環.
- **权限 → 許可權** and **语音频道 → 語音訊道.** Segmentation failures: it read
  权限 as 許可+權, and found 音频 inside 语音频道 and applied the
  correct-in-isolation 音頻→音訊 (audio) mapping. Both produce non-words.
- **里克 → 裡克.** Read the currency 里克 (Lick) as 里 "inside". The three
  currencies are the novel's Intis ladder — 1 因蒂費爾 = 10 里克 = 100 科佩 —
  so this is a canon name, not a preference.
- **频道里 → 頻道里.** The opposite miss: left 里 alone where it does mean
  "inside" and wanted 裡.
- **发布 → 釋出** and **代码质量 → 程式碼質量.** TW wants 發布 and 品質; 質量
  means "mass" there.
- **Minecraft's own strings differ by more than characters.** 廢棄礦井 →
  廢棄礦坑, 精準採集 → 絲綢之觸. Players match the guide against what their
  client shows them, so the client's wording wins.
- **Instrumental 通過 → 透過.** TW reads 通過 for "by means of" as a
  mainland-ism, but it is correct for "approved" (已通過). Only the "via X"
  readings are rewritten, phrase by phrase.

Every one of those was found by hand-reading generated output, so
`REGISTER_CHECKS` in `scripts/build-zh-tw.mjs` now fails the build if any of
them reappears, naming the override to add. New Simplified copy that reintroduces
the pattern trips the tripwire instead of shipping quietly.

One coupling to keep in mind: the 釋出 → 發布 override is only safe because
`pathways.zh-CN.json` was normalised to use 释放, never 释出, for unleashing an
attack. Writing 释出 in Simplified copy will now silently become 發布.

Overrides are phrase-level and applied longest-first. **Never add a
single-character rule** — a bare 秘→祕 would corrupt 詭秘之主, whose Taiwan print
edition keeps 秘. The script refuses single-character overrides outright.

---

## Open decisions

### 1. The Darkness pathway diverges from its English ladder

All nine Darkness rungs were renamed at some point in Mysterria's English data.
The Chinese ships the novel's names, per the terminology rule above:

| Seq | Mysterria (en)        | Chinese shipped (canon) |
|-----|-----------------------|-------------------------|
| 9   | Shadow Wanderer       | 不眠者 (Sleepless)         |
| 8   | Night Singer          | 午夜诗人 (Midnight Poet)    |
| 7   | Nightmare Weaver      | 梦魇 (Nightmare)          |
| 6   | Keeper of Souls       | 安魂师 (Soul Assurer)      |
| 5   | Lord of Spirits       | 灵巫 (Spirit Warlock)     |
| 4   | Harbinger of Twilight | 守夜人 (Nightwatcher)      |
| 3   | Endless Night         | 恐惧主教 (Bishop of Fear)   |
| 2   | Eternal Darkness      | 隐秘之仆 (Hidden Servant)   |
| 1   | Lord of the Void      | 厄难骑士 (Doom Knight)      |

So a Chinese reader and an English reader will call the same rung different
things. Mysterria's own ability text already references "Servant of Concealment"
— the canon Sequence 2 name — which suggests the English drifted rather than the
Chinese being wrong.

**The clean fix is upstream**: rename these rungs to canon in the Circle of
Imagination plugin, which regenerates `pathway-abilities.json`. Until then, the
divergence is deliberate. To reverse it instead, replace the `darkness` block in
`scripts/fill-pathways-zh-names.mjs` and re-run it.

### 2. Boon pathways — resolved, 42 of 50 rungs from canon

**The ten "boon" pathways are not Mysterria inventions.** They are Outer God
(外神) routes from the novel. The 22 are the routes of the Primordial Creator
plus six inherited from Outer Gods; the Outer Gods have many more of their own, so
the real total is well above 22.

The canon was looked up rather than guessed, and the result changed the framing
entirely: **Mysterria's English boon ladders are direct translations of the canon
Chinese ones — 34 of 35 rungs line up position for position.** These were never
translation choices. Two things fell out of that:

- `Ex Saddict` is a garbled *Sex Addict* — canon 性瘾病人.
- `Patriarch` is 主父, the **Sequence 0** of 欲望母树 — exactly how English names
  the 22 after their Sequence 0. The server's boon labels follow the same rule
  its standard labels do.

| Mysterria     | Outer God (= the label)             | Ladder     |
|---------------|-------------------------------------|------------|
| `chaos`       | 堕落母神 (Fallen Mother Goddess)        | full canon |
| `patriarch`   | 欲望母树 (Mother Tree of Desire)        | full canon |
| `chaosmist`   | 混沌之子 (Child of Chaos)               | full canon |
| `aeon`        | 宿命之环 (Circle of Inevitability)      | full canon |
| `edict`       | 命运女神 (Goddess of Fate)              | full canon |
| `condenser`   | 超星主宰 (Hyperstar Sovereign)          | full canon |
| `devouring`   | 原初饥饿 (Primordial Hunger)            | full canon |
| `sublunary`   | 高维俯视者 (High-Dimensional Overlooker) | partial    |
| `everlasting` | 不熄的呓语 (Unextinguished Whispers)     | partial    |
| `secondlaw`   | 衰败君王 (Lord of Decay)                | partial    |

`aeon` belonging to 宿命之环 also makes the plugin's name a sharper joke than
assumed: 空想之环 puns on the very Outer God whose pathway the server ships.

**The label is the Outer God's name, not the Sequence 9 rung.** The 22 are
labelled by Sequence 9, so this keeps an Outer God route visually distinct from a
standard one, and stops the label from merely repeating the rung beneath it.

**Two ladders are shuffled against canon and must not be mapped by number.** The
novel puts 瘟疫医生 at Sequence 9 (Mysterria: Carrier) and 画家 at Sequence 9
(Mysterria: Shaman). Canon *words* are therefore placed at Mysterria's *own*
positions. `pathways-zh.spec.ts` asserts this explicitly, because mapping by
sequence number is the obvious mistake to make here.

What is left is in `i18n/checklist.boon-pathways.md`: eight rungs across the three
partial ladders, and a register check on 慾望母樹.

The 22 core pathways are unaffected — and were independently re-verified against a
full published ladder while doing this. All 22 matched.

### 3. Sixteen other rungs were renamed less severely

Typos (`Flithy Monarch`, `Iron-bloodied Knight`) and synonyms (`Spirit Guide` for
Mentor of Spirits, `Artisan` for Mechanical Expert) — all shipped as canon, which
is uncontroversial. See `npm run check:canon-zh`.

One is a genuine data bug: **Wheel of Fortune Sequence 5 is labelled `Lucky 1`,
duplicating Sequence 7.** Canon has 赢家 (Winner), which is what Chinese ships.
Worth fixing in the English.

### 4. `%%` in English ability descriptions

Several descriptions contain a literal `%%` (`20%%`, `35%%`) — a plugin
format-string artifact that reaches the site verbatim and renders as `20%%`.
Chinese normalizes these to a single `%`. Fixing the English is an upstream job.

### 5. Traditional vocabulary awaiting a native reader

`zh-TW.overrides.json` → `reviewCandidates` lists terms where Taiwan usage may
differ from what s2twp emits (神秘學 vs 神祕學, 獲取 vs 取得, 實現 vs 實作).
They ship as-emitted rather than guessed at. Confirm each with a TW reader, then
move it into `overrides`.

---

## What still falls back to English

Everything below renders English for Chinese readers. Nothing is broken — `t()`
and `pick()` fall back per key, so partial coverage is a valid state.

- **Legal pages** — `TermsView`, `PrivacyView` and `SLAView` have their copy
  hardcoded in the template, in English, for *every* locale including Ukrainian.
  This is a pre-existing gap rather than a Chinese one, and translating terms of
  service is a decision for whoever owns the legal text, not the i18n pass.
- **Staff-only tooling** — the admin panel, balance dashboard, and the news and
  service editors are English-only by design. They are never shown to players.
- **News articles** — authored in the CMS, which only carries en/uk. Chinese
  readers are served the English dispatch at its English URL, and hreflang
  deliberately advertises no Chinese version. Flip `articleLocale` in
  `src/locales/index.ts` once zh articles exist.
- **Ukrainian link previews** in the crawler meta-proxy — a pre-existing gap.

---

## URLs and SEO

Every page is served under a locale segment: `/en/guide`, `/zh-TW/guide`. The URL
is the source of truth for language — the router reads the segment and tells the
i18n layer, so a shared link always opens in the language it was shared in.

- `/auth/callback` stays **outside** the prefix: it is registered with Discord as
  the OAuth redirect URI and matched literally in `stores/auth.ts`.
- The bare domain negotiates language at the edge from `Accept-Language`
  (`vercel.json` → `redirects`), as a 307 with `Vary: Accept-Language`. It has to
  be temporary — a permanent redirect would let a CDN pin one visitor's language
  for everyone.
- Legacy unprefixed deep links 308 to their `/en/` equivalents, preserving the
  ranking of URLs that served English before locales existed.
- hreflang is derived automatically in `useSeo.ts` by swapping the locale
  segment; pages only declare `alternates` where the mapping is not one-to-one.
- Chinese uses **script** subtags (`zh-Hans` / `zh-Hant`) for hreflang and
  `<html lang>`, not regions, so one page serves every Traditional (TW/HK/MO) or
  Simplified (CN/SG) reader instead of a single country.
- `sitemap.xml` emits each route once per locale with `xhtml:link` alternates.

## Fonts

Inter, Playfair Display and JetBrains Mono carry no CJK glyphs. `main.css`
defines per-script CJK stacks that key off `<html lang>`, splitting Simplified
from Traditional — several codepoints are drawn differently in mainland and
Taiwan fonts, and a native reader notices the wrong regional face. It also
tightens the design's wide mono letter-spacing, which reads as broken on
full-width glyphs, and drops `text-transform: uppercase`, which does nothing to
Chinese but mangles Latin brand words inside the same label.
