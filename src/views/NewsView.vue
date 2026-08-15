<template>
  <div class="news-page">
    <HeaderItem/>

    <main class="dispatch">
      <header class="dispatch-masthead">
        <p class="myst-eyebrow">{{ t('newsPage.eyebrow') }}</p>
        <h1 class="myst-h1">{{ t('newsPage.title') }}</h1>
      </header>

      <div v-if="loading" class="dispatch-state">
        <div class="dispatch-spinner" aria-hidden="true"></div>
        <p>{{ t('loadingService') }}</p>
      </div>

      <article v-else-if="article" class="dispatch-article">
        <header class="article-head">
          <div class="article-meta">
            <span class="meta-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
            <template v-if="article.isPinned">
              <span class="meta-divider" aria-hidden="true">†</span>
              <span class="meta-tag">{{ t('homePage.newsPinned') }}</span>
            </template>
          </div>
          <h2 class="article-title">{{ article.title }}</h2>
        </header>

        <div v-if="article.preview" class="article-hero">
          <img :alt="article.title" :src="article.preview">
          <span class="hero-fade" aria-hidden="true"></span>
        </div>

        <div v-dompurify-html="renderedContent" class="article-body"></div>

        <div class="article-end" aria-hidden="true">† † †</div>
      </article>

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
            :to="`/news/${entry.slug}`"
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
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {newsAPI} from '@/utils/api/news';
import type {NewsArticle, NewsPreview} from '@/types/news';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useI18n} from '@/composables/useI18n';
import MarkdownIt from 'markdown-it';
import {pathwayEmojiPlugin} from '@/utils/pathwayPlugin';
import {articleLd, breadcrumbLd, useSeo} from '@/composables/useSeo';

const route = useRoute();
const router = useRouter();
const article = ref<NewsArticle | null>(null);
const earlier = ref<NewsPreview[]>([]);
const loading = ref(true);
const {currentLanguage, setLanguage, t} = useI18n();

const md = new MarkdownIt({html: true, linkify: true, typographer: true});
md.use(pathwayEmojiPlugin);

const renderedContent = computed(() => {
  if (!article.value?.content) return article.value?.renderedContent ?? '';
  return md.render(article.value.content);
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SUPPORTED_LOCALES = new Set<'en' | 'uk'>(['en', 'uk']);

/*
 * News is the one place where a locale really does live in the URL
 * (/news/uk/:slug), so it is the one place hreflang alternates are truthful.
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
  const path = currentLanguage.value === 'uk' ? `/news/uk/${slug}` : `/news/${slug}`;
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
    alternates: {en: `/news/${slug}`, uk: `/news/uk/${slug}`},
    jsonLd: [
      articleLd({
        title: current.title,
        description,
        url: path,
        image: current.preview || undefined,
        published,
        modified: 'updatedAt' in current ? (current as { updatedAt?: string }).updatedAt : undefined,
        language: currentLanguage.value,
      }),
      breadcrumbLd([
        {name: 'Home', path: '/'},
        {name: 'News', path: '/news'},
        {name: current.title, path},
      ]),
    ],
  };
});

const resolveLanguage = () => {
  const localeParam = route.params.locale as string | undefined;
  const lang = localeParam && SUPPORTED_LOCALES.has(localeParam as 'en' | 'uk')
      ? (localeParam as 'en' | 'uk')
      : currentLanguage.value;

  if (localeParam && lang !== currentLanguage.value) setLanguage(lang);
  return lang;
};

const loadArticle = async () => {
  const slug = route.params.slug as string | undefined;
  const lang = resolveLanguage();

  loading.value = true;
  try {
    if (slug) {
      const response = await newsAPI.getBySlug(lang, slug);
      article.value = response.data;
    } else {
      // /news with no slug — open the newest dispatch.
      const latest = await newsAPI.getLatest(lang);
      const newest = [...latest.data].sort(
          (a, b) =>
              new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
      )[0];
      article.value = newest ?? null;
    }
  } catch (error) {
    console.error('Failed to fetch news article:', error);
    article.value = null;
  } finally {
    loading.value = false;
  }
};

const loadEarlier = async () => {
  const lang = resolveLanguage();
  try {
    const response = await newsAPI.getPublished(lang, {page: 0, size: 8});
    earlier.value = response.data.content
        .filter(entry => entry.slug !== article.value?.slug)
        .slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch earlier dispatches:', error);
    earlier.value = [];
  }
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
  await loadArticle();
  await loadEarlier();
  await nextTick();
  scrollToTop();
};

watch(() => route.fullPath, (next, previous) => {
  if (next !== previous) void reload();
});

watch(currentLanguage, () => {
  // A /news/:locale/:slug URL pins its own language; only the language switcher
  // should re-fetch, and that path already set currentLanguage itself.
  if (route.params.locale) return;
  void reload();
});

onMounted(reload);
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

.article-body :deep(p) {
  margin: 0 0 26px;
}

/* Playfair drop cap on the opening paragraph */
.article-body :deep(> p:first-of-type::first-letter) {
  float: left;
  padding: 8px 14px 0 0;
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
