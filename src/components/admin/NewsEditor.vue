<template>
  <div>
    <h2>News Editor</h2>
    <select v-model="selectedArticleId" @change="loadArticle">
      <option value="">Select an article to edit</option>
      <option v-for="article in articles" :key="article.id" :value="article.id">
        {{ article.title }}
      </option>
    </select>
    <button @click="createNewArticle">New Article</button>
    <div v-if="selectedArticle">
      <input v-model="selectedArticle.title" placeholder="Title"/>
      <textarea v-model="selectedArticle.content" placeholder="Content (Markdown)"></textarea>
      <button @click="saveArticle">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {newsAPI} from '@/utils/api/news';
import type {NewsArticle} from '@/types/news';

const articles = ref<NewsArticle[]>([]);
const selectedArticleId = ref<number | string>('');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectedArticle = ref<any>(null);

onMounted(async () => {
  const response = await newsAPI.getAllAdmin();
  articles.value = response.data.content;
});

const loadArticle = () => {
  if (selectedArticleId.value) {
    selectedArticle.value = articles.value.find(a => a.id === selectedArticleId.value) || null;
  } else {
    selectedArticle.value = null;
  }
};

const createNewArticle = () => {
  selectedArticleId.value = '';
  selectedArticle.value = {
    id: 0, // 0 for a new article
    title: '',
    content: '',
    createdAt: '',
    updatedAt: '',
  };
};

const saveArticle = async () => {
  if (selectedArticle.value) {
    try {
      if (selectedArticle.value.id) {
        await newsAPI.update(selectedArticle.value.id, selectedArticle.value);
      } else {
        await newsAPI.create(selectedArticle.value);
      }
      // Refresh the list
      const response = await newsAPI.getAllAdmin();
      articles.value = response.data.content;
      alert('Article saved!');
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article');
    }
  }
};
</script>
