<template>
  <div class="news-ritual-page page-container">
    <HeaderItem/>
    <main class="news-article-ritual">
      <div v-if="article" class="article-ritual-box">
        <!-- Navigation -->
        <div class="article-ritual-nav">
          <button class="btn-ritual-back" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            <span>{{ t('goBack') }}</span>
          </button>
        </div>

        <!-- Header -->
        <header class="article-ritual-header">
          <div class="article-ritual-meta">
            <span class="ritual-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
            <div class="ritual-header-line"></div>
          </div>
          <h1 class="article-ritual-title">{{ article.title }}</h1>
        </header>

        <!-- Content -->
        <div v-dompurify-html="renderedContent" class="article-ritual-content"></div>

        <!-- Footer -->
        <footer class="article-ritual-footer">
          <div class="ritual-end-mark">† † †</div>
        </footer>
      </div>

      <!-- Loading / Error -->
      <div v-else-if="loading" class="ritual-loading-area">
        <div class="ritual-spinner"></div>
        <p>{{ t('loadingService') || 'Invoking the archives...' }}</p>
      </div>
      <div v-else class="ritual-error-area">
        <p>Registry entry not found or restricted.</p>
        <button class="btn-ritual-back" @click="goBack">RECOVER</button>
      </div>
    </main>
    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {newsAPI} from '@/utils/api/news';
import type {NewsArticle} from '@/types/news';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useI18n} from '@/composables/useI18n';
import MarkdownIt from 'markdown-it';
import {pathwayEmojiPlugin} from '@/utils/pathwayPlugin';

const route = useRoute();
const router = useRouter();
const article = ref<NewsArticle | null>(null);
const loading = ref(true);
const {currentLanguage, t} = useI18n();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
md.use(pathwayEmojiPlugin);

const renderedContent = computed(() => {
  if (!article.value?.content) return article.value?.renderedContent ?? '';
  return md.render(article.value.content);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const loadArticle = async () => {
  const slug = route.params.slug as string;
  if (slug) {
    try {
      loading.value = true;
      const response = await newsAPI.getBySlug(currentLanguage.value, slug);
      article.value = response.data;
    } catch (error) {
      console.error('Failed to fetch news article:', error);
      article.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
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

watch(() => route.params.slug, async (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    scrollToTop();
    await loadArticle();
    await nextTick();
    scrollToTop();
  }
}, {immediate: false});

onMounted(async () => {
  scrollToTop();
  await loadArticle();
  await nextTick();
  scrollToTop();
});
</script>

<style scoped>
.news-ritual-page { background-color: #05070a; min-height: 100vh; display: flex; flex-direction: column; }

.news-article-ritual {
  flex: 1; max-width: 900px; margin: 0 auto;
  padding: 120px 24px 80px; width: 100%;
}

.article-ritual-box { position: relative; }

.article-ritual-nav { margin-bottom: 48px; }

.btn-ritual-back {
  background: transparent; border: 1px solid rgba(255, 255, 255, 0.1);
  color: #666; padding: 10px 24px; cursor: pointer;
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s;
}

.btn-ritual-back:hover { color: var(--myst-gold); border-color: var(--myst-gold); transform: translateX(-4px); }

.article-ritual-header { margin-bottom: 60px; text-align: center; }

.article-ritual-meta {
  display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 24px;
}

.ritual-date {
  font-family: 'JetBrains Mono', monospace; font-size: 13px;
  color: var(--myst-gold); text-transform: uppercase; letter-spacing: 4px;
}

.ritual-header-line { width: 40px; height: 1px; background: var(--myst-gold); opacity: 0.4; }

.article-ritual-title {
  font-family: 'Playfair Display', serif; font-size: clamp(2.5rem, 5vw, 4rem);
  color: #fff; line-height: 1.1; font-weight: 800; margin: 0;
}

.article-ritual-content {
  line-height: 1.8; color: #ccc; font-size: 18px;
}

/* Content Styles */
.article-ritual-content :deep(p) { margin-bottom: 24px; }
.article-ritual-content :deep(h2), .article-ritual-content :deep(h3) {
  font-family: 'Playfair Display', serif; color: #fff; margin: 48px 0 20px;
}
.article-ritual-content :deep(strong) { color: var(--myst-gold); font-weight: 700; }

.article-ritual-content :deep(img.pathway-emoji) {
  display: inline;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
  margin: 0 0.1em;
  border: none;
  transform: none;
  box-shadow: none;
  opacity: 1;
}

.article-ritual-content :deep(blockquote) {
  margin: 40px 0; padding: 24px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 2px solid var(--myst-gold);
  font-style: italic; color: #888;
}

.article-ritual-content :deep(img) {
  max-width: 100%; height: auto; margin: 40px auto; display: block;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.article-ritual-content :deep(code) {
  background: rgba(255, 255, 255, 0.05); color: var(--myst-gold);
  padding: 2px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em;
}

.article-ritual-footer { margin-top: 80px; text-align: center; }
.ritual-end-mark { font-family: 'Playfair Display', serif; color: var(--myst-gold); font-size: 24px; letter-spacing: 8px; opacity: 0.3; }

.ritual-loading-area, .ritual-error-area {
  min-height: 400px; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 24px; color: #444; font-family: 'JetBrains Mono', monospace;
}

.ritual-spinner {
  width: 40px; height: 40px; border: 2px solid rgba(200, 178, 115, 0.1);
  border-top-color: var(--myst-gold); border-radius: 50%; animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .news-article-ritual { padding-top: 100px; }
  .article-ritual-title { font-size: 2rem; }
}
</style>
