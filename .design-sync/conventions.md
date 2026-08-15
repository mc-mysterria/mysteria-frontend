# Mysterria — how to build with this design system

Mysterria is the site for a *Lord of the Mysteries*–inspired Minecraft server: occult, ornate, gold-on-near-black. The app it comes from is Vue, so **this design system ships no components** — no `window.Mysterria.*` to import, the bundle is intentionally empty. You write your own markup and style it with the tokens and classes below. Everything here is real CSS that exists in the shipping app.

## Setup

No provider, no wrapper. Import the stylesheet and the tokens are live on `:root`.

Two themes. **Dark is the default** and is what Mysterria looks like — build dark unless asked otherwise. The light theme is opt-in by setting an attribute on the root element:

```html
<html data-theme="parchment">
```

Only those two exist; `data-theme` takes no other value.

## The look, in one paragraph

Near-black backgrounds (`--myst-bg`), one antique gold accent (`--myst-gold`) used sparingly, and a three-font split that carries the whole identity: **Playfair Display** for headings, **JetBrains Mono** in uppercase with wide letter-spacing for eyebrow labels and meta text, **Inter** for body copy. The mono eyebrow label above a Playfair heading is the signature move — use it. Gold is an accent, not a fill: hairlines, small labels, one primary button, hover borders.

## Styling idiom: CSS variables + a small utility layer

Style with `var(--myst-*)` custom properties. Write your own CSS for layout and anything the classes below don't cover — this is not Tailwind, and there is no utility for every property.

**Colour** — `--myst-bg`, `--myst-bg-2`, `--myst-ink`, `--myst-ink-muted`, `--myst-ink-strong`, `--myst-gold`, `--myst-gold-soft`, `--myst-offwhite`. Derived: `--myst-surface-panel`, `--myst-border`, `--myst-border-gold`, `--myst-border-gold-strong`, `--myst-glow-gold`.

**Type** — families `--myst-font-display`, `--myst-font-body`, `--myst-font-mono`. Sizes `--myst-text-xs` … `--myst-text-4xl` (all fluid `clamp()`). Tracking `--myst-tracking-tight|normal|wide|wider|label`. Leading `--myst-leading-tight|snug|normal|relaxed`.

**Space / shape / motion** — `--myst-space-1` … `--myst-space-12` (4px base), plus `--myst-space-responsive`, `--myst-gap-responsive`, `--myst-gutter`. Radii `--myst-radius-xs|sm|md|lg|xl|2xl|pill|circle` (`lg` = 8px is the default for cards). `--myst-transition`, `--myst-transition-fast`, `--myst-transition-slow`. Widths `--myst-container`, `--myst-container-lg`, `--myst-container-md`.

**Classes that already exist** — use these rather than restyling from scratch:

| Family | Classes |
|---|---|
| Layout | `.container`, `.container-md`, `.container-lg`, `.grid`, `.flex`, `.flex-wrap`, `.items-center`, `.justify-center`, `.justify-between`, `.gap-responsive`, `.p-responsive`, `.px-responsive`, `.m-responsive` |
| Surface | `.card`, `.bg-panel` |
| Button | `.btn`, `.btn-lg`, `.btn-primary` |
| Type | `.text-xs`, `.text-base`, `.text-lg`, `.text-xl`, `.text-4xl`, `.h1`–`.h6`, `.mystical-text` |
| Section header | `.myst-page-header`, `.myst-header-decoration`, `.myst-header-label` |
| Atmosphere | `.myst-fog`, `.fade-section` (+ `.in-view`) |
| Responsive | `.hide-mobile`, `.show-mobile`, `.hide-desktop`, `.show-desktop`, `.mobile-stack`, `.mobile-full` |

`h1`–`h6` are already Playfair Display at a fluid size — don't restate the family on a heading.

## Where the truth lives

Read `_ds/<folder>/styles.css` and the files it imports before styling: `tokens/color.css`, `tokens/typography.css`, `tokens/space.css` (every token, with the reasoning), `base.css` (element defaults), `utilities.css` (every class above, in full). `guidelines/` covers the section-header pattern and voice.

## Idiomatic snippet

```jsx
<section className="container p-responsive">
  <header className="myst-page-header">
    <span className="myst-header-decoration" />
    <p className="myst-header-label">Pathways</p>
    <span className="myst-header-decoration" />
  </header>

  <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
    <article className="card">
      <h3>The Fool</h3>
      <p style={{ color: "var(--myst-ink-muted)", lineHeight: "var(--myst-leading-relaxed)" }}>
        Sequence 0 — the pathway of secrets, divination and disguise.
      </p>
      <a className="btn btn-primary" href="#">Begin</a>
    </article>
  </div>
</section>
```

Note the mix: existing classes for the section header, card and button; a plain `style` object for the one-off grid template. That is the intended balance.
