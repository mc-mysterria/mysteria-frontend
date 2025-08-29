<template>
  <div class="editor-view">
    <div class="page-header">
      <button @click="goBack" class="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">Service Content Editor</h1>
    </div>
    
    <div class="controls">
      <select v-model="selectedServiceId" @change="loadServiceContent">
        <option value="">Select a service to edit content</option>
        <option v-for="service in services" :key="service.id" :value="service.id">
          {{ service.name || service.nameEn || service.nameUk }}
        </option>
      </select>
      <button @click="createNewContent">New Content</button>
      <button v-if="selectedContent && selectedContent.id" @click="deleteContent" class="delete-btn">
        Delete Content
      </button>
    </div>

    <div v-if="selectedContent" class="editor-form">
      <div class="form-group">
        <label>Service</label>
        <select v-model="selectedServiceId" @change="loadServiceContent" required>
          <option value="">Select a service</option>
          <option v-for="service in services" :key="service.id" :value="service.id">
            {{ service.name || service.nameEn || service.nameUk }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Slug *</label>
        <input 
          v-model="selectedContent.slug" 
          placeholder="service-slug" 
          required 
          :class="{ 'error': validationErrors.slug }"
        />
        <small>URL-friendly slug (lowercase, hyphens only, no spaces)</small>
        <div v-if="validationErrors.slug" class="field-error">{{ validationErrors.slug }}</div>
      </div>

      <div class="form-group">
        <label>English Content (Markdown)</label>
        <textarea 
          v-model="selectedContent.markdownContentEn" 
          placeholder="Write service content in Markdown (English)..."
          :class="{ 'error': validationErrors.markdownContentEn }"
        ></textarea>
        <div v-if="validationErrors.markdownContentEn" class="field-error">{{ validationErrors.markdownContentEn }}</div>
      </div>

      <div class="form-group">
        <label>Ukrainian Content (Markdown)</label>
        <textarea 
          v-model="selectedContent.markdownContentUk" 
          placeholder="Write service content in Markdown (Ukrainian)..."
          :class="{ 'error': validationErrors.markdownContentUk }"
        ></textarea>
        <div v-if="validationErrors.markdownContentUk" class="field-error">{{ validationErrors.markdownContentUk }}</div>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="selectedContent.isPublished" />
          Published
        </label>
      </div>

      <div class="form-actions">
        <button @click="saveContent" :disabled="!canSave || loading" class="save-btn">
          <span v-if="loading" class="button-spinner"></span>
          {{ loading ? 'Saving...' : (selectedContent.id ? 'Update' : 'Create') + ' Content' }}
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
import { shopAPI } from '@/utils/api/shop';
import type { ServiceDto, ServiceMarkdownDto, CreateServiceMarkdownDto, UpdateServiceMarkdownDto } from '@/types/services';
import { ServiceType } from '@/types/services';
import { useBalanceStore } from '@/stores/balance';

const router = useRouter();
const shopStore = useBalanceStore();

// State
const services = ref<ServiceDto[]>([]);
const selectedServiceId = ref<number | string>('');
const selectedContent = ref<(ServiceMarkdownDto & { isPublished?: boolean }) | null>(null);
const loading = ref(false);
const error = ref<string>('');
const validationErrors = ref<Record<string, string>>({});
const successMessage = ref<string>('');

// Computed
const canSave = computed(() => {
  return selectedContent.value && 
         selectedServiceId.value &&
         selectedContent.value.slug &&
         selectedContent.value.slug.trim() &&
         (selectedContent.value.markdownContentEn || selectedContent.value.markdownContentUk) &&
         Object.keys(validationErrors.value).length === 0;
});

// Validation
const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

const validateForm = () => {
  const errors: Record<string, string> = {};
  
  if (!selectedContent.value) return;
  
  // Slug validation
  if (!selectedContent.value.slug || !selectedContent.value.slug.trim()) {
    errors.slug = 'Slug is required';
  } else if (!validateSlug(selectedContent.value.slug)) {
    errors.slug = 'Slug must be lowercase, use hyphens instead of spaces, and contain only letters, numbers, and hyphens';
  } else if (selectedContent.value.slug.length > 100) {
    errors.slug = 'Slug must be less than 100 characters';
  }
  
  // Content validation - at least one language required
  if (!selectedContent.value.markdownContentEn?.trim() && !selectedContent.value.markdownContentUk?.trim()) {
    errors.markdownContentEn = 'At least one language content is required';
    errors.markdownContentUk = 'At least one language content is required';
  }
  
  validationErrors.value = errors;
};

// Lifecycle
onMounted(async () => {
  await loadServices();
});

// Methods
const showSuccess = (message: string) => {
  successMessage.value = message;
  setTimeout(() => {
    successMessage.value = '';
  }, 5000);
};

// Watch for changes in form fields and validate
watch(() => selectedContent.value, () => {
  if (selectedContent.value) {
    validateForm();
  }
}, { deep: true });

const goBack = () => {
  router.push('/profile');
};

const loadServices = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // Get all services from the shop store or fetch them
    if (shopStore.services.length === 0) {
      await shopStore.fetchServices(true); // Require auth for admin
    }
    services.value = shopStore.services;
  } catch (err) {
    console.error('Failed to load services:', err);
    error.value = 'Failed to load services';
  } finally {
    loading.value = false;
  }
};

const loadServiceContent = async () => {
  if (selectedServiceId.value) {
    try {
      loading.value = true;
      error.value = '';
      
      // Load both English and Ukrainian content to prevent data loss
      const [enResponse, ukResponse] = await Promise.allSettled([
        shopAPI.getServiceContentAdmin(Number(selectedServiceId.value), 'en'),
        shopAPI.getServiceContentAdmin(Number(selectedServiceId.value), 'uk')
      ]);
      
      let enData = null;
      let ukData = null;
      
      if (enResponse.status === 'fulfilled') {
        enData = enResponse.value.data;
      }
      if (ukResponse.status === 'fulfilled') {
        ukData = ukResponse.value.data;
      }
      
      // If no content exists for either language, create new content template
      if (!enData && !ukData) {
        createNewContentForService();
      } else {
        // Merge data from both languages, preferring English for base properties
        const baseData = enData || ukData;
        if (baseData) {
          selectedContent.value = {
            ...baseData,
            markdownContentEn: enData?.markdownContentEn || enData?.markdownContent || '',
            markdownContentUk: ukData?.markdownContentUk || ukData?.markdownContent || '',
            isPublished: baseData.publishedAt !== null
          };
        } else {
          createNewContentForService();
        }
      }
    } catch (err) {
      console.error('Failed to load service content:', err);
      // If content doesn't exist yet, create a new one
      createNewContentForService();
    } finally {
      loading.value = false;
    }
  } else {
    selectedContent.value = null;
  }
};

const createNewContent = () => {
  selectedServiceId.value = '';
  createNewContentForService();
};

const createNewContentForService = () => {
  const selectedService = services.value.find(s => s.id === Number(selectedServiceId.value));
  
  selectedContent.value = {
    id: selectedService?.id || 0,
    name: selectedService?.name || '',
    slug: selectedService?.name ? selectedService.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null,
    nameEn: selectedService?.nameEn,
    nameUk: selectedService?.nameUk,
    markdownContent: '',
    markdownContentEn: '',
    markdownContentUk: '',
    imageUrl: selectedService?.imageUrl,
    price: selectedService?.price || 0,
    type: selectedService?.type || ServiceType.ITEM,
    isSubscription: selectedService?.isSubscription || false,
    isPublished: false,
    createdAt: selectedService?.createdAt || '',
    updatedAt: null,
    publishedAt: null,
  };
  error.value = '';
};

const saveContent = async () => {
  if (!selectedContent.value || !selectedServiceId.value) return;
  
  validateForm();
  if (!canSave.value) {
    error.value = 'Please fix validation errors before saving';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    if (selectedContent.value.id) {
      // Update existing content
      const updateData: UpdateServiceMarkdownDto = {
        slug: selectedContent.value.slug || undefined,
        markdownContentEn: selectedContent.value.markdownContentEn,
        markdownContentUk: selectedContent.value.markdownContentUk,
        isPublished: selectedContent.value.isPublished,
      };
      await shopAPI.updateServiceContent(Number(selectedServiceId.value), updateData);
    } else {
      // Create new content
      const createData: CreateServiceMarkdownDto = {
        slug: selectedContent.value.slug || '',
        markdownContentEn: selectedContent.value.markdownContentEn,
        markdownContentUk: selectedContent.value.markdownContentUk,
        isPublished: selectedContent.value.isPublished,
      };
      await shopAPI.createServiceContent(Number(selectedServiceId.value), createData);
    }
    
    // Clear selection
    selectedContent.value = null;
    selectedServiceId.value = '';
    
    showSuccess('Service content saved successfully!');
  } catch (err) {
    console.error('Failed to save service content:', err);
    error.value = 'Failed to save service content';
  } finally {
    loading.value = false;
  }
};

const deleteContent = async () => {
  if (!selectedContent.value?.id || !confirm('Are you sure you want to delete this service content?')) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    // Note: The API doesn't seem to have a delete endpoint for service content
    // This would need to be implemented on the backend
    error.value = 'Delete functionality not yet implemented';
    
    // When implemented, it would be:
    // await shopAPI.deleteServiceContent(selectedContent.value.id);
    // selectedContent.value = null;
    // selectedServiceId.value = '';
    // showSuccess('Service content deleted successfully!');
  } catch (err) {
    console.error('Failed to delete service content:', err);
    error.value = 'Failed to delete service content';
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  selectedContent.value = null;
  selectedServiceId.value = '';
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
  border-bottom: 2px solid #e2e8f0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #475569;
}

.back-button:hover {
  background: #e2e8f0;
  color: #334155;
  transform: translateX(-2px);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.controls {
  margin-bottom: 32px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.controls select {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;
}

.controls select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  background: #3b82f6;
  color: white;
}

.controls button:first-of-type:hover {
  background: #2563eb;
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
  background: white;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group small {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error,
.form-group select.error,
.form-group textarea.error {
  border-color: #ef4444;
}

.form-group input.error:focus,
.form-group select.error:focus,
.form-group textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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
  border-top: 1px solid #e2e8f0;
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
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.loading {
  text-align: center;
  padding: 32px;
  color: #6b7280;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #3b82f6;
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
  background: #f0fdf4;
  color: #166534;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}

.error {
  background: #fef2f2;
  color: #991b1b;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}
</style>