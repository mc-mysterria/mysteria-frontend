<template>
  <div class="editor-view">
    <div class="page-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">News Editor</h1>
    </div>
    
    <div class="controls">
      <select v-model="selectedArticleId" @change="loadArticle">
        <option value="">Select an article to edit</option>
        <option v-for="article in articles" :key="article.id" :value="article.id">
          {{ article.title }} ({{ article.language }})
        </option>
      </select>
      <button @click="createNewArticle">New Article</button>
      <button v-if="selectedArticle && selectedArticle.id" @click="togglePin" class="pin-btn">
        {{ selectedArticle.isPinned ? 'Unpin' : 'Pin' }} Article
      </button>
      <button v-if="selectedArticle && selectedArticle.id" @click="deleteArticle" class="delete-btn">
        Delete Article
      </button>
    </div>

    <div v-if="selectedArticle" class="editor-form">
      <div class="form-group">
        <label>Title *</label>
        <input 
          v-model="selectedArticle.title" 
          placeholder="Enter article title" 
          required 
          :class="{ 'error': validationErrors.title }"
        />
        <div v-if="validationErrors.title" class="field-error">{{ validationErrors.title }}</div>
      </div>

      <div class="form-group">
        <label>Slug *</label>
        <input 
          v-model="selectedArticle.slug" 
          placeholder="article-slug" 
          required 
          :class="{ 'error': validationErrors.slug }"
        />
        <small>URL-friendly slug (lowercase, hyphens only, no spaces)</small>
        <div v-if="validationErrors.slug" class="field-error">{{ validationErrors.slug }}</div>
      </div>

      <div class="form-group">
        <label>Language *</label>
        <select v-model="selectedArticle.language" required>
          <option value="EN">English</option>
          <option value="UK">Ukrainian</option>
        </select>
      </div>

      <div class="form-group">
        <label>Short Description</label>
        <input 
          v-model="selectedArticle.shortDescription" 
          placeholder="Brief description for preview (optional)" 
          :class="{ 'error': validationErrors.shortDescription }"
        />
        <small>{{ selectedArticle.shortDescription?.length || 0 }}/500 characters</small>
        <div v-if="validationErrors.shortDescription" class="field-error">{{ validationErrors.shortDescription }}</div>
      </div>

      <div class="form-group">
        <label>Preview Image URL</label>
        <input 
          v-model="selectedArticle.preview" 
          placeholder="https://example.com/image.jpg (optional)" 
          type="url"
          :class="{ 'error': validationErrors.preview }"
        />
        <div v-if="validationErrors.preview" class="field-error">{{ validationErrors.preview }}</div>
      </div>

      <div class="form-group">
        <label>Content (Markdown) *</label>
        <textarea 
          v-model="selectedArticle.content" 
          placeholder="Write your article content in Markdown..." 
          required
          :class="{ 'error': validationErrors.content }"
        ></textarea>
        <div v-if="validationErrors.content" class="field-error">{{ validationErrors.content }}</div>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="selectedArticle.isPublished" />
          Published
        </label>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="selectedArticle.isPinned" />
          Pinned (will appear at the top of the news list)
        </label>
      </div>

      <div class="form-actions">
        <button @click="saveArticle" :disabled="!canSave || loading" class="save-btn">
          <span v-if="loading" class="button-spinner"></span>
          {{ loading ? 'Saving...' : (selectedArticle.id ? 'Update' : 'Create') + ' Article' }}
        </button>
        <button @click="cancelEdit" class="cancel-btn" :disabled="loading">Cancel</button>
      </div>
    </div>

    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading...
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { newsAPI } from '@/utils/api/news';
import type { NewsArticle, CreateNewsData, UpdateNewsData } from '@/types/news';

const router = useRouter();
const articles = ref<NewsArticle[]>([]);
const selectedArticleId = ref<number | string>('');
const selectedArticle = ref<NewsArticle | null>(null);
const loading = ref(false);
const error = ref<string>('');
const validationErrors = ref<Record<string, string>>({});
const successMessage = ref<string>('');

const canSave = computed(() => {
  return selectedArticle.value && 
         selectedArticle.value.title.trim() && 
         selectedArticle.value.slug.trim() && 
         selectedArticle.value.content.trim() &&
         Object.keys(validationErrors.value).length === 0;
});

const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!selectedArticle.value) return;
  
  // Title validation
  if (!selectedArticle.value.title.trim()) {
    errors.title = 'Title is required';
  } else if (selectedArticle.value.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }
  
  // Slug validation
  if (!selectedArticle.value.slug.trim()) {
    errors.slug = 'Slug is required';
  } else if (!validateSlug(selectedArticle.value.slug)) {
    errors.slug = 'Slug must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens';
  } else if (selectedArticle.value.slug.length > 100) {
    errors.slug = 'Slug must be less than 100 characters';
  }
  
  // Content validation
  if (!selectedArticle.value.content.trim()) {
    errors.content = 'Content is required';
  }
  
  // Short description validation
  if (selectedArticle.value.shortDescription && selectedArticle.value.shortDescription.length > 500) {
    errors.shortDescription = 'Short description must be less than 500 characters';
  }
  
  // Preview URL validation
  if (selectedArticle.value.preview && selectedArticle.value.preview.trim()) {
    try {
      new URL(selectedArticle.value.preview);
    } catch {
      errors.preview = 'Please enter a valid URL';
    }
  }
  
  validationErrors.value = errors;
};

onMounted(async () => {
  await loadArticles();
});

const showSuccess = (message: string) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
};

// Watch for changes in form fields and validate
watch(() => selectedArticle.value, () => {
  if (selectedArticle.value) {
    validateForm();
  }
}, { deep: true });

const goBack = () => {
  router.push('/profile');
};

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
    isPinned: false,
    createdAt: '',
    updatedAt: '',
  };
  error.value = '';
};

const saveArticle = async () => {
  if (!selectedArticle.value) return;
  
  validateForm();
  if (!canSave.value) {
    error.value = 'Please fix validation errors before saving';
    return;
  }

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
        isPinned: selectedArticle.value.isPinned,
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
        isPinned: selectedArticle.value.isPinned,
      };
      await newsAPI.create(createData);
    }
    
    // Refresh the list and clear selection
    await loadArticles();
    selectedArticle.value = null;
    selectedArticleId.value = '';
    
    showSuccess('Article saved successfully!');
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
    
    showSuccess('Article deleted successfully!');
  } catch (err) {
    error.value = 'Failed to delete article';
    console.error('Failed to delete article:', err);
  } finally {
    loading.value = false;
  }
};

const togglePin = async () => {
  if (!selectedArticle.value?.id) return;

  try {
    loading.value = true;
    error.value = '';
    const response = await newsAPI.togglePin(selectedArticle.value.id);

    // Update the current article with the response
    selectedArticle.value = response.data;

    // Refresh the articles list
    await loadArticles();

    showSuccess(`Article ${selectedArticle.value.isPinned ? 'pinned' : 'unpinned'} successfully!`);
  } catch (err) {
    error.value = 'Failed to toggle pin status';
    console.error('Failed to toggle pin:', err);
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
  max-width: 900px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--myst-ink-muted);
}

.back-button:hover {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, var(--myst-gold));
  color: var(--myst-ink);
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--myst-ink);
}

.controls {
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px;
  background: var(--myst-bg-2);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.controls select {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-radius: 8px;
  font-size: 14px;
  background: var(--myst-bg);
  color: var(--myst-ink);
  transition: border-color 0.2s ease;
}

.controls select:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.controls button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.controls button:first-of-type {
  background: var(--myst-gold);
  color: var(--myst-bg);
}

.controls button:first-of-type:hover {
  background: var(--myst-gold-soft);
  transform: translateY(-1px);
}

.pin-btn {
  background: #f59e0b !important;
  color: white !important;
}

.pin-btn:hover {
  background: #d97706 !important;
  transform: translateY(-1px);
}

.delete-btn {
  background: #ef4444 !important;
  color: white !important;
}

.delete-btn:hover {
  background: #dc2626 !important;
  transform: translateY(-1px);
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--myst-bg-2);
  padding: 32px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  box-shadow: 0 1px 3px color-mix(in srgb, black 10%, transparent);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: var(--myst-ink);
  font-size: 14px;
}

.form-group small {
  color: var(--myst-ink-muted);
  font-size: 12px;
  margin-top: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.form-group input.error:focus,
.form-group select.error:focus,
.form-group textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.field-error {
  color: #ef4444;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
}

.form-group textarea {
  height: 320px;
  resize: vertical;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  line-height: 1.6;
}

.form-group label input[type="checkbox"] {
  width: auto;
  margin-right: 12px;
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.save-btn {
  background: #10b981;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn:disabled {
  background: color-mix(in srgb, var(--myst-ink-muted) 50%, transparent);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: var(--myst-ink-muted);
  color: var(--myst-bg);
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: var(--myst-ink);
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: 32px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  background: var(--myst-bg-2);
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-top: 2px solid var(--myst-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.button-spinner {
  width: 14px;
  height: 14px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-top: 1.5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  background: color-mix(in srgb, #10b981 15%, transparent);
  color: #10b981;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #10b981 40%, transparent);
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}

.error {
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #ef4444;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}
</style>
