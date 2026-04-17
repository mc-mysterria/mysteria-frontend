<template>
  <div class="catalog-selector">
    <!-- Header -->
    <div class="myst-page-header">
      <div class="myst-header-decoration" aria-hidden="true"></div>
      <h2 class="myst-header-label">{{ t('shopTitle') || 'Catalogue' }}</h2>
      <div class="myst-header-decoration" aria-hidden="true"></div>
    </div>

    <!-- Category Grid -->
    <div class="catalog-grid">
      <div
          v-for="(category, index) in categories"
          :key="category.id"
          class="catalog-card"
          :style="{ '--delay': `${index * 0.1}s` }"
          @click="handleCategoryClick(category.id)"
      >
        <!-- Card Background Elements -->
        <div class="card-glow"></div>
        <div class="card-border-frame"></div>

        <!-- Thumbnail Image Section -->
        <div class="card-visual">
          <div class="image-container">
            <img :alt="category.name" :src="category.thumbnailUrl" class="category-img"/>
            <div class="image-noise"></div>
          </div>
          <div class="visual-overlay">
            <div class="explore-hint">
              <span class="hint-text">EXPLORE</span>
              <div class="hint-arrow"></div>
            </div>
          </div>
        </div>

        <!-- Category Info Section -->
        <div class="card-content">
          <div class="content-top">
            <h3 class="category-title">{{ category.name }}</h3>
            <div class="category-tag">{{ t('itemsCount').split(' ')[0] }}</div>
          </div>
          <p class="category-desc">{{ category.description }}</p>
          
          <div class="content-footer">
            <div class="item-stat">
              <span class="stat-value">{{ category.itemCount }}</span>
              <span class="stat-label">Manifestations</span>
            </div>
            <div class="footer-decoration"></div>
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

const categories = computed<CategoryInfo[]>(() => {
  const categoryMap = new Map<string, CategoryInfo>();
  items.value.forEach(item => {
    if (!item.category || !item.is_active) return;
    const categoryId = item.category;
    if (!categoryMap.has(categoryId)) {
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
  const normalizedId = categoryId.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  const key = `shopCategory${normalizedId}`;
  const translated = t(key);
  return translated === key ? categoryId : translated;
};

const getCategoryDescription = (categoryId: string): string => {
  const normalizedId = categoryId.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  const key = `shopCategory${normalizedId}Desc`;
  const translated = t(key);
  return translated === key ? '' : translated;
};

const handleCategoryClick = (categoryId: string) => {
  emit('select-category', categoryId);
};
</script>

<style scoped>
/* CARTOGRAPHER'S CATALOG THEME */

.catalog-selector {
  padding: 40px 0;
  position: relative;
}

/* Header Refinement */
.catalog-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 64px;
  text-align: center;
}

.header-line {
  flex: 1;
  height: 1px;
  max-width: 150px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
}

.eyebrow {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--myst-gold);
  text-transform: uppercase;
  letter-spacing: 5px;
  margin-bottom: 8px;
}

.title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: var(--myst-offwhite);
  margin: 0;
  font-weight: 700;
  max-width: 500px;
  line-height: 1.3;
}

/* Catalog Grid */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Catalog Card - Floating Island Style */
.catalog-card {
  position: relative;
  background: rgba(13, 16, 30, 0.6);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes cardEntrance {
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.catalog-card:hover {
  transform: translateY(-12px);
  background: rgba(20, 24, 45, 0.8);
}

/* Visual Framing */
.card-border-frame {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.05);
  pointer-events: none;
  z-index: 5;
  transition: border-color 0.3s ease;
}

.catalog-card:hover .card-border-frame {
  border-color: rgba(200, 178, 115, 0.3);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 50% 50%, rgba(200, 178, 115, 0.05) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 1;
  pointer-events: none;
}

.catalog-card:hover .card-glow {
  opacity: 1;
}

/* Visual Area */
.card-visual {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.image-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.category-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.8) contrast(1.1) brightness(0.8);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
}

.image-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.15;
  mix-blend-mode: overlay;
  pointer-events: none;
}

.catalog-card:hover .category-img {
  transform: scale(1.1);
  filter: saturate(1.1) contrast(1.2) brightness(1);
}

/* Overlay Interaction */
.visual-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 10, 20, 0.8) 0%, transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 24px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.catalog-card:hover .visual-overlay {
  opacity: 1;
}

.explore-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  transform: translateY(10px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.catalog-card:hover .explore-hint {
  transform: translateY(0);
}

.hint-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
  letter-spacing: 3px;
}

.hint-arrow {
  width: 30px;
  height: 1px;
  background: var(--myst-gold);
  position: relative;
}

.hint-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: -3px;
  width: 6px;
  height: 6px;
  border-top: 1px solid var(--myst-gold);
  border-right: 1px solid var(--myst-gold);
  transform: rotate(45deg);
}

/* Content Area */
.card-content {
  padding: 32px;
  position: relative;
  z-index: 2;
  background: linear-gradient(180deg, transparent 0%, rgba(8, 10, 20, 0.4) 100%);
}

.content-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.category-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: var(--myst-offwhite);
  margin: 0;
  font-weight: 700;
  transition: color 0.3s ease;
}

.catalog-card:hover .category-title {
  color: var(--myst-gold);
}

.category-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 4px 8px;
  border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold);
  border-radius: 2px;
  text-transform: uppercase;
}

.category-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.content-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-stat {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--myst-gold);
}

.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #555;
}

.footer-decoration {
  height: 1px;
  flex: 1;
  margin-left: 20px;
  background: linear-gradient(90deg, rgba(200, 178, 115, 0.2) 0%, transparent 100%);
}

/* Responsive Overrides */
@media (max-width: 768px) {
  .catalog-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .title {
    font-size: 24px;
  }

  .catalog-header {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 40px;
  }

  .header-line {
    max-width: 100px;
  }
}
</style>
