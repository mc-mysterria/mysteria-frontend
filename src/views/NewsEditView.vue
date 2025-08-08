<template>
  <div class="editor-view">
    <h2>News Editor</h2>
    
    <div class="controls">
      <select v-model="selectedArticleId" @change="loadArticle">
        <option value="">Select an article to edit</option>
        <option v-for="article in articles" :key="article.id" :value="article.id">
          {{ article.title }} ({{ article.language }})
        </option>
      </select>
      <button @click="createNewArticle">New Article</button>
      <button v-if="selectedArticle && selectedArticle.id" @click="deleteArticle" class="delete-btn">
        Delete Article
      </button>
    </div>

    <div v-if="selectedArticle" class="editor-form">
      <div class="form-group">
        <label>Title</label>
        <input v-model="selectedArticle.title" placeholder="Title" required />
      </div>

      <div class="form-group">
        <label>Slug</label>
        <input v-model="selectedArticle.slug" placeholder="article-slug" required />
        <small>URL-friendly slug (lowercase, hyphens only)</small>
      </div>

      <div class="form-group">
        <label>Language</label>
        <select v-model="selectedArticle.language" required>
          <option value="EN">English</option>
          <option value="UK">Ukrainian</option>
        </select>
      </div>

      <div class="form-group">
        <label>Short Description</label>
        <input v-model="selectedArticle.shortDescription" placeholder="Brief description for preview" />
      </div>

      <div class="form-group">
        <label>Preview Image URL</label>
        <input v-model="selectedArticle.preview" placeholder="https://example.com/image.jpg" />
      </div>

      <div class="form-group">
        <label>Content (Markdown)</label>
        <textarea v-model="selectedArticle.content" placeholder="Write your article content in Markdown..." required></textarea>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="selectedArticle.isPublished" />
          Published
        </label>
      </div>

      <div class="form-actions">
        <button @click="saveArticle" :disabled="!canSave" class="save-btn">
          {{ selectedArticle.id ? 'Update' : 'Create' }} Article
        </button>
        <button @click="cancelEdit" class="cancel-btn">Cancel</button>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { newsAPI } from '@/utils/api/news';
import type { NewsArticle, CreateNewsData, UpdateNewsData } from '@/types/news';

const articles = ref<NewsArticle[]>([]);
const selectedArticleId = ref<number | string>('');
const selectedArticle = ref<NewsArticle | null>(null);
const loading = ref(false);
const error = ref<string>('');

const canSave = computed(() => {
  return selectedArticle.value && 
         selectedArticle.value.title.trim() && 
         selectedArticle.value.slug.trim() && 
         selectedArticle.value.content.trim();
});

onMounted(async () => {
  await loadArticles();
});

const loadArticles = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await newsAPI.getAllAdmin();
    articles.value = response.data.content;
  } catch (err) {
    error.value = 'Failed to load articles';
    console.error('Failed to load articles:', err);
  } finally {
    loading.value = false;
  }
};

const loadArticle = async () => {
  if (selectedArticleId.value) {
    try {
      loading.value = true;
      error.value = '';
      const response = await newsAPI.get(String(selectedArticleId.value));
      selectedArticle.value = response.data;
    } catch (err) {
      error.value = 'Failed to load article';
      console.error('Failed to fetch article details:', err);
      selectedArticle.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    selectedArticle.value = null;
  }
};

const createNewArticle = () => {
  selectedArticleId.value = '';
  selectedArticle.value = {
    id: 0,
    title: '',
    slug: '',
    language: 'EN',
    shortDescription: '',
    preview: '',
    content: '',
    isPublished: false,
    createdAt: '',
    updatedAt: '',
  };
  error.value = '';
};

const saveArticle = async () => {
  if (!selectedArticle.value || !canSave.value) return;

  try {
    loading.value = true;
    error.value = '';
    
    if (selectedArticle.value.id) {
      // Update existing article
      const updateData: UpdateNewsData = {
        title: selectedArticle.value.title,
        slug: selectedArticle.value.slug,
        shortDescription: selectedArticle.value.shortDescription,
        preview: selectedArticle.value.preview,
        content: selectedArticle.value.content,
        isPublished: selectedArticle.value.isPublished,
      };
      await newsAPI.update(String(selectedArticle.value.id), updateData);
    } else {
      // Create new article
      const createData: CreateNewsData = {
        title: selectedArticle.value.title,
        slug: selectedArticle.value.slug,
        language: selectedArticle.value.language,
        shortDescription: selectedArticle.value.shortDescription,
        preview: selectedArticle.value.preview,
        content: selectedArticle.value.content,
        isPublished: selectedArticle.value.isPublished,
      };
      await newsAPI.create(createData);
    }
    
    // Refresh the list and clear selection
    await loadArticles();
    selectedArticle.value = null;
    selectedArticleId.value = '';
    
    alert('Article saved successfully!');
  } catch (err) {
    error.value = 'Failed to save article';
    console.error('Failed to save article:', err);
  } finally {
    loading.value = false;
  }
};

const deleteArticle = async () => {
  if (!selectedArticle.value?.id || !confirm('Are you sure you want to delete this article?')) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    await newsAPI.delete(String(selectedArticle.value.id));
    
    // Refresh the list and clear selection
    await loadArticles();
    selectedArticle.value = null;
    selectedArticleId.value = '';
    
    alert('Article deleted successfully!');
  } catch (err) {
    error.value = 'Failed to delete article';
    console.error('Failed to delete article:', err);
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  selectedArticle.value = null;
  selectedArticleId.value = '';
  error.value = '';
};
</script>

<style scoped>
.editor-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.controls select {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.controls button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.controls button:first-of-type {
  background: #007bff;
  color: white;
}

.delete-btn {
  background: #dc3545 !important;
  color: white !important;
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-group small {
  color: #666;
  font-size: 0.9em;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-family: inherit;
}

.form-group textarea {
  height: 300px;
  resize: vertical;
  font-family: 'Courier New', monospace;
}

.form-group label input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.save-btn {
  background: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
}
</style>
