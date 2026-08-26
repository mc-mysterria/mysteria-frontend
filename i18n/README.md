# Localization

Eight locales: `en`, `uk`, `ro`, `de`, `es`, `fr`, `zh-CN` (Simplified), and
`zh-TW` (Traditional).

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

途径 · 序列 · 非凡者 · 魔药 · 灰雾 · 扮演 · 晋升 · 失控 - never substitute these.

### Pathways are named after Sequence 9, not Sequence 0

The single easiest thing to get wrong. **English names a pathway after its
Sequence 0; Chinese names it after its Sequence 9.**

|                       | English      | Chinese                  |
|-----------------------|--------------|--------------------------|
| the route             | Fool pathway | **占卜家途径** (Seer pathway) |
| the god at its summit | Fool         | **愚者**                   |

English reuses one word for both. Chinese does not, and 愚者途径 is not how the
fandom refers to the route - the Chinese LOTM wiki files it under 占卜家途径, and
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
- see "Boon pathways need a canon pass" below.**

One knock-on: on the home page's tarot cards the pathway label and the "SEQ 9"
role are now the same word in Chinese, so the role is suppressed when it would
duplicate the title (`HomeView.vue`). If you would rather show the deity there -
占卜家 crowned by 愚者 - that is a design call, not a translation one.

---

## Who owns what

Three kinds of file, and which one you are looking at decides where a fix goes.
**English source** is authored in this repo and is what Weblate translates from.
**Weblate** files are written by a Weblate push - edit them in Weblate, because a
repo-side edit is overwritten on the next pull. **Generated** files are built by a
script.

| File                                      | Status                                            |
|-------------------------------------------|---------------------------------------------------|
| `src/locales/en.json`                     | **English source** - the reference key shape      |
| `src/locales/{uk,zh-CN,ro,de,es,fr}.json` | **Weblate** - component `ui`                      |
| `src/locales/zh-TW.json`                  | **generated** - do not edit                       |
| `src/data/guide/en.json`                  | **English source** - long-form onboarding prose   |
| `src/data/guide/{uk,zh-CN,ro,de,es,fr}.json` | **Weblate** - component `guide`                 |
| `src/data/guide/zh-TW.json`               | **generated**                                     |
| `src/assets/sources/meta-copy.en.json`    | **English source** - link-preview copy            |
| `src/assets/sources/meta-copy.<lang>`     | **Weblate** - component `link-previews`           |
| `src/assets/sources/meta-copy.zh-TW.json` | **generated**                                     |
| `src/assets/sources/rules_en.json`        | **English source** - player rules                 |
| `src/assets/sources/rules_<lang>`         | **Weblate** - component `rules`                   |
| `src/assets/sources/rules_zh-TW.json`     | **generated**                                     |
| `staff_rules_en.json` (same dir)          | **English source** - staff rules                  |
| `staff_rules_<lang>.json` (same dir)      | **Weblate** - component `staff-rules`             |
| `staff_rules_zh-TW.json` (same dir)       | **generated**                                     |
| `src/assets/sources/pathways.zh-CN.json`  | **authored here** - canon lookup, *not* in Weblate |
| `src/assets/sources/pathways.zh-TW.json`  | **generated**                                     |
| `i18n/glossary.lotm-zh.json`              | authored - locked terminology, source of truth     |
| (the Weblate glossary itself)             | **pushed** from it - `npm run sync:glossary`       |
| `i18n/canon.sequences-zh.json`            | reference - the novel's own ladder                 |
| `i18n/zh-TW.overrides.json`               | authored - where the TW reviewer pass lands        |

So: fix UI, guide, rules and preview copy **in Weblate**. Fix pathway and ability
text **upstream in the Circle of Imagination plugin**, or in `pathways.zh-CN.json`
for the canon overlay. Fix Traditional-only wording in `zh-TW.overrides.json`.
Never edit a generated file - the next build overwrites it.

Every translatable file is JSON, including the UI strings and the guide, which
were `.ts` modules until the translation platform needed to write them in place.
`Translations` is
still derived from `en.json`, so a locale the app imports with a missing key is
still a compile error.

---

## Commands

```bash
npm run build:zh-tw       # regenerate every Traditional file (runs in `npm run build`)
npm run check:zh-tw       # CI: fail if a committed generated file is stale
npm run check:i18n        # CI: placeholders intact, identifiers untranslated
npm run sync:glossary     # push i18n/glossary.lotm-zh.json into the Weblate glossary
npm run provision:weblate # apply i18n/weblate.json to the Weblate server
npm run seed:zh           # add empty slots after the plugin exports new abilities
npm run check:canon-zh    # report where Mysterria's rungs diverge from the novel
node scripts/i18n-coverage.mjs   # translation coverage per surface
```

---

## Weblate

Self-hosted at <https://weblate.mysterria.net>, project `mysterria-website`.

`i18n/weblate.json` defines five components - UI strings, guide prose, player
rules, staff rules and link-preview copy - and `scripts/provision_weblate.py`
applies it. That file replaces `crowdin.yml`, and its `_comment` block lists what
is deliberately excluded and why. Prefer editing it and re-running the script
over changing settings in the Weblate UI, or the two drift apart silently.

Only the `ui` component names a real git URL. The other four use
`repo: weblate://mysterria-website/ui`, so all five share one clone instead of
fighting each other on push.

Two things are worth knowing before touching it.

**Traditional Chinese must never become a Weblate language.** It is generated
from Simplified, so a Weblate pull would overwrite the generated files with
translator input and silently drop the OpenCC tripwires in this directory.

**The guard is not the same one Crowdin needed, and it is easier to break.** On
Crowdin, simply not adding the language *was* the guard. Weblate does not work
that way: it discovers translations by globbing `filemask` against the
repository, and every `zh-TW.json` is committed. Left alone it imports them as
ordinary editable translations. What prevents that is `language_regex` on each
component:

```
^(?!zh[_-]TW$|zh[_-]Hant$|zh_Hant_TW$).+$
```

All three spellings are excluded because Weblate normalises Chinese codes
internally - Simplified arrives from `zh-CN.json` but is stored as `zh_Hans`. Do
not relax the regex. The backstop if someone does is `npm run check:zh-tw`, which
regenerates from `zh-CN` and fails on any committed Traditional file that does
not match; it runs in CI on every PR.

Translators work in `zh-CN`. `.github/workflows/weblate-regenerate.yml` then runs
`npm run build:zh-tw` on Weblate's own branch, so the regenerated Traditional
files are part of the pull request a human reviews rather than turning up after
they merge it. Without that step `npm run check:zh-tw` fails every Weblate PR.

**Two things a translator can break that a type error will not catch.** A
`{placeholder}` is substituted by the call site, not by `t()`, so a dropped slot
renders literal braces to a reader. And `id` / `severity` in the rules files are
identifiers the app matches on, not copy. `npm run check:i18n` guards both, over
every locale file present - including a language Weblate has landed but that is
not yet wired into `locales.json`.

That second one matters more here than it did on Crowdin: Weblate exposes **every
JSON leaf** as a translatable string, structural fields included, and it has no
per-key exclusion for JSON. The planned fix is the *Bulk edit* add-on per
component, query `key:*.id OR key:*.severity`, flag `read-only`. Until that is
in place `check:i18n` is the only thing standing between a well-meaning
translator and a rule the app can no longer match.

### Coverage is reported against English, not by key count

`node scripts/i18n-coverage.mjs` scores a string as translated only when it
**differs** from English. Files seeded by a platform export carry the source text
for untranslated strings, so counting keys that merely exist scores a brand-new
language at 100%. Weblate's own percentages have the same blind spot; use the
repository report when auditing newly seeded languages.

### Adding a language

Weblate will start writing `src/locales/es.json` and friends as soon as a target
language is added there. The app ignores them until the locale is registered, so
these can be done in either order:

Watch the **filename** Weblate picks. Crowdin needed a `languages_mapping` block
to keep its `zh-CN` from becoming something else; Weblate instead binds to files
that already exist, which is why `zh_Hans` internally still writes `zh-CN.json`.
For a language with no file yet it names the file from its own code, which may
not be the code `locales.json` expects. Commit an empty file under the name you
want first and Weblate will use it.

1. `src/assets/sources/locales.json` - the entry the whole app reads from. Check
   `pluralStyle` against the language's real rule rather than picking the nearest
   of the three that exist: Spanish, German and French are `"english"` (one/many),
   but **Romanian is none of them.** Its CLDR rule is one for `n == 1`, *few* for
   `n == 0` or `n % 100` in 2-19, other above that - so "2 locuri" and "20 de
   locuri" take different forms. Adding `ro` means adding a `"romanian"` case to
   `pluralStyle` and to the `switch` in `useI18n.ts`, not reusing `"slavic"`.
2. `src/locales/index.ts` - add to the `Language` union and the `translations` map.
3. `src/data/guideContent.ts` - add to the `guideContent` map.
4. `vercel.json` - the locale alternation in every `:lang(...)` route pattern.
5. `src/assets/css/main.css` - a font stack, if the script is not Latin. Inter,
   Playfair Display and JetBrains Mono carry no CJK glyphs.
6. `api/meta-proxy.ts` - `META_COPY`, or the locale falls back to English previews.

`npm run check:i18n` and `npm run type-check` will name anything missed in 1-3.

## How Traditional is produced

`zh-CN` → OpenCC `s2twp` (Taiwan *vocabulary* substitution, not just characters)
→ glossary overrides → reviewer overrides → `zh-TW`.

Conversion runs over whole files. Every key, id and placeholder in them is ASCII,
so OpenCC only rewrites Chinese characters and leaves structure untouched.

The converter is good but not correct. Two failures it made here, both caught and
overridden - worth re-checking after any `opencc-js` upgrade:

- **无面人 → 無麵人.** Read 面 (face) as 麵 (noodles) and renamed the Fool
  pathway's Sequence 6 to "Noodle-less Man".
- **循环 → 迴圈.** Correct for a programming loop, wrong for the dozens of
  descriptions meaning "left-click cycles modes" or "the cycle of decay", which
  want 循環.
- **权限 → 許可權** and **语音频道 → 語音訊道.** Segmentation failures: it read
  权限 as 許可+權, and found 音频 inside 语音频道 and applied the
  correct-in-isolation 音頻→音訊 (audio) mapping. Both produce non-words.
- **里克 → 裡克.** Read the currency 里克 (Lick) as 里 "inside". The three
  currencies are the novel's Intis ladder - 1 因蒂費爾 = 10 里克 = 100 科佩 -
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
single-character rule** - a bare 秘→祕 would corrupt 詭秘之主, whose Taiwan print
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
- the canon Sequence 2 name - which suggests the English drifted rather than the
Chinese being wrong.

**The clean fix is upstream**: rename these rungs to canon in the Circle of
Imagination plugin, which regenerates `pathway-abilities.json`. Until then, the
divergence is deliberate. To reverse it instead, replace the `darkness` block in
`scripts/fill-pathways-zh-names.mjs` and re-run it.

### 2. Boon pathways - resolved, 42 of 50 rungs from canon

**The ten "boon" pathways are not Mysterria inventions.** They are Outer God
(外神) routes from the novel. The 22 are the routes of the Primordial Creator
plus six inherited from Outer Gods; the Outer Gods have many more of their own, so
the real total is well above 22.

The canon was looked up rather than guessed, and the result changed the framing
entirely: **Mysterria's English boon ladders are direct translations of the canon
Chinese ones - 34 of 35 rungs line up position for position.** These were never
translation choices. Two things fell out of that:

- `Ex Saddict` is a garbled *Sex Addict* - canon 性瘾病人.
- `Patriarch` is 主父, the **Sequence 0** of 欲望母树 - exactly how English names
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

The 22 core pathways are unaffected - and were independently re-verified against a
full published ladder while doing this. All 22 matched.

### 3. Sixteen other rungs were renamed less severely

Typos (`Flithy Monarch`, `Iron-bloodied Knight`) and synonyms (`Spirit Guide` for
Mentor of Spirits, `Artisan` for Mechanical Expert) - all shipped as canon, which
is uncontroversial. See `npm run check:canon-zh`.

One is a genuine data bug: **Wheel of Fortune Sequence 5 is labelled `Lucky 1`,
duplicating Sequence 7.** Canon has 赢家 (Winner), which is what Chinese ships.
Worth fixing in the English.

### 4. `%%` in English ability descriptions

Several descriptions contain a literal `%%` (`20%%`, `35%%`) - a plugin
format-string artifact that reaches the site verbatim and renders as `20%%`.
Chinese normalizes these to a single `%`. Fixing the English is an upstream job.

### 5. Traditional vocabulary awaiting a native reader

`zh-TW.overrides.json` → `reviewCandidates` lists terms where Taiwan usage may
differ from what s2twp emits (神秘學 vs 神祕學, 獲取 vs 取得, 實現 vs 實作).
They ship as-emitted rather than guessed at. Confirm each with a TW reader, then
move it into `overrides`.

---

## What still falls back to English

Everything below renders English for Chinese readers. Nothing is broken - `t()`
and `pick()` fall back per key, so partial coverage is a valid state.

- **Legal pages** - `TermsView`, `PrivacyView` and `SLAView` have their copy
  hardcoded in the template, in English, for *every* locale including Ukrainian.
  This is a pre-existing gap rather than a Chinese one, and translating terms of
  service is a decision for whoever owns the legal text, not the i18n pass.
- **Staff-only tooling** - the admin panel, balance dashboard, and the news and
  service editors are English-only by design. They are never shown to players.
- **News articles** - authored in the CMS, which only carries en/uk. Chinese
  readers are served the English dispatch at its English URL, and hreflang
  deliberately advertises no Chinese version. Flip `articleLocale` in
  `src/locales/index.ts` once zh articles exist.
- **Ukrainian link previews** in the crawler meta-proxy - a pre-existing gap.

---

## URLs and SEO

Every page is served under a locale segment: `/en/guide`, `/zh-TW/guide`. The URL
is the source of truth for language - the router reads the segment and tells the
i18n layer, so a shared link always opens in the language it was shared in.

- `/auth/callback` stays **outside** the prefix: it is registered with Discord as
  the OAuth redirect URI and matched literally in `stores/auth.ts`.
- The bare domain negotiates language at the edge from `Accept-Language`
  (`vercel.json` → `redirects`), as a 307 with `Vary: Accept-Language`. It has to
  be temporary - a permanent redirect would let a CDN pin one visitor's language
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
from Traditional - several codepoints are drawn differently in mainland and
Taiwan fonts, and a native reader notices the wrong regional face. It also
tightens the design's wide mono letter-spacing, which reads as broken on
full-width glyphs, and drops `text-transform: uppercase`, which does nothing to
Chinese but mangles Latin brand words inside the same label.
