<template>
  <div class="min-h-screen relative">
    <HeaderItem />

    <!-- Hero Section -->
    <section class="hero-section relative">
      <div class="hero-container">
        <FadeInSection>
          <div class="hero-content">
            <h1 class="hero-title">
              Mysterria
              <span class="hero-subtitle">
                {{ t('home.heroSubtitleHome') }}
              </span>
            </h1>
            <p class="hero-description">
              {{ t('home.heroDescriptionHome') }}
            </p>
            <div class="hero-actions">
              <CopyIPButton ip="play.mysterria.gg" />
              <RouterLink to="/guide" class="guide-button">
                <IconWiki class="h-4 w-4" />
                {{ t('home.readGuide') }}
              </RouterLink>
            </div>
          </div>
        </FadeInSection>

        <!-- Quick Features -->
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

    <!-- News Section -->
    <section class="news-section relative">
      <div class="news-container">
        <SectionTitle
          :eyebrow="t('home.newsEyebrow')"
          :title="t('home.newsTitle')"
          :subtitle="t('home.newsSubtitle')"
        />
        <FadeInSection>
          <div class="news-grid">
            <div class="news-card" v-for="n in news" :key="n.id">
              <div class="news-image">
                <img
                  :src="n.preview || 'https://via.placeholder.com/400x220/1a1e3a/c8b273?text=News+Image'"
                  :alt="`Image for ${n.title}`"
                  class="news-img"
                />
              </div>
              <div class="news-content">
                <h3 class="news-title">{{ n.title }}</h3>
                <p class="news-text">{{ n.content }}</p>
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
      </div>
    </section>

    <FooterItem />
  </div>
</template>

<script setup lang="ts">
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import CopyIPButton from "@/components/ui/CopyIPButton.vue";
import FadeInSection from "@/components/ui/FadeInSection.vue";
import SectionTitle from "@/components/ui/SectionTitle.vue";
import IconWiki from "@/assets/icons/IconWiki.vue";
import IconArrowRight from "@/assets/icons/IconArrowRight.vue";
import IconStars from "@/assets/icons/IconStars.vue";
import IconGamepad from "@/assets/icons/IconGamepad.vue";
import IconUsers from "@/assets/icons/IconUsers.vue";
import { onMounted, ref } from "vue";
import { newsAPI } from "@/utils/api/news";
import type { NewsArticle } from "@/types/news";
import { useI18n } from "@/composables/useI18n";

const { t, currentLanguage } = useI18n();
const news = ref<NewsArticle[]>([]);

onMounted(async () => {
  try {
    const response = await newsAPI.getLatest(currentLanguage.value);
    news.value = response.data as unknown as NewsArticle[];
  } catch (error) {
    console.error("Failed to fetch news:", error);
  }
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
/* Hero Section */
.hero-section {
  position: relative;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 16px 80px;
}

.hero-content {
  max-width: 768px;
}

.hero-title {
  font-family: "MontserratBold", serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--myst-ink-strong);
  letter-spacing: -0.025em;
}

.hero-subtitle {
  display: block;
  font-size: clamp(1.25rem, 3vw, 2rem);
  margin-top: 8px;
  color: #a1a1aa;
}

.hero-description {
  margin-top: 16px;
  color: #a1a1aa;
  max-width: 512px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

@media (min-width: 640px) {
  .hero-actions {
    flex-direction: row;
  }
}

.guide-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  text-decoration: none;
  color: var(--myst-ink);
  transition: all 0.3s ease;
}

.guide-button:hover {
  border-color: color-mix(in srgb, white 30%, transparent);
  color: var(--myst-ink-strong);
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

/* News Section */
.news-section {
  position: relative;
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
