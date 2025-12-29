<template>
  <div class="category-selector">
    <!-- Header -->
    <div class="category-header">
      <h2>{{ t('selectCategory') }}</h2>
      <p>{{ t('selectCategoryDescription') }}</p>
    </div>

    <!-- Category Grid -->
    <div class="category-grid">
      <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="handleCategoryClick(category.id)"
      >
        <!-- Thumbnail Image -->
        <div class="category-thumbnail">
          <img :alt="category.name" :src="category.thumbnailUrl"/>
          <div class="category-overlay">
            <i class="fa-solid fa-arrow-right"></i>
          </div>
        </div>

        <!-- Category Info -->
        <div class="category-info">
          <h3>{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
          <div class="category-count">
            <i class="fa-solid fa-box"></i>
            <span>{{ category.itemCount }} {{ t('itemsCount') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed} from 'vue';
import {useI18n} from '@/composables/useI18n';
import {useBalanceStore} from '@/stores/balance';
import type {CategoryInfo} from '@/types/services';

const emit = defineEmits<{
  (e: 'select-category', categoryId: string): void;
}>();

const {t} = useI18n();
const shopStore = useBalanceStore();
const items = computed(() => shopStore.items);

// Extract categories from items
const categories = computed<CategoryInfo[]>(() => {
  const categoryMap = new Map<string, CategoryInfo>();

  items.value.forEach(item => {
    if (!item.category || !item.is_active) return;

    const categoryId = item.category;
    if (!categoryMap.has(categoryId)) {
      // Use category thumbnail from item (backend provides this)
      categoryMap.set(categoryId, {
        id: categoryId,
        name: getCategoryName(categoryId),
        description: getCategoryDescription(categoryId),
        thumbnailUrl: item.categoryThumbnail || item.image || '',
        itemCount: 0
      });
    }

    const category = categoryMap.get(categoryId)!;
    category.itemCount++;
  });

  return Array.from(categoryMap.values())
      .filter(cat => cat.itemCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
});

const getCategoryName = (categoryId: string): string => {
  // Normalize category ID: remove spaces, capitalize properly
  // "Dungeon Keys" -> "DungeonKeys", "battlepass" -> "Battlepass"
  const normalizedId = categoryId
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

  const key = `shopCategory${normalizedId}`;
  const translated = t(key);

  // If translation key not found, return the original category ID
  return translated === key ? categoryId : translated;
};

const getCategoryDescription = (categoryId: string): string => {
  // Normalize category ID: remove spaces, capitalize properly
  const normalizedId = categoryId
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

  const key = `shopCategory${normalizedId}Desc`;
  const translated = t(key);

  // If translation key not found, return empty string
  return translated === key ? '' : translated;
};

const handleCategoryClick = (categoryId: string) => {
  emit('select-category', categoryId);
};
</script>

<style scoped>
/* Category Selector Container */
.category-selector {
  padding: 20px 0;
}

/* Header */
.category-header {
  text-align: center;
  margin-bottom: 40px;
}

.category-header h2 {
  color: var(--myst-ink-strong);
  font-size: 32px;
  font-weight: 700;
  font-family: 'Inter', system-ui, sans-serif;
  margin-bottom: 12px;
}

.category-header p {
  color: var(--myst-ink-muted);
  font-size: 16px;
  max-width: 600px;
  margin: 0 auto;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Category Card */
.category-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.category-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: color-mix(in srgb, var(--myst-gold) 50%, transparent);
  box-shadow: 0 12px 32px color-mix(in srgb, var(--myst-bg) 60%, transparent),
  0 0 24px color-mix(in srgb, var(--myst-gold) 20%, transparent);
}

/* Thumbnail Container */
.category-thumbnail {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--myst-bg) 90%, transparent),
      color-mix(in srgb, var(--myst-bg-2) 70%, transparent)
  );
}

.category-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover .category-thumbnail img {
  transform: scale(1.1);
}

/* Overlay */
.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: color-mix(in srgb, var(--myst-gold) 0%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover .category-overlay {
  background: color-mix(in srgb, var(--myst-gold) 15%, transparent);
  opacity: 1;
}

.category-overlay i {
  color: var(--myst-gold);
  font-size: 48px;
  transform: translateX(-20px);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.category-card:hover .category-overlay i {
  transform: translateX(0);
}

/* Category Info */
.category-info {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.category-info h3 {
  color: var(--myst-ink-strong);
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.category-card:hover .category-info h3 {
  color: var(--myst-gold);
}

.category-description {
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
}

.category-count {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--myst-ink);
  font-size: 14px;
  font-weight: 500;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 10%, transparent);
}

.category-count i {
  color: var(--myst-gold);
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .category-header h2 {
    font-size: 28px;
  }

  .category-thumbnail {
    height: 160px;
  }

  .category-info {
    padding: 20px;
  }
}

@media (max-width: 576px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-header h2 {
    font-size: 24px;
  }

  .category-header p {
    font-size: 14px;
  }

  .category-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}
</style>
