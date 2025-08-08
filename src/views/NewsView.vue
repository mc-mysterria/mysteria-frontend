<template>
  <div class="min-h-screen relative">
    <HeaderItem />
    <div class="news-article-container">
      <div v-if="article">
        <h1>{{ article.title }}</h1>
        <p>{{ article.content }}</p>
      </div>
      <div v-else>
        <p>Loading article...</p>
      </div>
    </div>
    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { newsAPI } from '@/utils/api/news';
import type { NewsArticle } from '@/types/news';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import { useI18n } from '@/composables/useI18n';

const route = useRoute();
const article = ref<NewsArticle | null>(null);
const { currentLanguage } = useI18n();

onMounted(async () => {
  const slug = route.params.slug as string;
  if (slug) {
    try {
      const response = await newsAPI.getBySlug(currentLanguage.value, slug);
      article.value = response.data;
    } catch (error) {
      console.error('Failed to fetch news article:', error);
    }
  }
});
</script>

<style scoped>
.news-article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 16px;
}
</style>
