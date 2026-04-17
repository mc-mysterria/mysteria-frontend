<template>
  <div class="page-container home-mystic">
    <HeaderItem/>

    <!-- Hero Section -->
    <section class="hero-section" role="banner">
      <!-- Layered backgrounds -->
      <div
          :style="{ backgroundImage: `url('${heroImages[activeImageIndex]}')` }"
          class="hero-background hero-bg-base"
      />
      <div
          v-if="isTransitioning"
          :style="{ backgroundImage: `url('${heroImages[transitionTarget]}')` }"
          class="hero-background hero-bg-overlay"
      />

      <div class="mystic-noise" aria-hidden="true"></div>
      <div class="hero-overlay" aria-hidden="true"></div>

      <!-- Hero Content -->
      <div class="hero-content">
        <FadeInSection>
          <div class="hero-ritual-box">
            <h1 class="hero-ritual-title">{{ t('serverName') }}</h1>
            <p class="hero-ritual-subtitle">{{ t('home.heroSubtitleHome') }}</p>
            
            <div class="hero-buttons">
              <button class="btn-ritual-primary" @click="showJoinModal = true">
                {{ t('home.letsPlay') }}
              </button>
              <a class="btn-ritual-secondary" href="https://wiki.mysterria.net" target="_blank">
                <IconWiki class="btn-icon"/>
                {{ t('home.wiki') }}
              </a>
            </div>
          </div>
        </FadeInSection>
      </div>

      <!-- Down Arrow -->
      <button aria-label="Scroll to news" class="scroll-ritual" @click="scrollToNews">
        <IconArrowDown class="w-6 h-6"/>
      </button>

      <!-- Ink Transition -->
      <div class="ink-transition" aria-hidden="true"></div>
    </section>

    <!-- Beyonder Statistics Section -->
    <BeyonderStatistics/>

    <!-- Pinned News -->
    <section v-if="pinnedNews.length > 0" id="pinned-news" class="pinned-news-section">
      <div class="news-container">
        <div class="myst-page-header compact">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h2 class="myst-header-label">{{ t('home.pinnedNewsTitle') }}</h2>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>
        
        <FadeInSection>
          <div :class="{ 'pinned-news-grid--single': displayedPinnedNews.length === 1 }" class="pinned-news-grid">
            <RouterLink v-for="n in displayedPinnedNews" :key="n.id" :to="`/news/${n.slug}`" class="pinned-card-myst">
              <div class="pinned-image-area">
                <img :src="n.preview || 'https://via.placeholder.com/300x160/05070a/c8b273'" class="pinned-img" alt="pinned"/>
              </div>
              <div class="pinned-info-area">
                <h3 class="pinned-title">
                  <IconStars class="pinned-star"/>
                  {{ n.title }}
                </h3>
                <p class="pinned-desc">{{ n.shortDescription || n.preview }}</p>
                <div class="pinned-action">
                  <span class="link-ritual">{{ t('home.readMore') }} †</span>
                </div>
              </div>
            </RouterLink>
          </div>
        </FadeInSection>
      </div>
    </section>

    <!-- Latest News -->
    <section id="news" class="news-section">
      <div class="news-container">
        <div class="myst-page-header compact">
          <div class="myst-header-decoration" aria-hidden="true"></div>
          <h2 class="myst-header-label">{{ t('home.newsTitle') }}</h2>
          <div class="myst-header-decoration" aria-hidden="true"></div>
        </div>

        <FadeInSection>
          <div class="news-ledger">
            <RouterLink v-for="n in displayedNews" :key="n.id" :to="`/news/${n.slug}`" class="news-entry">
              <div class="entry-meta">
                <span class="entry-date">{{ formatDate(n.publishedAt || n.createdAt) }}</span>
              </div>
              <h3 class="entry-title">{{ n.title }}</h3>
              <p class="entry-text">{{ n.shortDescription || n.preview }}</p>
              <div class="entry-action">
                <span class="link-ritual-sm">{{ t('home.readMore') }}</span>
              </div>
            </RouterLink>
          </div>
        </FadeInSection>

        <div v-if="!showAllNews && news.length > 3" class="load-more-ritual">
          <button class="btn-ritual-outline" @click="showAllNews = true">
            {{ t('home.loadAdditional') }}
          </button>
        </div>
      </div>
    </section>

    <FooterItem/>
    <JoinServerModal :show="showJoinModal" @close="showJoinModal = false"/>
  </div>
</template>

<script lang="ts" setup>
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import FadeInSection from "@/components/ui/FadeInSection.vue";
import JoinServerModal from "@/components/ui/JoinServerModal.vue";
import BeyonderStatistics from "@/components/home/BeyonderStatistics.vue";
import IconArrowDown from "@/assets/icons/IconArrowDown.vue";
import IconStars from "@/assets/icons/IconStars.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import {computed, onMounted, onUnmounted, ref} from "vue";
import {newsAPI} from "@/utils/api/news";
import type {NewsArticle, NewsPreview} from "@/types/news";
import {useI18n} from "@/composables/useI18n";
import bannerWebp from "@/assets/images/optimized/banner.webp";
import serverWebp from "@/assets/images/optimized/Server.webp";
import kleinWebp from "@/assets/images/optimized/Klein.webp";

const {t, currentLanguage} = useI18n();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const news = ref<NewsArticle[]>([]);
const pinnedNews = ref<NewsPreview[]>([]);
const showJoinModal = ref(false);
const showAllNews = ref(false);
const showAllPinned = ref(false);
const activeImageIndex = ref(0);
const transitionTarget = ref(1);
const isTransitioning = ref(false);
let rotationInterval: NodeJS.Timeout | null = null;

const heroImages = [kleinWebp, bannerWebp, serverWebp];

function startTransition(targetIndex: number) {
  if (isTransitioning.value) return;
  if (rotationInterval) { clearInterval(rotationInterval); rotationInterval = null; }
  transitionTarget.value = targetIndex;
  isTransitioning.value = true;
  setTimeout(() => {
    activeImageIndex.value = targetIndex;
    isTransitioning.value = false;
    startAutoRotation();
  }, 2000);
}

function startAutoRotation() {
  if (rotationInterval) return;
  rotationInterval = setInterval(() => {
    if (!isTransitioning.value) {
      const nextIndex = (activeImageIndex.value + 1) % heroImages.length;
      startTransition(nextIndex);
    }
  }, 8000);
}

function scrollToNews() {
  const targetId = pinnedNews.value.length > 0 ? '#pinned-news' : '#news';
  const targetEl = document.querySelector(targetId);
  if (targetEl) targetEl.scrollIntoView({behavior: 'smooth'});
}

onMounted(async () => {
  try {
    const [latestRes, pinnedRes] = await Promise.all([
      newsAPI.getLatest(currentLanguage.value),
      newsAPI.getPinned(currentLanguage.value)
    ]);
    news.value = latestRes.data;
    pinnedNews.value = pinnedRes.data;
  } catch (e) { console.error(e); }
  startAutoRotation();
});

onUnmounted(() => { if (rotationInterval) clearInterval(rotationInterval); });

const displayedNews = computed(() => {
  const sorted = [...news.value].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  return showAllNews.value ? sorted : sorted.slice(0, 3);
});

const displayedPinnedNews = computed(() => {
  const sorted = [...pinnedNews.value].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return showAllPinned.value ? sorted : sorted.slice(0, 2);
});
</script>

<style scoped>
.page-container { min-height: 100vh; background-color: #05070a; }

/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  will-change: opacity;
}

.hero-bg-overlay { z-index: 2; animation: fadeIn 2s ease forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.mystic-noise {
  position: absolute;
  inset: 0;
  z-index: 3;
  background-image: url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
  opacity: 0.1;
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: radial-gradient(circle at 50% 50%, rgba(5, 7, 10, 0.3) 0%, rgba(5, 7, 10, 0.7) 100%),
              linear-gradient(to bottom, rgba(5,7,10,0.9) 0%, transparent 40%, rgba(5,7,10,0.4) 70%, rgba(5,7,10,1) 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.hero-ritual-box {
  text-align: center;
  max-width: 1000px;
}

.hero-ritual-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.5rem, 10vw, 7.5rem);
  color: var(--myst-gold);
  margin-bottom: 16px;
  font-weight: 800;
  letter-spacing: -1px;
  text-shadow: 0 10px 40px rgba(0, 0, 0, 0.9), 0 0 30px rgba(200, 178, 115, 0.3);
  word-break: break-word;
}

.hero-ritual-subtitle {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(12px, 2vw, 16px);
  color: #fff;
  text-transform: uppercase;
  letter-spacing: clamp(2px, 1vw, 6px);
  margin-bottom: clamp(32px, 5vw, 56px);
  text-shadow: 0 2px 15px rgba(0, 0, 0, 1);
  opacity: 0.9;
  padding: 0 20px;
}

.hero-buttons {
  display: flex;
  gap: clamp(16px, 3vw, 32px);
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 20px;
}

.btn-ritual-primary {
  background: var(--myst-gold);
  color: #05070a;
  border: 1px solid var(--myst-gold);
  padding: clamp(14px, 2vw, 20px) clamp(32px, 5vw, 64px);
  font-family: 'Playfair Display', serif;
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-ritual-primary:hover {
  transform: translateY(-5px);
  background: #fff;
  border-color: #fff;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
}

.btn-ritual-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: clamp(14px, 2vw, 18px) clamp(32px, 5vw, 48px);
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(12px, 1.5vw, 14px);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(4px);
}

.btn-ritual-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  transform: translateY(-3px);
}

.scroll-ritual {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: none;
  border: none;
  color: var(--myst-gold);
  cursor: pointer;
  animation: bounce 2s infinite;
}

@keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); } 40% { transform: translateX(-50%) translateY(-10px); } 60% { transform: translateX(-50%) translateY(-5px); } }

.ink-transition {
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 100px;
  background: linear-gradient(to bottom, transparent, #05070a);
  z-index: 5;
}

/* News Styles */
.news-container { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }
.pinned-news-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px; margin-top: 40px; }

.pinned-card-myst {
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(200, 178, 115, 0.2);
  text-decoration: none;
  transition: all 0.3s ease;
}

.pinned-card-myst:hover {
  background: rgba(200, 178, 115, 0.03);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.pinned-image-area { width: 140px; flex-shrink: 0; border-right: 1px solid rgba(200, 178, 115, 0.1); }
.pinned-img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: opacity 0.3s; }
.pinned-card-myst:hover .pinned-img { opacity: 1; }

.pinned-info-area { padding: 24px; flex: 1; }
.pinned-title { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--myst-offwhite); margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
.pinned-star { width: 18px; color: var(--myst-gold); }
.pinned-desc { font-size: 14px; color: #888; line-height: 1.5; margin-bottom: 20px; }
.link-ritual { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--myst-gold); text-transform: uppercase; }

/* Latest News Ledger */
.news-ledger { border-top: 1px solid rgba(255, 255, 255, 0.05); }
.news-entry {
  display: block;
  padding: 32px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  transition: all 0.3s ease;
}

.news-entry:hover { padding-left: 20px; background: rgba(255, 255, 255, 0.01); }

.entry-meta { margin-bottom: 12px; }
.entry-date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--myst-gold); text-transform: uppercase; letter-spacing: 2px; }
.entry-title { font-family: 'Playfair Display', serif; font-size: 24px; color: var(--myst-offwhite); margin-bottom: 8px; transition: color 0.3s; }
.news-entry:hover .entry-title { color: var(--myst-gold); }
.entry-text { font-size: 15px; color: #666; max-width: 800px; margin-bottom: 16px; }
.link-ritual-sm { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; transition: color 0.3s; }
.news-entry:hover .link-ritual-sm { color: var(--myst-gold); }

.load-more-ritual { text-align: center; margin-top: 48px; }
.btn-ritual-outline {
  background: none; border: 1px solid rgba(200, 178, 115, 0.3);
  color: var(--myst-gold); padding: 12px 40px;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  text-transform: uppercase; cursor: pointer; transition: all 0.3s;
}

.btn-ritual-outline:hover { background: rgba(200, 178, 115, 0.1); border-color: var(--myst-gold); }

@media (max-width: 768px) {
  .hero-ritual-title { font-size: 4rem; }
  .hero-buttons { flex-direction: column; align-items: stretch; }
  .pinned-card-myst { flex-direction: column; }
  .pinned-image-area { width: 100%; height: 160px; border-right: none; border-bottom: 1px solid rgba(200, 178, 115, 0.1); }
}
</style>
