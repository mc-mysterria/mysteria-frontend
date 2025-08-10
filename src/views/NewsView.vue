<template>
  <div class="news-page">
    <HeaderItem />
    <main class="news-article-container">
      <div v-if="article">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="publish-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
        </div>
        <div class="article-content" v-dompurify-html="article.renderedContent || renderedContent"></div>
      </div>
      <div v-else-if="loading">
        <p>Loading article...</p>
      </div>
      <div v-else>
        <p>Article not found or failed to load.</p>
      </div>
    </main>
    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { newsAPI } from '@/utils/api/news';
import type { NewsArticle } from '@/types/news';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import { useI18n } from '@/composables/useI18n';
import MarkdownIt from 'markdown-it';

const route = useRoute();
const article = ref<NewsArticle | null>(null);
const loading = ref(true);
const { currentLanguage } = useI18n();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const renderedContent = computed(() => {
  if (!article.value?.content) return '';
  return md.render(article.value.content);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
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
});
</script>

<style scoped>
/* Page layout with sticky footer */
.news-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--myst-bg);
}

.news-article-container {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 16px;
  width: 100%;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--myst-ink-strong);
  line-height: 1.2;
}

.article-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--myst-ink-muted);
  opacity: 0.6;
}

.publish-date {
  color: var(--myst-ink-muted);
  font-size: 0.875rem;
}

.article-content {
  line-height: 1.75;
  color: var(--myst-ink);
}

/* Headings */
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--myst-ink-strong);
}

.article-content :deep(h1) {
  font-size: 2.25rem;
  color: var(--myst-gold);
}

.article-content :deep(h2) {
  font-size: 1.875rem;
}

.article-content :deep(h3) {
  font-size: 1.5rem;
}

/* Text elements */
.article-content :deep(p) {
  margin-bottom: 1.5rem;
  color: var(--myst-ink);
}

.article-content :deep(strong) {
  color: var(--myst-ink-strong);
  font-weight: 600;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  color: var(--myst-ink);
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
}

/* Blockquotes */
.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--myst-gold);
  background-color: var(--myst-bg-2);
  font-style: italic;
  color: var(--myst-ink-muted);
}

/* Code elements */
.article-content :deep(code) {
  background-color: var(--myst-bg-2);
  color: var(--myst-gold);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid var(--myst-ink-muted);
  opacity: 0.8;
}

.article-content :deep(pre) {
  background-color: var(--myst-bg-2);
  color: var(--myst-ink);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid var(--myst-ink-muted);
  opacity: 0.9;
}

.article-content :deep(pre code) {
  background-color: transparent;
  border: none;
  padding: 0;
  color: var(--myst-ink);
}

/* Links */
.article-content :deep(a) {
  color: var(--myst-gold);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.article-content :deep(a:hover) {
  color: var(--myst-gold-soft);
}

/* Images */
.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Tables */
.article-content :deep(table) {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: collapse;
  background-color: var(--myst-bg-2);
  border-radius: 0.5rem;
  overflow: hidden;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--myst-ink-muted);
  opacity: 0.8;
}

.article-content :deep(th) {
  font-weight: 600;
  background-color: var(--myst-bg);
  color: var(--myst-gold);
}

.article-content :deep(td) {
  color: var(--myst-ink);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .news-article-container {
    padding: 20px 16px;
  }
  
  .article-title {
    font-size: 2rem;
  }
  
  .article-content :deep(h1) {
    font-size: 1.875rem;
  }
  
  .article-content :deep(h2) {
    font-size: 1.5rem;
  }
}
</style>
