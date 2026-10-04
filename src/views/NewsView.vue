<template>
  <div class="news-page">
    <HeaderItem/>
    <ContentLanguageNotice/>

    <main class="dispatch">
      <header class="dispatch-masthead">
        <p class="myst-eyebrow">{{ t('newsPage.eyebrow') }}</p>
        <h1 class="myst-h1">{{ t('newsPage.title') }}</h1>
      </header>

      <div v-if="loading" class="dispatch-state">
        <div class="dispatch-spinner" aria-hidden="true"></div>
        <p>{{ t('loadingService') }}</p>
      </div>

      <template v-else-if="article">
        <!--
          The contents dock is position: fixed, so it never takes part in the
          article's layout - the column stays exactly where it sits without one.
        -->
        <aside v-if="toc.length > 2" :class="['toc-dock', {open: tocOpen}]">
          <button
              :aria-expanded="tocOpen"
              aria-controls="article-toc"
              class="toc-toggle"
              type="button"
              @click="setTocOpen(!tocOpen)"
          >
            <i aria-hidden="true" class="fa-solid fa-list"></i>
            <span>{{ t('newsPage.contents') }}</span>
            <!--
              One glyph, rotated per state. The icon subset in scripts/build-fontawesome-subset.mjs
              only collects literal `fa-solid fa-<name>` pairs, so a chevron chosen in a
              binding would be dropped from the font.
            -->
            <i aria-hidden="true" class="fa-solid fa-chevron-down toggle-caret"></i>
          </button>

          <div v-show="tocOpen" id="article-toc" class="toc-panel">
            <ArticleToc :active-id="activeHeading" :entries="toc" :label="t('newsPage.contents')"
                        @select="goToHeading"/>
          </div>
        </aside>

        <article class="dispatch-article">
          <header class="article-head">
            <div class="article-meta">
              <span class="meta-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
              <template v-if="article.isPinned">
                <span class="meta-divider" aria-hidden="true">†</span>
                <span class="meta-tag">{{ t('homePage.newsPinned') }}</span>
              </template>
            </div>
            <h2 class="article-title">{{ article.title }}</h2>

            <div v-if="article.author" class="article-byline">
              <UserAvatar :nickname="article.author.nickname" :src="article.author.avatarUrl ?? undefined" size="xs"/>
              <span>{{ t('newsPage.writtenBy') }} <strong>{{ article.author.nickname }}</strong></span>
            </div>
          </header>

          <div v-if="article.preview" class="article-hero">
            <img :alt="article.title" :src="article.preview">
            <span class="hero-fade" aria-hidden="true"></span>
          </div>

          <div v-dompurify-html="renderedContent" class="article-body"></div>

          <div class="article-end" aria-hidden="true">† † †</div>
        </article>
      </template>

      <div v-else class="dispatch-state">
        <p>{{ t('newsPage.notFound') }}</p>
        <button class="myst-btn-outline" type="button" @click="goBack">{{ t('goBack') }}</button>
      </div>

      <section v-if="earlier.length" class="earlier">
        <div class="earlier-head">
          <h3>{{ t('newsPage.earlier') }}</h3>
          <span class="earlier-note">{{ t('newsPage.season') }}</span>
        </div>

        <RouterLink
            v-for="entry in earlier"
            :key="entry.id"
            class="earlier-row"
            :to="$lp(`/news/${entry.slug}`)"
        >
          <span class="earlier-date">{{ formatDate(entry.publishedAt) }}</span>
          <span class="earlier-copy">
            <strong>{{ entry.title }}</strong>
            <p v-if="entry.shortDescription">{{ entry.shortDescription }}</p>
          </span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </RouterLink>
      </section>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {newsAPI} from '@/utils/api/news';
import type {NewsArticle, NewsPreview} from '@/types/news';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import ContentLanguageNotice from '@/components/ui/ContentLanguageNotice.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import UserAvatar from '@/components/ui/UserAvatar.vue';
import ArticleToc from '@/components/ui/ArticleToc.vue';
import {useI18n} from '@/composables/useI18n';
import {localePath} from '@/composables/useLocalePath';
import {ARTICLE_LOCALES, type ArticleLocale, hasOwnArticles, LANGUAGES} from '@/locales';
import MarkdownIt from 'markdown-it';
import {pathwayEmojiPlugin} from '@/utils/pathwayPlugin';
import {tocPlugin, type TocEntry} from '@/utils/articleToc';
import {articleLd, breadcrumbLd, useSeo} from '@/composables/useSeo';

const route = useRoute();
const router = useRouter();
const article = ref<NewsArticle | null>(null);
const earlier = ref<NewsPreview[]>([]);
const loading = ref(true);
const {currentLanguage, intlLocale, locale, t} = useI18n();

const md = new MarkdownIt({html: true, linkify: true, typographer: true});
md.use(pathwayEmojiPlugin);
md.use(tocPlugin);

const activeHeading = ref<string | null>(null);

/*
 * Rendering also collects the table of contents, so the two can never disagree -
 * the ids in the HTML and the ids in the rail come out of the same pass, which is
 * why they are one computed rather than two.
 *
 * An article served only as pre-rendered HTML (no markdown source) gets no TOC,
 * because nothing stamped ids on its headings.
 */
const rendered = computed(() => {
  if (!article.value?.content) {
    return {html: article.value?.renderedContent ?? '', toc: [] as TocEntry[]};
  }

  const env: { toc?: TocEntry[] } = {};
  const html = md.render(article.value.content, env);
  return {html, toc: env.toc ?? []};
});

const renderedContent = computed(() => rendered.value.html);
const toc = computed(() => rendered.value.toc);

/*
 * Where the dock sits, and therefore whether it may be open by default.
 *
 * Above this width there is room in the page margin beside the 940px column, so
 * the panel can stand open without covering anything. Below it the panel is an
 * overlay, so it starts closed and the reader opens it when they want it.
 */
const WIDE_DOCK = '(min-width: 1440px)';
const TOC_PREF_KEY = 'news-toc-open';

const tocOpen = ref(false);

/** localStorage throws in some privacy modes; a contents panel is not worth an error. */
const readTocPref = (): boolean | null => {
  try {
    const stored = window.localStorage.getItem(TOC_PREF_KEY);
    return stored === null ? null : stored === '1';
  } catch {
    return null;
  }
};

const setTocOpen = (open: boolean) => {
  tocOpen.value = open;
  try {
    // Only an explicit choice is stored, so a reader who never touches the
    // toggle keeps following the width default instead of being pinned to
    // whatever the first page they opened happened to show.
    window.localStorage.setItem(TOC_PREF_KEY, open ? '1' : '0');
  } catch {
    /* ignore - the preference simply does not persist */
  }
};

const wideDock = window.matchMedia(WIDE_DOCK);

/*
 * An explicit choice always wins; without one the dock follows the width, which
 * is why this is re-run when the breakpoint is crossed rather than only on mount.
 */
const applyTocPreference = () => {
  tocOpen.value = readTocPref() ?? wideDock.matches;
};

/** Distance from the viewport top that counts as "the reader is here". */
const headingOffset = () => {
  const header = getComputedStyle(document.documentElement).getPropertyValue('--myst-header-height');
  return (parseInt(header, 10) || 68) + 32;
};

const goToHeading = (id: string) => {
  // scroll-margin-top on the headings keeps them clear of the fixed header. The
  // behaviour is chosen in JS, so the global reduced-motion rule in main.css -
  // which only reaches CSS-driven scrolling - has to be honoured here too.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});

  // Narrow screens show the panel over the article, so get it out of the way of
  // the section the reader just asked for. The margin rail stays put.
  if (!wideDock.matches) tocOpen.value = false;
};

/*
 * Scroll spy. A rAF-throttled scroll listener rather than an IntersectionObserver:
 * "the last heading the reader has passed" is a single comparison against the
 * header offset, where an observer would need per-heading rootMargin bookkeeping
 * and still misreport sections shorter than the viewport.
 */
let spyQueued = false;

const syncActiveHeading = () => {
  spyQueued = false;
  if (!toc.value.length) return;

  const limit = headingOffset();
  // Null until the first heading is passed, so nothing is highlighted while the
  // reader is still on the title and the hero image.
  let current: string | null = null;

  for (const entry of toc.value) {
    const element = document.getElementById(entry.id);
    if (element && element.getBoundingClientRect().top <= limit) {
      current = entry.id;
    }
  }

  activeHeading.value = current;
};

const onScroll = () => {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(syncActiveHeading);
};

/*
 * Keep the highlighted entry inside the panel's own scrollport on a long article,
 * where the list is taller than the dock. Done by hand rather than with
 * scrollIntoView, which would also scroll the window and fight the reader.
 */
watch(activeHeading, () => {
  if (!tocOpen.value) return;

  const panel = document.getElementById('article-toc');
  const link = panel?.querySelector<HTMLElement>('.toc-item.active a');
  if (!panel || !link) return;

  const panelBox = panel.getBoundingClientRect();
  const linkBox = link.getBoundingClientRect();

  if (linkBox.top < panelBox.top) {
    panel.scrollTop -= panelBox.top - linkBox.top + 8;
  } else if (linkBox.bottom > panelBox.bottom) {
    panel.scrollTop += linkBox.bottom - panelBox.bottom + 8;
  }
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(intlLocale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SUPPORTED_LOCALES = new Set<string>(ARTICLE_LOCALES);

/*
 * Articles are authored in the CMS in English and Ukrainian only, so a Chinese
 * reader is served the English text. The canonical URL therefore points at the
 * article's own language (/en/news/:slug), not at the reader's locale - two
 * URLs showing the same English article would otherwise compete as duplicates.
 * hreflang advertises only the locales the article genuinely exists in.
 */
useSeo(() => {
  const current = article.value;
  if (!current) {
    return {
      title: t('newsPage.title'),
      description: 'Patch notes, season announcements and dispatches from Mysterria, the Lord of the Mysteries Minecraft server.',
      path: '/news',
      jsonLd: [breadcrumbLd([{name: 'Home', path: '/'}, {name: 'News', path: '/news'}])],
    };
  }

  const slug = current.slug;
  const articleLanguage = locale.value.articleLocale;
  const path = localePath(`/news/${slug}`, articleLanguage);
  const published = 'publishedAt' in current ? current.publishedAt : undefined;
  const description = current.shortDescription || current.title;

  return {
    title: current.title,
    description,
    path,
    type: 'article' as const,
    image: current.preview || undefined,
    imageAlt: current.title,
    publishedTime: published,
    modifiedTime: 'updatedAt' in current ? (current as { updatedAt?: string }).updatedAt : undefined,
    /*
     * A locale is advertised only if it has its own edition. Chinese readers are
     * served the English text, so claiming a Chinese alternate would point Google
     * at an English page under a Chinese hreflang. Derived from articleLocale so
     * that giving a locale its own articles needs no edit here.
     */
    alternates: Object.fromEntries(LANGUAGES.map(language => [
      language,
      hasOwnArticles(language) ? localePath(`/news/${slug}`, language) : null,
    ])),
    jsonLd: [
      articleLd({
        title: current.title,
        description,
        url: path,
        image: current.preview || undefined,
        published,
        modified: 'updatedAt' in current ? (current as { updatedAt?: string }).updatedAt : undefined,
        language: locale.value.articleLocale,
      }),
      breadcrumbLd([
        {name: 'Home', path: '/'},
        {name: 'News', path: '/news'},
        {name: current.title, path},
      ]),
    ],
  };
});

/*
 * Which language to request the article in. A legacy /news/:locale/:slug URL
 * pins it explicitly; otherwise it follows from the reader's locale. This no
 * longer changes the site language - that is owned by the URL's locale segment.
 */
const resolveArticleLocale = (): ArticleLocale => {
  const localeParam = route.params.locale as string | undefined;
  if (localeParam && SUPPORTED_LOCALES.has(localeParam)) {
    return localeParam as ArticleLocale;
  }
  return locale.value.articleLocale;
};

const byFeatured = (a: NewsPreview, b: NewsPreview) =>
    Number(b.isPinned ?? false) - Number(a.isPinned ?? false) ||
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

const loadNews = async () => {
  const slug = route.params.slug as string | undefined;
  const lang = resolveArticleLocale();

  loading.value = true;

  const entriesRequest = newsAPI.getPublished(lang, {page: 0, size: 8})
      .then(response => [...response.data.content].sort(byFeatured))
      .catch(error => {
        console.error('Failed to fetch earlier dispatches:', error);
        return [] as NewsPreview[];
      });

  const articleRequest = (slug
      ? newsAPI.getBySlug(lang, slug).then(response => response.data)
      : entriesRequest.then(entries => {
        const featured = entries[0];
        return featured ? newsAPI.getBySlug(lang, featured.slug).then(response => response.data) : null;
      }))
      .catch(error => {
        console.error('Failed to fetch news article:', error);
        return null;
      });

  const [entries, current] = await Promise.all([entriesRequest, articleRequest]);

  article.value = current;
  earlier.value = entries.filter(entry => entry.slug !== current?.slug).slice(0, 5);
  loading.value = false;
};

const scrollToTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
};

const goBack = () => router.back();

const reload = async () => {
  scrollToTop();
  await loadNews();
  await nextTick();
  scrollToTop();
  syncActiveHeading();
};

watch(() => route.fullPath, (next, previous) => {
  if (next !== previous) void reload();
});

watch(currentLanguage, () => {
  // A legacy /news/:locale/:slug URL pins the article language, so switching the
  // site language cannot change which article is shown.
  if (route.params.locale) return;
  void reload();
});

onMounted(async () => {
  applyTocPreference();
  wideDock.addEventListener('change', applyTocPreference);
  window.addEventListener('scroll', onScroll, {passive: true});
  await reload();
});

onBeforeUnmount(() => {
  wideDock.removeEventListener('change', applyTocPreference);
  window.removeEventListener('scroll', onScroll);
});
</script>

<style scoped>
.news-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.dispatch {
  flex: 1 0 auto;
  width: 100%;
  max-width: 940px;
  margin: 0 auto;
  padding: 80px 24px 90px;
}

.dispatch-masthead {
  margin-bottom: 64px;
  text-align: center;
}

.dispatch-masthead .myst-eyebrow {
  margin-bottom: 14px;
}

/*
 * Contents dock.
 *
 * Fixed, never in flow: the article column keeps the exact width and position it
 * has on an article with no headings at all, so opening or closing the dock moves
 * no text and no images.
 *
 * Under 1420px it is a floating button in the bottom-right whose panel opens over
 * the page; at 1420px and up there is room beside the 940px column, so it moves
 * into the page margin and stands open.
 */
.toc-dock {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  width: min(280px, calc(100vw - 36px));
}

.toc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  border: 1px solid var(--myst-line-28);
  background: var(--myst-panel-strong);
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: border-color 0.18s ease, color 0.18s ease;
}

.toc-toggle:hover,
.toc-toggle:focus-visible {
  border-color: var(--myst-line-55);
  color: var(--myst-offwhite);
}

.toc-toggle .toggle-caret {
  font-size: 9px;
  opacity: 0.6;
  /* Closed, the bottom dock opens upwards - so the caret points the way it will go. */
  transform: rotate(180deg);
  transition: transform 0.18s ease;
}

.toc-dock.open .toggle-caret {
  transform: rotate(0deg);
}

.toc-panel {
  order: -1; /* panel above the button while the dock hangs off the bottom edge */
  width: 100%;
  max-height: min(58vh, 420px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 18px;
  border: 1px solid var(--myst-line-20);
  background: var(--myst-panel-strong);
  backdrop-filter: blur(8px);
}

/*
 * The margin rail only turns on where it genuinely fits beside the column:
 * 470 (half of 940) + 20 gutter + 210 rail + 20 viewport margin = 720 a side,
 * so 1440px is the narrowest viewport that holds it without clipping.
 */
@media (min-width: 1440px) {
  .toc-dock {
    left: calc(50% + 490px);
    right: auto;
    top: calc(var(--myst-header-height) + 36px);
    bottom: auto;
    width: 210px;
    align-items: stretch;
    gap: 14px;
  }

  .toc-toggle {
    justify-content: space-between;
    padding: 0 0 10px;
    border: none;
    border-bottom: 1px solid var(--myst-line-14);
    background: none;
    backdrop-filter: none;
  }

  /* In the margin the panel sits below the button, so the caret points the other way. */
  .toc-toggle .toggle-caret {
    transform: rotate(0deg);
  }

  .toc-dock.open .toggle-caret {
    transform: rotate(180deg);
  }

  .toc-panel {
    order: 0;
    max-height: calc(100vh - var(--myst-header-height) - 150px);
    padding: 0;
    border: none;
    background: none;
    backdrop-filter: none;
  }
}

/* The dock overlaps the text at narrow widths, so give it somewhere to hide. */
@media (max-width: 520px) {
  .toc-dock {
    right: 12px;
    bottom: 12px;
    width: calc(100vw - 24px);
  }
}

/* Byline */
.article-byline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 22px;
  font-size: 13px;
  color: var(--myst-ink-muted);
}

.article-byline strong {
  color: var(--myst-offwhite);
  font-weight: 600;
}

/* Article */
.article-head {
  margin-bottom: 52px;
  text-align: center;
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}

.meta-date,
.meta-tag {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.meta-date {
  color: var(--myst-gold);
}

.meta-tag {
  color: var(--myst-ink-muted);
}

.meta-divider {
  color: var(--myst-line-35);
}

.article-title {
  margin: 0 auto;
  max-width: 20ch;
  font-family: var(--myst-font-display);
  font-size: clamp(30px, 4.4vw, 50px);
  font-weight: 800;
  line-height: 1.1;
  color: var(--myst-offwhite);
}

.article-hero {
  position: relative;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  border: 1px solid var(--myst-line-20);
  margin-bottom: 52px;
}

.article-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.85);
}

.hero-fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(5, 7, 10, 0.5), transparent 50%);
}

.article-body {
  max-width: 680px;
  margin: 0 auto;
  font-size: 17.5px;
  line-height: 1.85;
  color: #c9c9cf;
}

/*
 * Wide viewports leave a deep empty gutter either side of the reading measure,
 * which reads as wasted once the contents dock occupies the right margin. The
 * prose widens a little; tables, which carry far more than a line of prose does,
 * break out to the full column.
 *
 * 76px is where that breakout comes from: the column's usable width is 892px
 * (940 max-width less 2x24 padding), so (892 - 740) / 2 a side.
 */
@media (min-width: 1200px) {
  .article-body {
    max-width: 740px;
  }
}

.article-body :deep(p) {
  margin: 0 0 26px;
}

/* Playfair drop cap on the opening paragraph */
/*
 * Drop cap, sized and placed against the body's own metrics rather than by eye:
 * at 17.5px/1.85 a line box is 32.375px, and Playfair's cap height of ~0.70em at
 * 64px is 44.8px - near enough two lines of cap-to-baseline (45.7px) to read as a
 * proper two-line drop cap.
 *
 * The padding is what seats it. line-height 0.82 makes the letter's ink overflow
 * its own box symmetrically, so the top padding is the only thing deciding where
 * the glyph lands; at the previous 8px the cap top sat ~6px under the first
 * line's cap and the foot ~5px under the second line's baseline, which is the
 * "floating too low" look. 2px puts both within a pixel.
 */
.article-body :deep(> p:first-of-type::first-letter) {
  float: left;
  padding: 2px 14px 0 0;
  font-family: var(--myst-font-display);
  font-size: 64px;
  line-height: 0.82;
  color: var(--myst-gold);
}

.article-body :deep(h2),
.article-body :deep(h3) {
  margin: 48px 0 18px;
  font-family: var(--myst-font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--myst-offwhite);
  /* Clears the fixed header when a contents link jumps to a section */
  scroll-margin-top: calc(var(--myst-header-height) + 28px);
}

/* Subordinate to h2, matching how the contents rail nests them */
.article-body :deep(h3) {
  margin-top: 36px;
  font-size: 20px;
}

.article-body :deep(strong) {
  color: var(--myst-gold);
  font-weight: 600;
}

.article-body :deep(blockquote) {
  margin: 44px 0;
  padding: 6px 0 6px 32px;
  border-left: 2px solid var(--myst-gold);
  font-family: var(--myst-font-display);
  font-style: italic;
  font-size: 21px;
  line-height: 1.6;
  color: rgba(247, 245, 239, 0.75);
}

.article-body :deep(code) {
  padding: 2px 9px;
  background: rgba(200, 178, 115, 0.08);
  border: 1px solid var(--myst-line-18);
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 0.85em;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 0 0 26px;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-body :deep(li) {
  position: relative;
  padding-left: 28px;
}

.article-body :deep(li)::before {
  content: '†';
  position: absolute;
  left: 0;
  color: var(--myst-gold);
}

.article-body :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 40px auto;
  display: block;
  border: 1px solid var(--myst-line-12);
}

.article-body :deep(img.pathway-emoji) {
  display: inline;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
  margin: 0 0.1em;
  border: none;
}

.article-body :deep(table) {
  width: 100%;
  margin: 40px 0;
  border-collapse: collapse;
  font-size: 0.9em;
}

/*
 * A table carries far more per line than prose does, so it breaks out of the
 * reading measure to the full column: 892px usable (940 max-width less 2x24
 * padding) against a 740px measure is 76px a side.
 *
 * This has to sit after the rule above rather than beside the max-width that
 * defines it - same specificity, so source order decides.
 */
@media (min-width: 1200px) {
  .article-body :deep(table) {
    width: calc(100% + 152px);
    margin-left: -76px;
  }
}

.article-body :deep(th),
.article-body :deep(td) {
  padding: 12px 18px;
  border: 1px solid var(--myst-line-12);
  text-align: left;
}

.article-body :deep(th) {
  background: rgba(200, 178, 115, 0.05);
  color: var(--myst-gold);
  font-family: var(--myst-font-mono);
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.article-end {
  margin-top: 64px;
  text-align: center;
  font-family: var(--myst-font-display);
  font-size: 22px;
  letter-spacing: 10px;
  color: var(--myst-gold);
  opacity: 0.35;
}

/* Earlier dispatches */
.earlier {
  margin-top: 90px;
  padding-top: 44px;
  border-top: 1px solid var(--myst-line-20);
}

.earlier-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.earlier-head h3 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.earlier-note {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.earlier-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 28px;
  align-items: baseline;
  padding: 24px 0;
  border-bottom: 1px solid var(--myst-line-10);
  color: inherit;
  transition: background 0.25s ease;
}

.earlier-row:hover {
  background: rgba(200, 178, 115, 0.02);
  color: inherit;
}

.earlier-date {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.earlier-copy strong {
  color: var(--myst-offwhite);
  font-size: 17px;
  font-weight: 700;
}

.earlier-copy p {
  margin: 7px 0 0;
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  line-height: 1.6;
}

.earlier-row > i {
  color: rgba(200, 178, 115, 0.4);
  font-size: 12px;
}

/* States */
.dispatch-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  min-height: 320px;
  color: var(--myst-ink-muted);
  font-family: var(--myst-font-mono);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  text-align: center;
}

.dispatch-spinner {
  width: 34px;
  height: 34px;
  border: 2px solid var(--myst-line-20);
  border-top-color: var(--myst-gold);
  border-radius: 50%;
  animation: dispatchSpin 0.9s linear infinite;
}

@keyframes dispatchSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .dispatch {
    padding: 50px 20px 70px;
  }

  .dispatch-masthead {
    margin-bottom: 40px;
  }

  .article-body {
    font-size: 16.5px;
  }

  .earlier-row {
    grid-template-columns: 1fr auto;
    gap: 10px 16px;
  }

  .earlier-date {
    grid-column: 1 / -1;
  }
}
</style>
