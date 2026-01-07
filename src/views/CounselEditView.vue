<template>
  <div class="editor-view">
    <div class="page-header">
      <button class="back-button" @click="goBack">
        <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">UN-Meeting Counsel Editor</h1>
    </div>

    <div class="controls">
      <select v-model="selectedSuggestionId" @change="loadSuggestion">
        <option value="">Select a suggestion to edit</option>
        <option v-for="suggestion in suggestions" :key="suggestion.id" :value="suggestion.id">
          {{ suggestion.title }} ({{ suggestion.language }})
        </option>
      </select>
      <button @click="createNewSuggestion">New Suggestion</button>
      <button v-if="selectedSuggestion && selectedSuggestion.id" class="delete-btn" @click="deleteSuggestion">
        Delete Suggestion
      </button>
    </div>

    <div v-if="selectedSuggestion" class="editor-form">
      <div class="form-group">
        <label>Title *</label>
        <input
            v-model="selectedSuggestion.title"
            :class="{ 'error': validationErrors.title }"
            placeholder="Enter suggestion title"
            required
        />
        <div v-if="validationErrors.title" class="field-error">{{ validationErrors.title }}</div>
      </div>

      <div class="form-group">
        <label>Slug *</label>
        <input
            v-model="selectedSuggestion.slug"
            :class="{ 'error': validationErrors.slug }"
            placeholder="suggestion-slug"
            required
        />
        <small>URL-friendly slug (lowercase, hyphens only, no spaces)</small>
        <div v-if="validationErrors.slug" class="field-error">{{ validationErrors.slug }}</div>
      </div>

      <div class="form-group">
        <label>Language *</label>
        <select v-model="selectedSuggestion.language" required>
          <option value="EN">English</option>
          <option value="UK">Ukrainian</option>
        </select>
      </div>

      <div class="form-group">
        <label>Suggester Name *</label>
        <input
            v-model="selectedSuggestion.suggesterName"
            :class="{ 'error': validationErrors.suggesterName }"
            placeholder="Player or character name"
            required
        />
        <div v-if="validationErrors.suggesterName" class="field-error">{{ validationErrors.suggesterName }}</div>
      </div>

      <div class="form-group">
        <label>Suggestion Date *</label>
        <input
            v-model="selectedSuggestion.suggestionDate"
            :class="{ 'error': validationErrors.suggestionDate }"
            required
            type="datetime-local"
        />
        <div v-if="validationErrors.suggestionDate" class="field-error">{{ validationErrors.suggestionDate }}</div>
      </div>

      <div class="form-group">
        <label>Image URL</label>
        <input
            v-model="selectedSuggestion.imageUrl"
            :class="{ 'error': validationErrors.imageUrl }"
            placeholder="https://example.com/image.jpg (optional)"
            type="url"
        />
        <div v-if="validationErrors.imageUrl" class="field-error">{{ validationErrors.imageUrl }}</div>
      </div>

      <div class="form-group">
        <label>Status *</label>
        <select v-model="selectedSuggestion.status" required>
          <option value="PROPOSED">Proposed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div class="form-group">
        <label>Votes For</label>
        <input
            v-model.number="selectedSuggestion.votesFor"
            min="0"
            placeholder="0"
            type="number"
        />
      </div>

      <div class="form-group">
        <label>Votes Against</label>
        <input
            v-model.number="selectedSuggestion.votesAgainst"
            min="0"
            placeholder="0"
            type="number"
        />
      </div>

      <div class="form-group">
        <label>Description (Markdown) *</label>
        <textarea
            v-model="selectedSuggestion.description"
            :class="{ 'error': validationErrors.description }"
            placeholder="Write the suggestion description in Markdown..."
            required
        ></textarea>
        <div v-if="validationErrors.description" class="field-error">{{ validationErrors.description }}</div>
      </div>

      <div class="form-group">
        <label>
          <input v-model="selectedSuggestion.isPublished" type="checkbox"/>
          Published
        </label>
      </div>

      <div class="form-actions">
        <button :disabled="!canSave || loading" class="save-btn" @click="saveSuggestion">
          <span v-if="loading" class="button-spinner"></span>
          {{ loading ? 'Saving...' : (selectedSuggestion.id ? 'Update' : 'Create') + ' Suggestion' }}
        </button>
        <button :disabled="!selectedSuggestion.description.trim() || loading" class="preview-btn" @click="openPreview">
          <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Preview
        </button>
        <button :disabled="loading" class="cancel-btn" @click="cancelEdit">Cancel</button>
      </div>
    </div>

    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading...
    </div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-modal-content" @click.stop>
        <div class="preview-header">
          <h2>Suggestion Preview</h2>
          <button class="close-preview-btn" @click="closePreview">
            <svg fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="preview-body">
          <div class="preview-suggestion">
            <div class="preview-suggestion-header">
              <h1 class="preview-suggestion-title">{{ selectedSuggestion?.title || 'Untitled Suggestion' }}</h1>
              <div class="preview-suggestion-meta">
                <span class="preview-language">{{
                    selectedSuggestion?.language === 'EN' ? 'English' : 'Ukrainian'
                  }}</span>
                <span :class="selectedSuggestion?.status.toLowerCase()" class="preview-status">
                  {{ selectedSuggestion?.status }}
                </span>
                <span v-if="selectedSuggestion?.isPublished" class="preview-published">Published</span>
                <span v-else class="preview-draft">Draft</span>
              </div>
            </div>

            <div class="preview-meta-info">
              <span>Suggested by: <strong>{{ selectedSuggestion?.suggesterName }}</strong></span>
              <span>{{ formatDate(selectedSuggestion?.suggestionDate) }}</span>
            </div>

            <div class="preview-voting">
              <div class="vote-count for">For: {{ selectedSuggestion?.votesFor || 0 }}</div>
              <div class="vote-count against">Against: {{ selectedSuggestion?.votesAgainst || 0 }}</div>
            </div>

            <div v-if="selectedSuggestion?.imageUrl" class="preview-image-wrapper">
              <img :alt="selectedSuggestion.title" :src="selectedSuggestion.imageUrl" class="preview-image"/>
            </div>

            <div v-dompurify-html="renderedContent" class="preview-suggestion-content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import {counselAPI} from '@/utils/api/counsel';
import type {CounselSuggestion, CounselSuggestionPreview} from '@/types/counsel';
import MarkdownIt from 'markdown-it';

const router = useRouter();
const suggestions = ref<CounselSuggestionPreview[]>([]);
const selectedSuggestionId = ref<number | string>('');
const selectedSuggestion = ref<CounselSuggestion | null>(null);
const loading = ref(false);
const error = ref<string>('');
const validationErrors = ref<Record<string, string>>({});
const successMessage = ref<string>('');
const showPreview = ref(false);

// Initialize markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

const canSave = computed(() => {
  return selectedSuggestion.value &&
      selectedSuggestion.value.title.trim() &&
      selectedSuggestion.value.slug.trim() &&
      selectedSuggestion.value.suggesterName.trim() &&
      selectedSuggestion.value.description.trim() &&
      Object.keys(validationErrors.value).length === 0;
});

const renderedContent = computed(() => {
  if (!selectedSuggestion.value?.description) return '';
  return md.render(selectedSuggestion.value.description);
});

const openPreview = () => {
  showPreview.value = true;
  document.body.style.overflow = 'hidden';
};

const closePreview = () => {
  showPreview.value = false;
  document.body.style.overflow = '';
};

const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

const validateForm = () => {
  const errors: Record<string, string> = {};

  if (!selectedSuggestion.value) return;

  // Title validation
  if (!selectedSuggestion.value.title.trim()) {
    errors.title = 'Title is required';
  } else if (selectedSuggestion.value.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }

  // Slug validation
  if (!selectedSuggestion.value.slug.trim()) {
    errors.slug = 'Slug is required';
  } else if (!validateSlug(selectedSuggestion.value.slug)) {
    errors.slug = 'Slug must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens';
  } else if (selectedSuggestion.value.slug.length > 255) {
    errors.slug = 'Slug must be less than 255 characters';
  }

  // Suggester name validation
  if (!selectedSuggestion.value.suggesterName.trim()) {
    errors.suggesterName = 'Suggester name is required';
  } else if (selectedSuggestion.value.suggesterName.length > 255) {
    errors.suggesterName = 'Suggester name must be less than 255 characters';
  }

  // Description validation
  if (!selectedSuggestion.value.description.trim()) {
    errors.description = 'Description is required';
  }

  // Image URL validation
  if (selectedSuggestion.value.imageUrl && selectedSuggestion.value.imageUrl.trim()) {
    try {
      new URL(selectedSuggestion.value.imageUrl);
    } catch {
      errors.imageUrl = 'Please enter a valid URL';
    }
  }

  validationErrors.value = errors;
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
  await loadSuggestions();
});

const showSuccess = (message: string) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
};

// Watch for changes in form fields and validate
watch(() => selectedSuggestion.value, () => {
  if (selectedSuggestion.value) {
    validateForm();
  }
}, {deep: true});

const goBack = () => {
  router.push('/profile');
};

const loadSuggestions = async () => {
  try {
    loading.value = true;
    error.value = '';
    // Load both English and Ukrainian suggestions
    const [responseEn, responseUk] = await Promise.all([
      counselAPI.getAll('en'),
      counselAPI.getAll('uk')
    ]);
    suggestions.value = [...responseEn.data, ...responseUk.data];
  } catch (err) {
    error.value = 'Failed to load suggestions';
    console.error('Failed to load suggestions:', err);
  } finally {
    loading.value = false;
  }
};

const loadSuggestion = async () => {
  if (selectedSuggestionId.value) {
    try {
      loading.value = true;
      error.value = '';
      // Fetch full suggestion data from admin API
      const response = await counselAPI.getByIdAdmin(Number(selectedSuggestionId.value));
      selectedSuggestion.value = response.data;
    } catch (err) {
      error.value = 'Failed to load suggestion details';
      console.error('Failed to load suggestion:', err);
      selectedSuggestion.value = null;
    } finally {
      loading.value = false;
    }
  } else {
    selectedSuggestion.value = null;
  }
};

const createNewSuggestion = () => {
  selectedSuggestionId.value = '';
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  selectedSuggestion.value = {
    id: 0,
    title: '',
    slug: '',
    language: 'EN',
    description: '',
    renderedDescription: '',
    suggesterName: '',
    suggestionDate: localDateTime,
    imageUrl: '',
    status: 'PROPOSED',
    votesFor: 0,
    votesAgainst: 0,
    isPublished: false,
    createdAt: '',
    updatedAt: '',
  };
  error.value = '';
};

const saveSuggestion = async () => {
  if (!selectedSuggestion.value) return;

  validateForm();
  if (!canSave.value) {
    error.value = 'Please fix validation errors before saving';
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    if (selectedSuggestion.value.id) {
      // Update existing suggestion
      const updateData = {
        title: selectedSuggestion.value.title,
        slug: selectedSuggestion.value.slug,
        description: selectedSuggestion.value.description,
        suggesterName: selectedSuggestion.value.suggesterName,
        suggestionDate: selectedSuggestion.value.suggestionDate,
        imageUrl: selectedSuggestion.value.imageUrl,
        status: selectedSuggestion.value.status,
        votesFor: selectedSuggestion.value.votesFor,
        votesAgainst: selectedSuggestion.value.votesAgainst,
        isPublished: selectedSuggestion.value.isPublished,
      };
      await counselAPI.update(String(selectedSuggestion.value.id), updateData);
    } else {
      // Create new suggestion
      const createData = {
        title: selectedSuggestion.value.title,
        slug: selectedSuggestion.value.slug,
        language: selectedSuggestion.value.language,
        description: selectedSuggestion.value.description,
        suggesterName: selectedSuggestion.value.suggesterName,
        suggestionDate: selectedSuggestion.value.suggestionDate,
        imageUrl: selectedSuggestion.value.imageUrl,
        status: selectedSuggestion.value.status,
        votesFor: selectedSuggestion.value.votesFor,
        votesAgainst: selectedSuggestion.value.votesAgainst,
        isPublished: selectedSuggestion.value.isPublished,
      };
      await counselAPI.create(createData);
    }

    // Refresh the list and clear selection
    await loadSuggestions();
    selectedSuggestion.value = null;
    selectedSuggestionId.value = '';

    showSuccess('Suggestion saved successfully!');
  } catch (err) {
    error.value = 'Failed to save suggestion';
    console.error('Failed to save suggestion:', err);
  } finally {
    loading.value = false;
  }
};

const deleteSuggestion = async () => {
  if (!selectedSuggestion.value?.id || !confirm('Are you sure you want to delete this suggestion?')) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    await counselAPI.delete(String(selectedSuggestion.value.id));

    // Refresh the list and clear selection
    await loadSuggestions();
    selectedSuggestion.value = null;
    selectedSuggestionId.value = '';

    showSuccess('Suggestion deleted successfully!');
  } catch (err) {
    error.value = 'Failed to delete suggestion';
    console.error('Failed to delete suggestion:', err);
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  selectedSuggestion.value = null;
  selectedSuggestionId.value = '';
  error.value = '';
};
</script>

<style scoped>
/* Reuse the same styles as NewsEditView */
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
  background: color-mix(in srgb, var(--myst-bg-2) 80%, #4a90e2);
  color: var(--myst-ink);
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #4a90e2;
}

.controls {
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px;
  background: var(--myst-bg-2);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #4a90e2 30%, transparent);
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
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px color-mix(in srgb, #4a90e2 20%, transparent);
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
  background: #4a90e2;
  color: white;
}

.controls button:first-of-type:hover {
  background: #357abd;
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
  border: 1px solid color-mix(in srgb, #4a90e2 30%, transparent);
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
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px color-mix(in srgb, #4a90e2 20%, transparent);
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
  display: flex;
  align-items: center;
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

.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #4a90e2 !important;
  color: white !important;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.preview-btn:hover:not(:disabled) {
  background: #357abd !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.preview-btn:disabled {
  background: color-mix(in srgb, var(--myst-ink-muted) 50%, transparent) !important;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.5;
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
  border-top: 2px solid #4a90e2;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

/* Preview Modal Styles */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.preview-modal-content {
  background: var(--myst-bg);
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.preview-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-ink);
}

.close-preview-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: var(--myst-ink-muted);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-preview-btn:hover {
  background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  color: var(--myst-ink);
}

.preview-body {
  overflow-y: auto;
  padding: 32px;
  flex: 1;
}

.preview-suggestion {
  max-width: 800px;
  margin: 0 auto;
}

.preview-suggestion-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid color-mix(in srgb, #4a90e2 30%, transparent);
}

.preview-suggestion-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--myst-ink);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.preview-suggestion-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.preview-language,
.preview-status,
.preview-published,
.preview-draft {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.preview-language {
  background: color-mix(in srgb, #4a90e2 20%, transparent);
  color: #4a90e2;
}

.preview-status.proposed {
  background: color-mix(in srgb, #ff9800 20%, transparent);
  color: #ff9800;
}

.preview-status.accepted {
  background: color-mix(in srgb, #10b981 20%, transparent);
  color: #10b981;
}

.preview-status.rejected {
  background: color-mix(in srgb, #ef4444 20%, transparent);
  color: #ef4444;
}

.preview-published {
  background: color-mix(in srgb, #10b981 20%, transparent);
  color: #10b981;
}

.preview-draft {
  background: color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  color: var(--myst-ink-muted);
}

.preview-meta-info {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--myst-ink-muted);
}

.preview-voting {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.vote-count {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
}

.vote-count.for {
  background: color-mix(in srgb, #4a90e2 15%, transparent);
  color: #4a90e2;
}

.vote-count.against {
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #ef4444;
}

.preview-image-wrapper {
  margin-bottom: 32px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
}

.preview-suggestion-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--myst-ink);
}

.preview-suggestion-content :deep(h1),
.preview-suggestion-content :deep(h2),
.preview-suggestion-content :deep(h3) {
  color: #4a90e2;
  font-weight: 700;
  margin-top: 32px;
  margin-bottom: 16px;
  line-height: 1.3;
}

.preview-suggestion-content :deep(h1) {
  font-size: 28px;
}

.preview-suggestion-content :deep(h2) {
  font-size: 24px;
}

.preview-suggestion-content :deep(h3) {
  font-size: 20px;
}

.preview-suggestion-content :deep(p) {
  margin-bottom: 16px;
}

.preview-suggestion-content :deep(a) {
  color: #4a90e2;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.preview-suggestion-content :deep(a:hover) {
  color: #6ba4ec;
}

.preview-suggestion-content :deep(code) {
  background: color-mix(in srgb, #4a90e2 15%, transparent);
  color: #4a90e2;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
}

.preview-suggestion-content :deep(pre) {
  background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
}

.preview-suggestion-content :deep(pre code) {
  background: none;
  padding: 0;
}
</style>
