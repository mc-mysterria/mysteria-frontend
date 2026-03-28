<template>
  <div :class="['editor-view', { 'split-active': splitView && selectedArticle }]">
    <div class="page-header">
      <button class="back-button" @click="goBack">
        <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back
      </button>
      <h1 class="page-title">News Editor</h1>
      <div class="header-status">
        <span v-if="isDirty" class="dirty-indicator">
          <span class="dirty-dot"></span>Unsaved changes
        </span>
        <span v-if="draftSavedAt && !isDirty" class="draft-saved">Draft saved {{ formatDraftTime(draftSavedAt) }}</span>
        <span v-if="selectedArticle" class="kb-hint">Ctrl+S to save</span>
      </div>
    </div>

    <div v-if="pendingDraft" class="draft-banner">
      <div class="draft-banner-text">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        Unsaved draft: <strong>{{ pendingDraft.title || 'Untitled' }}</strong> — saved at {{ formatDraftTime(pendingDraft.savedAt) }}
      </div>
      <div class="draft-banner-actions">
        <button class="draft-restore-btn" @click="restoreDraft">Restore</button>
        <button class="draft-dismiss-btn" @click="dismissDraft">Dismiss</button>
      </div>
    </div>

    <div class="controls">
      <select v-model="selectedArticleId" @change="loadArticle">
        <option value="">Select an article to edit</option>
        <option v-for="article in articles" :key="article.id" :value="article.id">
          {{ article.title }} ({{ article.language }})
        </option>
      </select>
      <button @click="createNewArticle">New Article</button>
      <button v-if="selectedArticle && selectedArticle.id" class="pin-btn" @click="togglePin">
        {{ selectedArticle.isPinned ? 'Unpin' : 'Pin' }} Article
      </button>
      <button v-if="selectedArticle && selectedArticle.id" class="delete-btn" @click="deleteArticle">
        Delete Article
      </button>
    </div>

    <div :class="splitView && selectedArticle ? 'split-layout' : ''">
      <div v-if="selectedArticle" class="editor-form">
        <div class="form-group">
          <label>Title *</label>
          <input
              v-model="selectedArticle.title"
              :class="{ 'error': validationErrors.title }"
              placeholder="Enter article title"
              required
          />
          <div v-if="validationErrors.title" class="field-error">{{ validationErrors.title }}</div>
        </div>

        <div class="form-group">
          <label>Slug *</label>
          <input
              v-model="selectedArticle.slug"
              :class="{ 'error': validationErrors.slug }"
              placeholder="article-slug"
              required
              @input="slugManuallyEdited = true"
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
              :class="{ 'error': validationErrors.shortDescription }"
              placeholder="Brief description for preview (optional)"
          />
          <small>{{ selectedArticle.shortDescription?.length || 0 }}/500 characters</small>
          <div v-if="validationErrors.shortDescription" class="field-error">{{ validationErrors.shortDescription }}</div>
        </div>

        <div class="form-group">
          <label>Preview Image URL</label>
          <input
              v-model="selectedArticle.preview"
              :class="{ 'error': validationErrors.preview }"
              placeholder="https://example.com/image.jpg (optional)"
              type="url"
          />
          <div v-if="validationErrors.preview" class="field-error">{{ validationErrors.preview }}</div>
        </div>

        <div class="form-group">
          <div class="content-label-row">
            <label>Content (Markdown) *</label>
            <button type="button" class="split-view-btn" @click="toggleSplitView">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
              </svg>
              {{ splitView ? 'Hide Preview' : 'Split Preview' }}
            </button>
          </div>

          <div class="md-toolbar">
            <button type="button" class="md-toolbar-btn" title="Bold (Ctrl+B)" @click="toolbarActions.bold()"><strong>B</strong></button>
            <button type="button" class="md-toolbar-btn italic-btn" title="Italic (Ctrl+I)" @click="toolbarActions.italic()"><em>I</em></button>
            <span class="toolbar-sep"></span>
            <button type="button" class="md-toolbar-btn" title="Heading 2" @click="toolbarActions.h2()">H2</button>
            <button type="button" class="md-toolbar-btn" title="Heading 3" @click="toolbarActions.h3()">H3</button>
            <span class="toolbar-sep"></span>
            <button type="button" class="md-toolbar-btn" title="Link (Ctrl+K)" @click="toolbarActions.link()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </button>
            <button type="button" class="md-toolbar-btn" title="Inline Code" @click="toolbarActions.code()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </button>
            <button type="button" class="md-toolbar-btn" title="Code Block" @click="toolbarActions.codeBlock()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </button>
            <span class="toolbar-sep"></span>
            <button type="button" class="md-toolbar-btn" title="Blockquote" @click="toolbarActions.blockquote()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
              </svg>
            </button>
            <button type="button" class="md-toolbar-btn" title="Bullet List" @click="toolbarActions.bulletList()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
                <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </button>
            <button type="button" class="md-toolbar-btn" title="Numbered List" @click="toolbarActions.numberedList()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
                <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
              </svg>
            </button>
            <button type="button" class="md-toolbar-btn" title="Horizontal Rule" @click="toolbarActions.hr()">—</button>
          </div>

          <div class="pathway-picker-bar">
            <button type="button" class="pathway-picker-toggle" @click="showPathwayPicker = !showPathwayPicker">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              Pathway Emojis
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" :style="{ transform: showPathwayPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <span class="pathway-picker-hint">Type :name: or click to insert</span>
          </div>

          <div v-if="showPathwayPicker" class="pathway-picker-grid">
            <button
                v-for="name in PATHWAYS"
                :key="name"
                type="button"
                class="pathway-picker-item"
                :title="name"
                @click="insertPathway(name)"
            >
              <img :src="getPathwayImageUrl(name)" :alt="name" class="pathway-picker-img"/>
              <span class="pathway-picker-label">{{ name }}</span>
            </button>
          </div>

          <textarea
              ref="contentTextarea"
              v-model="selectedArticle.content"
              :class="{ 'error': validationErrors.content }"
              placeholder="Write your article content in Markdown..."
              required
              @keydown="handleKeydown"
          ></textarea>
          <div class="content-stats">
            <span>{{ wordCount }} words</span>
            <span class="stats-sep">·</span>
            <span>{{ charCount }} chars</span>
          </div>
          <div v-if="validationErrors.content" class="field-error">{{ validationErrors.content }}</div>
        </div>

        <div class="form-group">
          <label><input v-model="selectedArticle.isPublished" type="checkbox"/> Published</label>
        </div>

        <div class="form-group">
          <label><input v-model="selectedArticle.isPinned" type="checkbox"/> Pinned (will appear at the top of the news list)</label>
        </div>

        <div class="form-actions">
          <button :disabled="!canSave || loading" class="save-btn" @click="saveArticle">
            <span v-if="loading" class="button-spinner"></span>
            {{ loading ? 'Saving...' : (selectedArticle.id ? 'Update' : 'Create') + ' Article' }}
          </button>
          <button :disabled="!selectedArticle.content.trim() || loading" class="preview-btn" @click="openPreview">
            <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Full Preview
          </button>
          <button :disabled="loading" class="cancel-btn" @click="cancelEdit">Cancel</button>
        </div>
      </div>

      <div v-if="splitView && selectedArticle" class="live-preview-pane">
        <div class="live-preview-header">
          <span>Live Preview</span>
          <span class="live-preview-lang">{{ selectedArticle.language }}</span>
        </div>
        <div class="live-preview-body">
          <h1 class="live-preview-title">{{ selectedArticle.title || 'Untitled Article' }}</h1>
          <p v-if="selectedArticle.shortDescription" class="live-preview-desc">{{ selectedArticle.shortDescription }}</p>
          <div v-dompurify-html="renderedContent" class="preview-article-content"></div>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="success">{{ successMessage }}</div>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      Loading...
    </div>
    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="showPreview" class="preview-modal" @click="closePreview">
      <div class="preview-modal-content" @click.stop>
        <div class="preview-header">
          <h2>Article Preview</h2>
          <button class="close-preview-btn" @click="closePreview">
            <svg fill="none" height="24" stroke="currentColor" viewBox="0 0 24 24" width="24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="preview-body">
          <div class="preview-article">
            <div class="preview-article-header">
              <h1 class="preview-article-title">{{ selectedArticle?.title || 'Untitled Article' }}</h1>
              <div class="preview-article-meta">
                <span class="preview-language">{{ selectedArticle?.language === 'EN' ? 'English' : 'Ukrainian' }}</span>
                <span v-if="selectedArticle?.isPublished" class="preview-status published">Published</span>
                <span v-else class="preview-status draft">Draft</span>
                <span v-if="selectedArticle?.isPinned" class="preview-pinned">Pinned</span>
              </div>
            </div>
            <div v-if="selectedArticle?.shortDescription" class="preview-short-description">
              {{ selectedArticle.shortDescription }}
            </div>
            <div v-if="selectedArticle?.preview" class="preview-image-wrapper">
              <img :alt="selectedArticle.title" :src="selectedArticle.preview" class="preview-image"/>
            </div>
            <div v-dompurify-html="renderedContent" class="preview-article-content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {onBeforeRouteLeave, useRouter} from 'vue-router';
import {newsAPI} from '@/utils/api/news';
import type {CreateNewsData, NewsArticle, UpdateNewsData} from '@/types/news';
import MarkdownIt from 'markdown-it';
import {PATHWAYS, getPathwayImageUrl, pathwayEmojiPlugin} from '@/utils/pathwayPlugin';

const router = useRouter();
const articles = ref<NewsArticle[]>([]);
const selectedArticleId = ref<number | string>('');
const selectedArticle = ref<NewsArticle | null>(null);
const loading = ref(false);
const error = ref<string>('');
const validationErrors = ref<Record<string, string>>({});
const successMessage = ref<string>('');
const showPreview = ref(false);
const showPathwayPicker = ref(false);
const contentTextarea = ref<HTMLTextAreaElement | null>(null);
const splitView = ref(false);
const slugManuallyEdited = ref(false);
const savedSnapshot = ref('');
const draftSavedAt = ref<Date | null>(null);
const pendingDraft = ref<(NewsArticle & { savedAt: string }) | null>(null);

const DRAFT_KEY = 'mysteria-news-editor-draft';
let draftTimer: ReturnType<typeof setTimeout> | null = null;

const md = new MarkdownIt({html: true, linkify: true, typographer: true});
md.use(pathwayEmojiPlugin);

// — Computed —

const isDirty = computed(() => {
  if (!selectedArticle.value) return false;
  return JSON.stringify(selectedArticle.value) !== savedSnapshot.value;
});

const wordCount = computed(() => {
  const c = selectedArticle.value?.content ?? '';
  return c.trim() ? c.trim().split(/\s+/).length : 0;
});

const charCount = computed(() => selectedArticle.value?.content.length ?? 0);

const canSave = computed(() =>
    !!(selectedArticle.value &&
        selectedArticle.value.title.trim() &&
        selectedArticle.value.slug.trim() &&
        selectedArticle.value.content.trim() &&
        Object.keys(validationErrors.value).length === 0)
);

const renderedContent = computed(() => {
  if (!selectedArticle.value?.content) return '';
  return md.render(selectedArticle.value.content);
});

// — Draft management —

const formatDraftTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

const saveDraft = () => {
  if (!selectedArticle.value || !isDirty.value) return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify({...selectedArticle.value, savedAt: new Date().toISOString()}));
  draftSavedAt.value = new Date();
};

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
  draftSavedAt.value = null;
};

const checkForDraft = () => {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    pendingDraft.value = JSON.parse(raw);
  } catch { /* ignore */ }
};

const restoreDraft = () => {
  if (!pendingDraft.value) return;
  const {savedAt, ...article} = pendingDraft.value;
  selectedArticle.value = article as NewsArticle;
  if (article.id) selectedArticleId.value = article.id;
  savedSnapshot.value = '';
  pendingDraft.value = null;
};

const dismissDraft = () => {
  clearDraft();
  pendingDraft.value = null;
};

// — Unsaved changes protection —

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    const ok = confirm('You have unsaved changes. Leave this page?');
    ok ? next() : next(false);
  } else {
    next();
  }
});

// — Markdown toolbar —

const wrapSelection = (before: string, after: string, defaultText: string) => {
  const el = contentTextarea.value;
  if (!el || !selectedArticle.value) return;
  const s = el.selectionStart;
  const e = el.selectionEnd;
  const selected = selectedArticle.value.content.slice(s, e) || defaultText;
  const rep = before + selected + after;
  selectedArticle.value.content =
      selectedArticle.value.content.slice(0, s) + rep + selectedArticle.value.content.slice(e);
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(s + before.length, s + before.length + selected.length);
  }, 0);
};

const insertAtLineStart = (prefix: string) => {
  const el = contentTextarea.value;
  if (!el || !selectedArticle.value) return;
  const s = el.selectionStart;
  const content = selectedArticle.value.content;
  const lineStart = content.lastIndexOf('\n', s - 1) + 1;
  selectedArticle.value.content = content.slice(0, lineStart) + prefix + content.slice(lineStart);
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(s + prefix.length, s + prefix.length);
  }, 0);
};

const toolbarActions = {
  bold: () => wrapSelection('**', '**', 'bold text'),
  italic: () => wrapSelection('_', '_', 'italic text'),
  h2: () => insertAtLineStart('## '),
  h3: () => insertAtLineStart('### '),
  link: () => wrapSelection('[', '](url)', 'link text'),
  code: () => wrapSelection('`', '`', 'code'),
  codeBlock: () => wrapSelection('\n```\n', '\n```\n', 'code'),
  blockquote: () => insertAtLineStart('> '),
  bulletList: () => insertAtLineStart('- '),
  numberedList: () => insertAtLineStart('1. '),
  hr: () => {
    const el = contentTextarea.value;
    if (!el || !selectedArticle.value) return;
    const s = el.selectionStart;
    const ins = '\n\n---\n\n';
    selectedArticle.value.content =
        selectedArticle.value.content.slice(0, s) + ins + selectedArticle.value.content.slice(s);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(s + ins.length, s + ins.length);
    }, 0);
  },
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.metaKey) return;
  switch (e.key) {
    case 's': e.preventDefault(); if (canSave.value && !loading.value) saveArticle(); break;
    case 'b': e.preventDefault(); toolbarActions.bold(); break;
    case 'i': e.preventDefault(); toolbarActions.italic(); break;
    case 'k': e.preventDefault(); toolbarActions.link(); break;
  }
};

// — Pathway insertion —

const insertPathway = (name: string) => {
  if (!selectedArticle.value || !contentTextarea.value) return;
  const el = contentTextarea.value;
  const s = el.selectionStart ?? selectedArticle.value.content.length;
  const e = el.selectionEnd ?? s;
  const snip = `:${name}:`;
  selectedArticle.value.content =
      selectedArticle.value.content.slice(0, s) + snip + selectedArticle.value.content.slice(e);
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(s + snip.length, s + snip.length);
  }, 0);
};

// — Split view —

const toggleSplitView = () => {
  splitView.value = !splitView.value;
  if (splitView.value && showPreview.value) closePreview();
};

// — Preview modal —

const openPreview = () => {
  showPreview.value = true;
  document.body.style.overflow = 'hidden';
};

const closePreview = () => {
  showPreview.value = false;
  document.body.style.overflow = '';
};

// — Slug auto-generation —

const toSlug = (s: string) =>
    s.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100);

// — Validation —

const validateSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

const validateForm = () => {
  const errors: Record<string, string> = {};
  if (!selectedArticle.value) return;

  if (!selectedArticle.value.title.trim()) errors.title = 'Title is required';
  else if (selectedArticle.value.title.length > 200) errors.title = 'Title must be less than 200 characters';

  if (!selectedArticle.value.slug.trim()) errors.slug = 'Slug is required';
  else if (!validateSlug(selectedArticle.value.slug)) errors.slug = 'Slug must be lowercase with hyphens only';
  else if (selectedArticle.value.slug.length > 100) errors.slug = 'Slug must be less than 100 characters';

  if (!selectedArticle.value.content.trim()) errors.content = 'Content is required';

  if (selectedArticle.value.shortDescription && selectedArticle.value.shortDescription.length > 500)
    errors.shortDescription = 'Short description must be less than 500 characters';

  if (selectedArticle.value.preview?.trim()) {
    try { new URL(selectedArticle.value.preview); }
    catch { errors.preview = 'Please enter a valid URL'; }
  }

  validationErrors.value = errors;
};

// — Watchers —

watch(() => selectedArticle.value, () => {
  if (!selectedArticle.value) return;
  validateForm();
  if (draftTimer) clearTimeout(draftTimer);
  draftTimer = setTimeout(saveDraft, 2000);
}, {deep: true});

watch(() => selectedArticle.value?.title, (title) => {
  if (!selectedArticle.value || selectedArticle.value.id || slugManuallyEdited.value) return;
  selectedArticle.value.slug = toSlug(title ?? '');
});

// — Lifecycle —

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  checkForDraft();
  await loadArticles();
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
  if (draftTimer) clearTimeout(draftTimer);
});

const showSuccess = (message: string) => {
  successMessage.value = message;
  setTimeout(() => {successMessage.value = '';}, 5000);
};

const goBack = () => router.push('/profile');

// — API —

const loadArticles = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await newsAPI.getAllAdmin();
    articles.value = response.data.content;
  } catch (err) {
    error.value = 'Failed to load articles';
    console.error(err);
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
      savedSnapshot.value = JSON.stringify(response.data);
      selectedArticle.value = response.data;
      slugManuallyEdited.value = true;
    } catch (err) {
      error.value = 'Failed to load article';
      console.error(err);
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
  slugManuallyEdited.value = false;
  const fresh: NewsArticle = {
    id: 0, title: '', slug: '', language: 'EN',
    shortDescription: '', preview: '', content: '',
    isPublished: false, isPinned: false, createdAt: '', updatedAt: '',
  };
  savedSnapshot.value = JSON.stringify(fresh);
  selectedArticle.value = fresh;
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

    clearDraft();
    await loadArticles();
    selectedArticle.value = null;
    selectedArticleId.value = '';
    savedSnapshot.value = '';
    showSuccess('Article saved successfully!');
  } catch (err) {
    error.value = 'Failed to save article';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteArticle = async () => {
  if (!selectedArticle.value?.id || !confirm('Are you sure you want to delete this article?')) return;

  try {
    loading.value = true;
    error.value = '';
    await newsAPI.delete(String(selectedArticle.value.id));
    clearDraft();
    await loadArticles();
    selectedArticle.value = null;
    selectedArticleId.value = '';
    savedSnapshot.value = '';
    showSuccess('Article deleted successfully!');
  } catch (err) {
    error.value = 'Failed to delete article';
    console.error(err);
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
    selectedArticle.value = response.data;
    savedSnapshot.value = JSON.stringify(response.data);
    await loadArticles();
    showSuccess(`Article ${selectedArticle.value.isPinned ? 'pinned' : 'unpinned'} successfully!`);
  } catch (err) {
    error.value = 'Failed to toggle pin status';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const cancelEdit = () => {
  if (isDirty.value && !confirm('Discard unsaved changes?')) return;
  clearDraft();
  selectedArticle.value = null;
  selectedArticleId.value = '';
  savedSnapshot.value = '';
  error.value = '';
};
</script>

<style scoped>
.editor-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  transition: max-width 0.3s ease;
}

.editor-view.split-active {
  max-width: 1600px;
  padding: 20px 32px;
}

/* Header */
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dirty-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #f59e0b;
}

.dirty-dot {
  width: 7px;
  height: 7px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.draft-saved {
  font-size: 12px;
  color: var(--myst-ink-muted);
}

.kb-hint {
  font-size: 11px;
  color: color-mix(in srgb, var(--myst-ink-muted) 60%, transparent);
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

/* Draft restore banner */
.draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  margin-bottom: 20px;
  background: color-mix(in srgb, #f59e0b 10%, var(--myst-bg-2));
  border: 1px solid color-mix(in srgb, #f59e0b 40%, transparent);
  border-radius: 10px;
  flex-wrap: wrap;
}

.draft-banner-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--myst-ink);
  flex: 1;
}

.draft-banner-text svg {
  color: #f59e0b;
  flex-shrink: 0;
}

.draft-banner-actions {
  display: flex;
  gap: 8px;
}

.draft-restore-btn {
  padding: 6px 14px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.draft-restore-btn:hover { background: #d97706; }

.draft-dismiss-btn {
  padding: 6px 14px;
  background: none;
  color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.draft-dismiss-btn:hover {
  background: color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
  color: var(--myst-ink);
}

/* Controls */
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

.controls button:first-of-type { background: var(--myst-gold); color: var(--myst-bg); }
.controls button:first-of-type:hover { background: var(--myst-gold-soft); transform: translateY(-1px); }
.pin-btn { background: #f59e0b !important; color: white !important; }
.pin-btn:hover { background: #d97706 !important; transform: translateY(-1px); }
.delete-btn { background: #ef4444 !important; color: white !important; }
.delete-btn:hover { background: #dc2626 !important; transform: translateY(-1px); }

/* Split layout */
.split-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.split-layout .editor-form {
  flex: 1;
  min-width: 0;
}

/* Live preview pane */
.live-preview-pane {
  flex: 1;
  min-width: 0;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  background: var(--myst-bg-2);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  display: flex;
  flex-direction: column;
}

.live-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  font-size: 13px;
  font-weight: 600;
  color: var(--myst-ink-muted);
  position: sticky;
  top: 0;
  background: var(--myst-bg-2);
  z-index: 1;
}

.live-preview-lang {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  color: var(--myst-gold);
  font-weight: 700;
}

.live-preview-body {
  padding: 24px;
  flex: 1;
}

.live-preview-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--myst-ink-strong, var(--myst-ink));
  margin: 0 0 12px;
  line-height: 1.3;
}

.live-preview-desc {
  font-size: 14px;
  color: var(--myst-ink-muted);
  font-style: italic;
  margin: 0 0 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
}

/* Editor form */
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
.form-group textarea.error { border-color: #ef4444; }

.form-group input.error:focus,
.form-group select.error:focus,
.form-group textarea.error:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }

.field-error { color: #ef4444; font-size: 12px; font-weight: 500; margin-top: 4px; }

.form-group textarea {
  height: 380px;
  resize: vertical;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  line-height: 1.6;
}

.form-group label input[type="checkbox"] { width: auto; margin-right: 12px; transform: scale(1.1); }

/* Content label row */
.content-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.split-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: none;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  border-radius: 6px;
  color: var(--myst-ink-muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.split-view-btn:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
}

/* Markdown toolbar */
.md-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-radius: 8px 8px 0 0;
  border-bottom: none;
  flex-wrap: wrap;
}

.md-toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  padding: 0;
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--myst-ink-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.md-toolbar-btn:hover {
  background: color-mix(in srgb, var(--myst-gold) 12%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-gold);
}

.italic-btn em { font-style: italic; }

.toolbar-sep {
  width: 1px;
  height: 20px;
  background: color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  margin: 0 4px;
  flex-shrink: 0;
}

/* Textarea visually connected to toolbar + pathway bar above it */
.form-group textarea {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

/* Content stats */
.content-stats {
  display: flex;
  gap: 6px;
  font-size: 11px;
  color: color-mix(in srgb, var(--myst-ink-muted) 70%, transparent);
  margin-top: 4px;
}

.stats-sep { opacity: 0.5; }

/* Form actions */
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
  gap: 8px;
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

.cancel-btn:hover { background: var(--myst-ink); transform: translateY(-1px); }

.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.preview-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.preview-btn:disabled {
  background: color-mix(in srgb, var(--myst-ink-muted) 50%, transparent);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.5;
}

/* Spinners / feedback */
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

.error-msg {
  background: color-mix(in srgb, #ef4444 15%, transparent);
  color: #ef4444;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, #ef4444 40%, transparent);
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
}

/* Pathway picker */
.pathway-picker-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
  padding: 6px 10px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-top: none;
  border-bottom: none;
}

.pathway-picker-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: none;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent);
  border-radius: 5px;
  color: var(--myst-gold);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pathway-picker-toggle:hover { background: color-mix(in srgb, var(--myst-gold) 10%, var(--myst-bg)); }

.pathway-picker-hint { font-size: 11px; color: var(--myst-ink-muted); }

.pathway-picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px;
  background: var(--myst-bg);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  border-top: none;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.pathway-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  min-width: 52px;
}

.pathway-picker-item:hover {
  background: color-mix(in srgb, var(--myst-gold) 12%, transparent);
  border-color: color-mix(in srgb, var(--myst-gold) 40%, transparent);
}

.pathway-picker-img { width: 32px; height: 32px; object-fit: contain; }

.pathway-picker-label {
  font-size: 10px;
  color: var(--myst-ink-muted);
  text-transform: capitalize;
  white-space: nowrap;
}

/* Preview modal */
.preview-modal {
  position: fixed;
  inset: 0;
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
  from { opacity: 0; }
  to { opacity: 1; }
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
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.preview-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--myst-ink); }

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

.preview-body { overflow-y: auto; padding: 32px; flex: 1; }

.preview-article { max-width: 800px; margin: 0 auto; }

.preview-article-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
}

.preview-article-title { font-size: 32px; font-weight: 700; color: var(--myst-ink); margin: 0 0 16px 0; line-height: 1.2; }

.preview-article-meta { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

.preview-language, .preview-status, .preview-pinned {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.preview-language { background: color-mix(in srgb, var(--myst-gold) 20%, transparent); color: var(--myst-gold); }
.preview-status.published { background: color-mix(in srgb, #10b981 20%, transparent); color: #10b981; }
.preview-status.draft { background: color-mix(in srgb, var(--myst-ink-muted) 30%, transparent); color: var(--myst-ink-muted); }
.preview-pinned { background: color-mix(in srgb, #f59e0b 20%, transparent); color: #f59e0b; }

.preview-short-description { font-size: 16px; color: var(--myst-ink-muted); margin-bottom: 24px; line-height: 1.6; font-style: italic; }

.preview-image-wrapper { margin-bottom: 32px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
.preview-image { width: 100%; height: auto; display: block; }

/* Shared article content styles (preview modal + live preview) */
.preview-article-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--myst-ink);
}

.preview-article-content :deep(h1),
.preview-article-content :deep(h2),
.preview-article-content :deep(h3),
.preview-article-content :deep(h4),
.preview-article-content :deep(h5),
.preview-article-content :deep(h6) {
  color: var(--myst-ink);
  font-weight: 700;
  margin-top: 32px;
  margin-bottom: 16px;
  line-height: 1.3;
}

.preview-article-content :deep(h1) { font-size: 28px; color: var(--myst-gold); }
.preview-article-content :deep(h2) { font-size: 24px; }
.preview-article-content :deep(h3) { font-size: 20px; }
.preview-article-content :deep(h4) { font-size: 18px; }
.preview-article-content :deep(p) { margin-bottom: 16px; }
.preview-article-content :deep(a) { color: var(--myst-gold); text-decoration: underline; transition: color 0.2s ease; }
.preview-article-content :deep(a:hover) { color: var(--myst-gold-soft); }

.preview-article-content :deep(img.pathway-emoji) {
  display: inline;
  width: auto;
  height: 1.5em;
  vertical-align: -0.35em;
  margin: 0 0.1em;
  border-radius: 2px;
}

.preview-article-content :deep(img:not(.pathway-emoji)) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 24px 0;
  display: block;
}

.preview-article-content :deep(ul),
.preview-article-content :deep(ol) { margin-bottom: 16px; padding-left: 24px; }
.preview-article-content :deep(li) { margin-bottom: 8px; }

.preview-article-content :deep(blockquote) {
  border-left: 4px solid var(--myst-gold);
  padding-left: 20px;
  margin: 24px 0;
  font-style: italic;
  color: var(--myst-ink-muted);
}

.preview-article-content :deep(code) {
  background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
}

.preview-article-content :deep(pre) {
  background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 24px 0;
}

.preview-article-content :deep(pre code) { background: none; padding: 0; }

.preview-article-content :deep(table) { width: 100%; border-collapse: collapse; margin: 16px 0; }
.preview-article-content :deep(th),
.preview-article-content :deep(td) { padding: 8px 12px; border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent); }
.preview-article-content :deep(th) { background: color-mix(in srgb, var(--myst-gold) 10%, transparent); color: var(--myst-gold); font-weight: 600; }
</style>
