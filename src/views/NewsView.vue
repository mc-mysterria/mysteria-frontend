<template>
  <div class="min-h-screen relative">
    <HeaderItem />
    <div class="news-article-container">
      <div v-if="article">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="publish-date">{{ formatDate(article.publishedAt || article.createdAt) }}</span>
        </div>
        <div class="article-content">
          <div v-if="article.renderedContent" v-dompurify-html="article.renderedContent"></div>
          <div v-else-if="renderedContent" v-dompurify-html="renderedContent"></div>
          <div v-else>
            <p>Debug: No rendered content available</p>
            <p>article.renderedContent: {{ !!article.renderedContent }}</p>
            <p>renderedContent: {{ !!renderedContent }}</p>
            <p>article.content: {{ !!article.content }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="loading">
        <p>Loading article...</p>
      </div>
      <div v-else>
        <p>Article not found or failed to load.</p>
      </div>
    </div>
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
  console.log("Computing rendered content. Article:", article.value);
  if (!article.value?.content) {
    console.log("No content found");
    return '';
  }
  console.log("Content:", article.value.content);
  const rendered = md.render(article.value.content);
  console.log("Rendered:", rendered);
  return rendered;
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
      console.log("Article response:", response.data);
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
.news-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 16px;
}

.article-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
  line-height: 1.2;
}

.article-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.publish-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.article-content {
  line-height: 1.75;
  color: #374151;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.article-content :deep(h1) {
  font-size: 2.25rem;
}

.article-content :deep(h2) {
  font-size: 1.875rem;
}

.article-content :deep(h3) {
  font-size: 1.5rem;
}

.article-content :deep(p) {
  margin-bottom: 1.5rem;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
}

.article-content :deep(blockquote) {
  margin: 2rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #d1d5db;
  background-color: #f9fafb;
  font-style: italic;
}

.article-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.article-content :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.article-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.article-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.article-content :deep(a:hover) {
  color: #2563eb;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
}

.article-content :deep(table) {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: collapse;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.article-content :deep(th) {
  font-weight: 600;
  background-color: #f9fafb;
}
</style>
