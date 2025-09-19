<template>
  <div class="page-container">
    <HeaderItem />

    <!-- Hero Section -->
    <section
      class="hero-section"
      :style="heroStyle"
      role="banner"
    >
      <!-- Overlay for readability -->
      <div
        class="hero-overlay"
        aria-hidden="true"
      />

      <!-- Content -->
      <div class="hero-content">
        <FadeInSection>
          <button
            @click="showJoinModal = true"
            class="play-button"
          >
            {{ t('home.letsPlay') }}
          </button>
        </FadeInSection>
      </div>

      <!-- Down Arrow -->
      <button
        @click="scrollToFeatures"
        class="scroll-arrow"
        aria-label="Scroll to features"
      >
        <IconArrowDown class="w-6 h-6" />
      </button>

      <!-- Wavy Divider -->
      <div class="wavy-divider" aria-hidden="true">
        <svg class="w-full block" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path
            d="M0,64 C120,80 240,48 360,48 C480,48 600,80 720,74 C840,68 960,32 1080,37 C1200,43 1320,74 1440,80 L1440,160 L0,160 Z"
            fill="var(--myst-bg)"
          />
        </svg>
      </div>
    </section>

    <!-- Features Section (previously embedded in hero) -->
    <section class="features-section relative" id="features">
      <div class="features-container">
        <FadeInSection delay="100">
          <div class="features-grid">
            <div
              class="feature-card"
              v-for="(feature, index) in features"
              :key="index"
            >
              <div class="feature-header">
                <component :is="feature.icon" class="feature-icon" />
                <span class="feature-title">{{ feature.title }}</span>
              </div>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>

    <!-- Pinned News Section -->
    <section v-if="pinnedNews.length > 0" class="pinned-news-section relative">
      <div class="news-container">
        <SectionTitle
          :eyebrow="t('home.pinnedNewsEyebrow')"
          :title="t('home.pinnedNewsTitle')"
          :subtitle="t('home.pinnedNewsSubtitle')"
        />
        <FadeInSection>
          <div class="pinned-news-grid">
            <div class="news-card news-card--pinned" v-for="n in displayedPinnedNews" :key="n.id">
              <!-- Pinned badge -->
              <div class="pinned-badge">
                <IconStars class="w-4 h-4" />
                <span>{{ t('home.pinnedNews') }}</span>
              </div>
              <div class="news-image">
                <img
                  :src="n.preview || 'https://via.placeholder.com/400x220/1a1e3a/c8b273?text=News+Image'"
                  :alt="`Image for ${n.title}`"
                  class="news-img"
                />
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ n.title }}</h3>
                <p class="news-text">{{ n.shortDescription || n.preview }}</p>
                <div class="news-link-container">
                  <RouterLink :to="`/news/${n.slug}`" class="news-link">
                    {{ t('home.readMore') }}
                    <IconArrowRight class="h-4 w-4" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        <!-- Load More Pinned Button -->
        <div v-if="!showAllPinned && pinnedNews.length > 2" class="load-more-container">
          <button @click="showAllPinned = true" class="load-more-button load-more-button--pinned">
            {{ t('home.loadMorePinned') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Latest News Section -->
    <section class="news-section relative">
      <div class="news-container">
        <SectionTitle
          :eyebrow="t('home.newsEyebrow')"
          :title="t('home.newsTitle')"
          :subtitle="t('home.newsSubtitle')"
        />
        <FadeInSection>
          <div class="news-grid">
            <div class="news-card" v-for="n in displayedNews" :key="n.id">
              <div class="news-image">
                <img
                  :src="n.preview || 'https://via.placeholder.com/400x220/1a1e3a/c8b273?text=News+Image'"
                  :alt="`Image for ${n.title}`"
                  class="news-img"
                />
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ n.title }}</h3>
                <p class="news-text">{{ n.shortDescription || n.preview }}</p>
                <div class="news-link-container">
                  <RouterLink :to="`/news/${n.slug}`" class="news-link">
                    {{ t('home.readMore') }}
                    <IconArrowRight class="h-4 w-4" />
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
        
        <!-- Load More Button -->
        <div v-if="!showAllNews && news.length > 3" class="load-more-container">
          <button @click="showAllNews = true" class="load-more-button">
            {{ t('home.loadAdditional') }}
          </button>
        </div>
      </div>
    </section>

    <FooterItem />

    <!-- Join Server Modal -->
    <JoinServerModal :show="showJoinModal" @close="showJoinModal = false" />
  </div>
</template>

<script setup lang="ts">
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import FadeInSection from "@/components/ui/FadeInSection.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";
import JoinServerModal from "@/components/ui/JoinServerModal.vue";
import IconArrowRight from "@/assets/icons/IconArrowRight.vue";
import IconArrowDown from "@/assets/icons/IconArrowDown.vue";
import IconStars from "@/assets/icons/IconStars.vue";
import IconGamepad from "@/assets/icons/IconGamepad.vue";
import IconUsers from "@/assets/icons/IconUsers.vue";
import { onMounted, ref, computed } from "vue";
import { newsAPI } from "@/utils/api/news";
import type { NewsArticle, NewsPreview } from "@/types/news";
import { useI18n } from "@/composables/useI18n";
import bannerWebp from "@/assets/images/optimized/banner.webp";

const { t, currentLanguage } = useI18n();
const news = ref<NewsArticle[]>([]);
const pinnedNews = ref<NewsPreview[]>([]);
const showJoinModal = ref(false);
const showAllNews = ref(false);
const showAllPinned = ref(false);


const heroStyle = computed(() => ({
  // Use optimized WebP for maximum performance
  backgroundImage: `url('${bannerWebp}')`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  minHeight: 'min(100vh, 960px)',
}));

function scrollToFeatures() {
  const el = document.querySelector('#features');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

onMounted(async () => {
  try {
    // Fetch regular latest news and pinned news separately
    const [latestResponse, pinnedResponse] = await Promise.all([
      newsAPI.getLatest(currentLanguage.value),
      newsAPI.getPinned(currentLanguage.value)
    ]);

    news.value = latestResponse.data;
    pinnedNews.value = pinnedResponse.data;
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }
});

const displayedNews = computed(() => {
  // Sort by publish date (newest first) - no need to sort by pinned since they're separate now
  const sortedNews = [...news.value].sort((a, b) => {
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });
  return showAllNews.value ? sortedNews : sortedNews.slice(0, 3);
});

const displayedPinnedNews = computed(() => {
  // Sort pinned by publish date (newest first)
  const sortedPinned = [...pinnedNews.value].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  return showAllPinned.value ? sortedPinned : sortedPinned.slice(0, 2);
});

const features = [
  {
    icon: IconStars,
    title: t("home.featureEldritchLoreTitle"),
    description: t("home.featureEldritchLoreDescription"),
  },
  {
    icon: IconGamepad,
    title: t("home.featureVictorianCraftTitle"),
    description: t("home.featureVictorianCraftDescription"),
  },
  {
    icon: IconUsers,
    title: t("home.featureSecretSocietiesTitle"),
    description: t("home.featureSecretSocietiesDescription"),
  },
];
</script>

<script lang="ts">
export default {
  name: "HomeView",
};
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  position: relative;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-attachment: fixed;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  /* Enable hardware acceleration for smooth scrolling */
  will-change: transform;
  transform: translateZ(0);
}

/* Disable fixed attachment on mobile for better performance */
@media (max-width: 768px) {
  .hero-section {
    background-attachment: scroll;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4));
}

.hero-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 16px 120px;
}

.play-button {
  background: rgba(255, 255, 255, 0.95);
  color: #1a1e3a;
  border: none;
  padding: 20px 48px;
  font-size: 24px;
  font-weight: 700;
  font-family: "Inter", serif;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.play-button:hover {
  background: white;
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  scale: 1.05;
}

.scroll-arrow {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  width: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #1a1e3a;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.scroll-arrow:hover {
  background: white;
  transform: translateX(-50%) translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.wavy-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 5;
}

/* Features Section */
.features-section {
  position: relative;
  background: var(--myst-bg);
  padding: 80px 0;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Features Grid */
.features-grid {
  margin-top: 48px;
  display: grid;
  gap: 16px;
}

@media (min-width: 640px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.feature-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  padding: 24px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.feature-icon {
  width: 20px;
  height: 20px;
  color: var(--myst-gold);
}

.feature-title {
  color: var(--myst-ink-strong);
  font-weight: 600;
}

.feature-description {
  color: #a1a1aa;
  font-size: 14px;
}

/* Pinned News Section */
.pinned-news-section {
  position: relative;
  background: linear-gradient(135deg,
    var(--myst-bg),
    color-mix(in srgb, var(--myst-gold) 3%, var(--myst-bg))
  );
  border-top: 1px solid color-mix(in srgb, var(--myst-gold) 15%, transparent);
  border-bottom: 1px solid color-mix(in srgb, var(--myst-gold) 15%, transparent);
  padding-top: 80px;
}

.pinned-news-grid {
  margin-top: 24px;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 16px;
  margin: 24px -16px 0;
}

.pinned-news-grid .news-card {
  flex-shrink: 0;
  width: 90%;
}

.pinned-news-grid::-webkit-scrollbar {
  display: none;
}

@media (min-width: 640px) {
  .pinned-news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 24px 0 0;
    padding: 0;
    overflow: visible;
    gap: 24px;
  }

  .pinned-news-grid .news-card {
    width: auto;
  }
}

@media (min-width: 1024px) {
  .pinned-news-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

.load-more-button--pinned {
  background: color-mix(in srgb, var(--myst-gold) 15%, var(--myst-bg-2) 80%);
  border: 1px solid var(--myst-gold);
  color: var(--myst-gold);
}

.load-more-button--pinned:hover {
  background: color-mix(in srgb, var(--myst-gold) 20%, transparent);
  border-color: var(--myst-gold);
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.3);
}

/* News Section */
.news-section {
  position: relative;
  padding-top: 80px;
}

.news-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px 80px;
}

.news-grid {
  margin-top: 24px;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 0 16px;
  margin: 24px -16px 0;
}

.news-grid::-webkit-scrollbar {
  display: none;
}

@media (min-width: 640px) {
  .news-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    margin: 24px 0 0;
    padding: 0;
    overflow: visible;
  }
}

@media (min-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

.news-card {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, white 10%, transparent);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  scroll-snap-align: center;
  flex-shrink: 0;
  width: 85%;
}

@media (min-width: 640px) {
  .news-card {
    width: auto;
  }
}

.news-card:hover {
  border-color: color-mix(in srgb, var(--myst-gold) 30%, transparent);
}

.news-image {
  overflow: hidden;
}

.news-img {
  width: 100%;
  height: 176px;
  object-fit: cover;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.news-card:hover .news-img {
  opacity: 1;
}

.news-content {
  padding: 24px;
}

.news-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--myst-ink-strong);
  margin-bottom: 8px;
}

.news-text {
  color: #a1a1aa;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.news-link-container {
  margin-top: 16px;
}

.news-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--myst-gold);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.news-link:hover {
  text-decoration: underline;
}

/* Pinned news styles */
.news-card--pinned {
  border-color: var(--myst-gold) !important;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--myst-bg-2) 85%, transparent),
    color-mix(in srgb, var(--myst-gold) 5%, var(--myst-bg-2) 85%)
  );
  position: relative;
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.15);
}

.news-card--pinned:hover {
  border-color: var(--myst-gold) !important;
  box-shadow: 0 8px 24px rgba(200, 178, 115, 0.25);
  transform: translateY(-2px);
}

.pinned-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, var(--myst-gold), #e6cc85);
  color: var(--myst-bg);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(200, 178, 115, 0.3);
  backdrop-filter: blur(10px);
}

.pinned-badge span {
  font-size: 11px;
}

/* Load More Button */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.load-more-button {
  background: color-mix(in srgb, var(--myst-bg-2) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent);
  color: var(--myst-gold);
  padding: 12px 32px;
  border-radius: 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.load-more-button:hover {
  background: color-mix(in srgb, var(--myst-gold) 10%, transparent);
  border-color: var(--myst-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(200, 178, 115, 0.2);
}

/* Stats Section */
.stats-section {
  position: relative;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px 80px;
}
</style>
