<template>
  <div class="home-page">
    <HeaderItem show-announcement/>

    <!-- ─────────────────────────── HERO ─────────────────────────── -->
    <section class="hero" role="banner">
      <div :style="{ backgroundImage: `url('${kleinWebp}')` }" class="hero-image" aria-hidden="true"></div>
      <div class="hero-veil" aria-hidden="true"></div>
      <div class="hero-fog" aria-hidden="true"></div>

      <div class="ritual-circles" aria-hidden="true">
        <svg class="ring outer" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(200,178,115,.28)" stroke-width="0.6"/>
          <circle cx="200" cy="200" r="186" fill="none" stroke="rgba(200,178,115,.16)" stroke-width="0.5"
                  stroke-dasharray="2 7"/>
          <g fill="none" stroke="rgba(200,178,115,.3)" stroke-width="0.6">
            <path d="M200 4 L206 16 L194 16 Z"/>
            <path d="M200 396 L206 384 L194 384 Z"/>
            <path d="M4 200 L16 194 L16 206 Z"/>
            <path d="M396 200 L384 194 L384 206 Z"/>
          </g>
        </svg>
        <svg class="ring inner" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(200,178,115,.2)" stroke-width="0.5"
                  stroke-dasharray="30 14 4 14"/>
          <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(200,178,115,.1)" stroke-width="0.5"/>
        </svg>
      </div>

      <div class="hero-content">
        <p class="hero-eyebrow">
          {{ t('homePage.heroEyebrowBefore') }}
          <span>{{ t('homePage.heroEyebrowBrand') }}</span>
          {{ t('homePage.heroEyebrowAfter') }}
        </p>
        <h1 class="hero-title">{{ t('serverName') }}</h1>
        <p class="hero-tagline">{{ t('homePage.heroTagline') }}</p>

        <div class="hero-ctas">
          <RouterLink class="myst-btn-gold hero-cta-primary" to="/guide">
            {{ t('homePage.heroPrimaryCta') }}
          </RouterLink>
          <a class="myst-btn-outline hero-cta-secondary" href="#pathways">
            {{ t('homePage.heroSecondaryCta') }}
          </a>
        </div>

        <button class="ip-pill" @click="copyIp">
          <span class="ip-pill-label">{{ t('homePage.serverIpLabel') }}</span>
          <span class="ip-pill-address">{{ SERVER_IP }}</span>
          <span :class="['ip-pill-hint', { copied }]">
            {{ copied ? t('homePage.copiedHint') : t('homePage.copyHint') }}
          </span>
        </button>
      </div>

      <div class="hero-stats">
        <div class="stat-strip">
          <div class="stat-cell">
            <div class="stat-value">{{ totalBeyonders || '—' }}</div>
            <div class="stat-label">{{ t('homePage.statBeyonders') }}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">{{ uniquePathways || 22 }}</div>
            <div class="stat-label">{{ t('homePage.statPathways') }}</div>
          </div>
          <div v-if="daysToSeason > 0" class="stat-cell">
            <div class="stat-value">{{ daysToSeason }}<span class="stat-unit">d</span></div>
            <div class="stat-label">{{ t('homePage.statCountdown') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───────────────── CIRCLE OF IMAGINATION ───────────────── -->
    <section class="circle-section">
      <div class="myst-shell">
        <header class="myst-section-head">
          <span class="rule left" aria-hidden="true"></span>
          <p class="myst-eyebrow">{{ t('homePage.circleEyebrow') }}</p>
          <span class="rule right" aria-hidden="true"></span>
        </header>
        <h2 class="myst-h2 section-title">{{ t('homePage.circleTitle') }}</h2>
        <p class="section-lede">{{ t('homePage.circleLede') }}</p>

        <div class="circle-cards">
          <article v-for="step in circleSteps" :key="step.numeral" class="circle-card">
            <span class="myst-corner-frame" aria-hidden="true"></span>
            <div class="circle-numeral">{{ step.numeral }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ─────────────────────── TAROT FAN ─────────────────────── -->
    <section id="pathways" class="tarot-section">
      <div class="tarot-glow" aria-hidden="true"></div>
      <div class="myst-shell">
        <header class="myst-section-head">
          <span class="rule left" aria-hidden="true"></span>
          <p class="myst-eyebrow">{{ t('homePage.tarotEyebrow') }}</p>
          <span class="rule right" aria-hidden="true"></span>
        </header>
        <h2 class="myst-h2 section-title tarot-title">{{ t('homePage.tarotTitle') }}</h2>

        <div class="tarot-rail">
          <div
              ref="tarotTrack"
              :aria-label="t('homePage.tarotTitle')"
              :class="['tarot-track', { dragging: isDragging }]"
              role="group"
              @click.capture="onRailClickCapture"
              @pointerdown="onRailPointerDown"
              @pointermove="onRailPointerMove"
              @pointerup="onRailPointerUp"
              @pointercancel="onRailPointerUp"
              @wheel="onTarotWheel"
          >
            <RouterLink
                v-for="(card, index) in tarotCards"
                :key="card.id"
                :class="['tarot-card', `tilt-${index % 5}`]"
                :to="`/pathways/${card.id}`"
            >
              <span class="tarot-seq">{{ t('homePage.tarotSeq') }} · {{ card.role }}</span>
              <img :alt="card.name" :src="card.image" class="tarot-sigil" loading="lazy">
              <span class="tarot-name">{{ card.name }}</span>
            </RouterLink>
          </div>

          <span :class="['rail-fade', 'start', { hidden: atStart }]" aria-hidden="true"></span>
          <span :class="['rail-fade', 'end', { hidden: atEnd }]" aria-hidden="true"></span>
        </div>

        <div class="tarot-cta">
          <RouterLink class="myst-btn-outline" to="/pathways">
            {{ t('homePage.tarotCta') }} — {{ t('homePage.tarotCtaCount') }}
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ───────────────────── OBSERVATORY ───────────────────── -->
    <BeyonderStatistics/>

    <!-- ────────────────── COMPANION MOD ────────────────── -->
    <CompanionMod/>

    <!-- ───────────────────── NEWS LEDGER ───────────────────── -->
    <section id="news" class="news-section">
      <div class="myst-shell">
        <header class="news-head">
          <div>
            <p class="myst-eyebrow">{{ t('homePage.newsEyebrow') }}</p>
            <h2 class="news-title">{{ t('homePage.newsTitle') }}</h2>
          </div>
          <RouterLink class="news-all" to="/news">{{ t('homePage.newsAll') }} →</RouterLink>
        </header>

        <RouterLink v-if="featured" class="news-featured" :to="`/news/${featured.slug}`">
          <div class="featured-media">
            <img :alt="featured.title" :src="featured.preview || bannerWebp" loading="lazy">
            <span v-if="featured.isPinned" class="featured-badge">{{ t('homePage.newsPinned') }}</span>
          </div>
          <div class="featured-copy">
            <span class="featured-meta">{{ formatDate(featuredDate) }}</span>
            <h3>{{ featured.title }}</h3>
            <p>{{ featured.shortDescription }}</p>
            <span class="featured-read">{{ t('homePage.newsRead') }} †</span>
          </div>
        </RouterLink>

        <RouterLink
            v-for="entry in compactNews"
            :key="entry.id"
            class="news-row"
            :to="`/news/${entry.slug}`"
        >
          <span class="row-date">{{ formatDate(entry.publishedAt || entry.createdAt) }}</span>
          <span class="row-copy">
            <h3>{{ entry.title }}</h3>
            <p v-if="entry.shortDescription">{{ entry.shortDescription }}</p>
          </span>
          <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
        </RouterLink>
      </div>
    </section>

    <!-- ───────────────────── CLOSING CTA ───────────────────── -->
    <section class="closing">
      <div class="closing-glow" aria-hidden="true"></div>
      <div class="closing-inner">
        <p class="myst-eyebrow">{{ t('homePage.closingEyebrow') }}</p>
        <h2 class="closing-title">
          {{ t('homePage.closingTitleLineOne') }}<br>{{ t('homePage.closingTitleLineTwo') }}
        </h2>
        <p class="closing-lede">{{ t('homePage.closingLede') }}</p>
        <div class="closing-ctas">
          <button class="myst-btn-gold" @click="copyIp">
            <i class="fa-solid fa-copy" aria-hidden="true"></i>
            {{ copied ? t('homePage.closingCopied') : t('homePage.closingCopy') }}
          </button>
          <a
              class="myst-btn-outline"
              href="https://discord.com/invite/jc7GSxBWgb"
              rel="noopener noreferrer"
              target="_blank"
          >
            <IconDiscord aria-hidden="true"/>
            {{ t('homePage.closingDiscord') }}
          </a>
        </div>
      </div>
    </section>

    <FooterItem variant="full"/>
    <DailyBonusCat page="home"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import DailyBonusCat from "@/components/ui/DailyBonusCat.vue";
import BeyonderStatistics from "@/components/home/BeyonderStatistics.vue";
import CompanionMod from "@/components/home/CompanionMod.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import {newsAPI} from "@/utils/api/news";
import type {NewsArticle, NewsPreview} from "@/types/news";
import {useI18n} from "@/composables/useI18n";
import {useBeyonderStats} from "@/composables/useBeyonderStats";
import {SERVER_IP, useCopyIp} from "@/composables/useServer";
import {daysUntilSeason} from "@/constants/season";
import {useSeo, videoGameLd} from "@/composables/useSeo";
import {corePathways, pathwayImage, pathwayName, sequenceNineName} from "@/data/pathways";
import bannerWebp from "@/assets/images/optimized/banner.webp";
import kleinWebp from "@/assets/images/optimized/Klein.webp";

const {t, currentLanguage} = useI18n();
const {copied, copyIp} = useCopyIp();
const {totalBeyonders, uniquePathways} = useBeyonderStats();

const daysToSeason = daysUntilSeason();

useSeo(() => ({
  // The home page owns the bare brand title; every other route appends it.
  title: null,
  description: t("homePage.heroTagline"),
  path: "/",
  imageAlt: "Mysterria — a Lord of the Mysteries Minecraft server",
  // Organization and WebSite are declared statically in index.html; this only
  // adds the entity a "best LotM Minecraft server" search is actually after.
  jsonLd: [videoGameLd(totalBeyonders.value)],
}));

/* ---- Circle of Imagination ---- */
const circleSteps = computed(() => [
  {numeral: "I", title: t("homePage.circleStepOneTitle"), body: t("homePage.circleStepOneBody")},
  {numeral: "II", title: t("homePage.circleStepTwoTitle"), body: t("homePage.circleStepTwoBody")},
  {numeral: "III", title: t("homePage.circleStepThreeTitle"), body: t("homePage.circleStepThreeBody")},
]);

/* ---- Tarot rail ---- */

/** The five the design fans out first, then the rest of the 22 in source order. */
const FEATURED_IDS = ["fool", "darkness", "sun", "tyrant", "door"];

const tarotCards = computed(() => {
  const ordered = [
    ...FEATURED_IDS,
    ...corePathways.map(pathway => pathway.id).filter(id => !FEATURED_IDS.includes(id)),
  ];

  return ordered.map(id => ({
    id,
    name: pathwayName(id, currentLanguage.value),
    role: sequenceNineName(id, currentLanguage.value).toUpperCase(),
    image: pathwayImage(id),
  }));
});

const tarotTrack = ref<HTMLElement | null>(null);
const atStart = ref(true);
const atEnd = ref(false);
const isDragging = ref(false);

/*
 * The rail keeps a real scroll container (so touch, keyboard and a11y all work
 * natively) but the wheel drives an eased target instead of jumping: each notch
 * reads as the deck gliding sideways. Anything that would fight that — CSS
 * scroll snapping, smooth scroll-behavior — is off on the track.
 */
let railTarget = 0;
let railRaf: number | null = null;
let railLastFrame = 0;

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

const railMaxScroll = () => {
  const track = tarotTrack.value;
  return track ? Math.max(0, track.scrollWidth - track.clientWidth) : 0;
};

/** Pure edge readout — safe to call from inside the animation. */
const updateRailEdges = () => {
  const track = tarotTrack.value;
  if (!track) return;
  const max = railMaxScroll();
  atStart.value = track.scrollLeft <= 1;
  atEnd.value = max <= 1 || track.scrollLeft >= max - 1;
};

/** Scroll listener: also re-anchors the target when we are not animating. */
const onRailScroll = () => {
  updateRailEdges();
  if (railRaf === null) railTarget = tarotTrack.value?.scrollLeft ?? 0;
};

const stepRail = (now: number) => {
  const track = tarotTrack.value;
  if (!track) {
    railRaf = null;
    return;
  }

  const frameMs = railLastFrame ? Math.min(now - railLastFrame, 50) : 16;
  railLastFrame = now;

  const distance = railTarget - track.scrollLeft;
  if (Math.abs(distance) < 0.5) {
    track.scrollLeft = railTarget;
    railRaf = null;
    railLastFrame = 0;
    updateRailEdges();
    return;
  }

  // Frame-rate independent exponential ease-out (~0.1 per frame at 60fps).
  track.scrollLeft += distance * (1 - Math.pow(0.0015, frameMs / 1000));
  updateRailEdges();
  railRaf = requestAnimationFrame(stepRail);
};

const startRail = () => {
  if (railRaf !== null) return;
  railLastFrame = 0;
  railRaf = requestAnimationFrame(stepRail);
};

const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Wheel over the rail moves the deck sideways. We hand the gesture back to the
 * page as soon as the rail has no room left in that direction, so the reader
 * never gets trapped.
 */
const onTarotWheel = (event: WheelEvent) => {
  const track = tarotTrack.value;
  if (!track) return;

  const max = railMaxScroll();
  if (max <= 0) return;

  // Take whichever axis dominates — trackpads send diagonal deltas.
  const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!raw) return;

  // deltaMode 1 = lines, 2 = pages.
  const delta = event.deltaMode === 1 ? raw * 16 : event.deltaMode === 2 ? raw * track.clientWidth : raw;

  // Edge test against the target, not the live position, so a fast flick that
  // is still catching up does not swallow the page scroll.
  if ((delta < 0 && railTarget <= 0.5) || (delta > 0 && railTarget >= max - 0.5)) return;

  event.preventDefault();
  railTarget = clamp(railTarget + delta, max);

  if (prefersReducedMotion()) {
    track.scrollLeft = railTarget;
    updateRailEdges();
    return;
  }

  startRail();
};

/* ---- Drag to slide (mouse only; touch keeps native momentum) ---- */

let dragStartX = 0;
let dragStartScroll = 0;
let dragMoved = false;

const onRailPointerDown = (event: PointerEvent) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  const track = tarotTrack.value;
  if (!track || railMaxScroll() <= 0) return;

  isDragging.value = true;
  dragMoved = false;
  dragStartX = event.clientX;
  dragStartScroll = track.scrollLeft;

  if (railRaf !== null) {
    cancelAnimationFrame(railRaf);
    railRaf = null;
  }
  railTarget = track.scrollLeft;
};

const onRailPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return;
  const track = tarotTrack.value;
  if (!track) return;

  const travelled = event.clientX - dragStartX;
  if (!dragMoved && Math.abs(travelled) > 4) {
    dragMoved = true;
    track.setPointerCapture(event.pointerId);
  }
  if (!dragMoved) return;

  event.preventDefault();
  railTarget = clamp(dragStartScroll - travelled, railMaxScroll());
  track.scrollLeft = railTarget;
  updateRailEdges();
};

const onRailPointerUp = (event: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  const track = tarotTrack.value;
  if (track?.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
};

/** A drag that ended on a card must not also open that card. */
const onRailClickCapture = (event: MouseEvent) => {
  if (!dragMoved) return;
  event.preventDefault();
  event.stopPropagation();
  dragMoved = false;
};

onMounted(() => {
  const track = tarotTrack.value;
  if (!track) return;
  track.addEventListener("scroll", onRailScroll, {passive: true});
  window.addEventListener("resize", updateRailEdges);
  updateRailEdges();
});

onUnmounted(() => {
  if (railRaf !== null) cancelAnimationFrame(railRaf);
  tarotTrack.value?.removeEventListener("scroll", onRailScroll);
  window.removeEventListener("resize", updateRailEdges);
});

/* ---- News ---- */
const news = ref<NewsArticle[]>([]);
const pinned = ref<NewsPreview[]>([]);

const sortedNews = computed(() =>
    [...news.value].sort(
        (a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
    ),
);

const featured = computed<NewsArticle | NewsPreview | null>(() => {
  const newestPinned = [...pinned.value].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )[0];
  return newestPinned ?? sortedNews.value[0] ?? null;
});

const featuredDate = computed(() => {
  const article = featured.value;
  if (!article) return "";
  return "publishedAt" in article && article.publishedAt
      ? article.publishedAt
      : (article as NewsArticle).createdAt;
});

const compactNews = computed(() =>
    sortedNews.value.filter(article => article.slug !== featured.value?.slug).slice(0, 3),
);

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString(currentLanguage.value === "uk" ? "uk-UA" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const loadNews = async () => {
  try {
    const [latest, pinnedResponse] = await Promise.all([
      newsAPI.getLatest(currentLanguage.value),
      newsAPI.getPinned(currentLanguage.value),
    ]);
    news.value = latest.data;
    pinned.value = pinnedResponse.data;
  } catch (error) {
    console.error("Failed to load news:", error);
  }
};

onMounted(loadNews);
watch(currentLanguage, loadNews);
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

/* ─────────────────────────── HERO ─────────────────────────── */
.hero {
  position: relative;
  min-height: calc(100vh - 105px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 30%;
}

.hero-veil {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 42%, rgba(5, 7, 10, 0.15) 0%, rgba(5, 7, 10, 0.82) 68%, rgba(5, 7, 10, 0.98) 100%),
  linear-gradient(to bottom, rgba(5, 7, 10, 0.72) 0%, transparent 32%, rgba(5, 7, 10, 0.55) 75%, var(--myst-bg) 100%);
}

.hero-fog {
  position: absolute;
  inset: -10%;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 38% at 30% 68%, rgba(200, 178, 115, 0.055), transparent 60%),
  radial-gradient(ellipse 52% 32% at 74% 30%, rgba(148, 163, 200, 0.05), transparent 60%);
  animation: fogDrift 26s ease-in-out infinite;
  /* These three ambient layers run forever. Promoting them keeps the drift and
     the spin on the compositor instead of repainting two full-bleed gradients
     underneath the blurred sticky header on every frame. */
  will-change: transform;
}

@keyframes fogDrift {
  0% {
    transform: translateX(-4%) translateY(0);
  }
  50% {
    transform: translateX(4%) translateY(-2%);
  }
  100% {
    transform: translateX(-4%) translateY(0);
  }
}

.ritual-circles {
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
  width: min(78vh, 760px);
  height: min(78vh, 760px);
  pointer-events: none;
  opacity: 0.5;
}

.ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ring.outer {
  animation: ritualSpin 140s linear infinite;
  will-change: transform;
}

.ring.inner {
  inset: 8%;
  width: 84%;
  height: 84%;
  animation: ritualSpin 90s linear infinite reverse;
  will-change: transform;
}

@keyframes ritualSpin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-content {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 64px 24px 40px;
  animation: riseIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(26px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-eyebrow {
  margin: 0 0 26px;
  font-family: var(--myst-font-mono);
  font-size: clamp(10px, 1.2vw, 13px);
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.hero-eyebrow span {
  color: var(--myst-gold);
}

.hero-title {
  margin: 0;
  font-family: var(--myst-font-display);
  font-weight: 800;
  font-size: clamp(3.4rem, 11vw, 9rem);
  line-height: 0.95;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  background: linear-gradient(180deg, #f4ecd8 8%, var(--myst-gold) 58%, #8e7c4b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 18px 50px rgba(0, 0, 0, 0.85));
}

.hero-tagline {
  margin: 30px auto 0;
  max-width: 52ch;
  font-family: var(--myst-font-display);
  font-style: italic;
  font-size: clamp(16px, 2vw, 21px);
  line-height: 1.6;
  color: rgba(247, 245, 239, 0.85);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
}

.hero-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-top: 44px;
}

.hero-cta-primary {
  padding: 17px 42px;
  font-size: 13px;
  letter-spacing: 0.2em;
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.6), 0 0 34px rgba(200, 178, 115, 0.22);
}

.hero-cta-primary:hover {
  transform: translateY(-3px);
}

.hero-cta-secondary {
  padding: 16px 36px;
  font-size: 13px;
  letter-spacing: 0.2em;
  background: rgba(5, 7, 10, 0.5);
  backdrop-filter: blur(6px);
}

.ip-pill {
  margin-top: 40px;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 12px 26px;
  background: rgba(5, 7, 10, 0.55);
  backdrop-filter: blur(8px);
  border: 1px dashed var(--myst-line-40);
  border-radius: 2px;
  cursor: pointer;
  color: var(--myst-ink);
  transition: border-color 0.25s ease;
}

.ip-pill:hover {
  border-color: var(--myst-gold);
}

.ip-pill-label {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.ip-pill-address {
  font-family: var(--myst-font-mono);
  font-size: 16px;
  letter-spacing: 0.04em;
  color: var(--myst-offwhite);
}

.ip-pill-hint {
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.ip-pill-hint.copied {
  color: var(--myst-green);
}

.hero-stats {
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  padding: 0 24px 46px;
}

.stat-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 210px);
  border: 1px solid var(--myst-line-20);
  background: rgba(5, 7, 10, 0.62);
  backdrop-filter: blur(10px);
}

.stat-cell {
  padding: 18px 26px;
  text-align: center;
  border-right: 1px solid var(--myst-line-14);
}

.stat-cell:last-child {
  border-right: none;
}

.stat-value {
  font-family: var(--myst-font-mono);
  font-size: 24px;
  font-weight: 700;
  color: var(--myst-gold);
}

.stat-unit {
  font-size: 13px;
  color: var(--myst-ink-muted);
}

.stat-label {
  margin-top: 5px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

/* ───────────────── CIRCLE OF IMAGINATION ───────────────── */
.circle-section {
  position: relative;
  padding: 110px 24px 90px;
  background: var(--myst-bg);
}

.section-title {
  margin: 0 auto 16px;
  max-width: 22ch;
  text-align: center;
}

.section-lede {
  margin: 0 auto 68px;
  max-width: 64ch;
  text-align: center;
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.7;
}

.circle-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.circle-card {
  position: relative;
  padding: 38px 32px;
  background: linear-gradient(160deg, rgba(13, 16, 30, 0.6), rgba(8, 10, 20, 0.85));
  border: 1px solid var(--myst-line-16);
  transition: transform 0.35s ease, border-color 0.35s ease;
}

.circle-card:hover {
  border-color: var(--myst-line-55);
  transform: translateY(-6px);
}

.circle-numeral {
  margin-bottom: 20px;
  font-family: var(--myst-font-display);
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  color: rgba(200, 178, 115, 0.28);
}

.circle-card h3 {
  margin: 0 0 12px;
  font-family: var(--myst-font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.circle-card p {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 14.5px;
  line-height: 1.7;
}

/* ─────────────────────── TAROT FAN ─────────────────────── */
.tarot-section {
  position: relative;
  padding: 100px 24px;
  background: linear-gradient(180deg, var(--myst-bg), var(--myst-bg-deep) 20%, var(--myst-bg-deep) 80%, var(--myst-bg));
  overflow: hidden;
}

.tarot-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 55% 45% at 50% 45%, rgba(200, 178, 115, 0.05), transparent 70%);
}

.tarot-section .myst-shell {
  position: relative;
}

.tarot-title {
  max-width: none;
  margin-bottom: 66px;
}

/* Horizontal rail — vertical wheel over it rotates the deck sideways */
.tarot-rail {
  position: relative;
  /* Bleed past the shell so cards run to the section edges */
  margin: 0 calc(50% - 50vw);
  padding: 0;
}

.tarot-track {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px max(24px, calc(50vw - var(--myst-shell) / 2)) 28px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  /* The wheel handler animates scrollLeft frame by frame — CSS snapping and
     smooth scroll-behavior both fight that, so neither is used here. */
  scroll-snap-type: none;
  scroll-behavior: auto;
  cursor: grab;
  /* Seamless: the deck is the only affordance, edge fades hint at more */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tarot-track::-webkit-scrollbar {
  display: none;
}

.tarot-track.dragging {
  cursor: grabbing;
}

.tarot-track.dragging .tarot-card {
  /* No hover lift mid-drag — the deck should slide as one piece */
  transition: none;
}

.rail-fade {
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(40px, 8vw, 110px);
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.35s ease;
}

.rail-fade.hidden {
  opacity: 0;
}

.rail-fade.start {
  left: 0;
  background: linear-gradient(90deg, var(--myst-bg-deep), transparent);
}

.rail-fade.end {
  right: 0;
  background: linear-gradient(270deg, var(--myst-bg-deep), transparent);
}

.tarot-card {
  flex: 0 0 172px;
  /* Sigils must not become drag ghosts while sliding the deck */
  -webkit-user-drag: none;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 30px 18px 24px;
  background: linear-gradient(170deg, rgba(16, 19, 34, 0.9), rgba(8, 10, 18, 0.95));
  border: 1px solid var(--myst-line-20);
  border-radius: 6px;
  color: inherit;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
  border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
  box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* The fan tilt repeats across the deck, and every card straightens on hover */
.tarot-card.tilt-0 {
  transform: rotate(-3deg);
}

.tarot-card.tilt-1 {
  transform: rotate(-1.5deg) translateY(8px);
}

.tarot-card.tilt-2 {
  transform: translateY(12px);
}

.tarot-card.tilt-3 {
  transform: rotate(1.5deg) translateY(8px);
}

.tarot-card.tilt-4 {
  transform: rotate(3deg);
}

.tarot-card:hover {
  border-color: rgba(200, 178, 115, 0.6);
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(200, 178, 115, 0.08);
  color: inherit;
}

.tarot-card.tilt-0:hover,
.tarot-card.tilt-4:hover {
  transform: rotate(0deg) translateY(-10px);
}

.tarot-card.tilt-1:hover,
.tarot-card.tilt-3:hover {
  transform: rotate(0deg) translateY(-4px);
}

.tarot-card.tilt-2:hover {
  transform: translateY(0);
}

.tarot-seq {
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.3em;
  color: rgba(200, 178, 115, 0.55);
  text-align: center;
}

.tarot-sigil {
  width: 84px;
  height: 84px;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgba(200, 178, 115, 0.3));
  pointer-events: none;
  -webkit-user-drag: none;
}

.tarot-name {
  font-family: var(--myst-font-display);
  font-size: 19px;
  font-weight: 700;
  color: var(--myst-offwhite);
  text-align: center;
}

.tarot-cta {
  display: flex;
  justify-content: center;
  margin-top: 58px;
}

.tarot-cta .myst-btn-outline {
  padding: 15px 38px;
  gap: 14px;
  font-size: 12px;
  letter-spacing: 0.24em;
}

/* ───────────────────── NEWS LEDGER ───────────────────── */
.news-section {
  padding: 40px 24px 110px;
  background: var(--myst-bg);
}

.news-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--myst-line-20);
}

.news-title {
  margin: 10px 0 0;
  font-family: var(--myst-font-display);
  font-size: clamp(28px, 3.4vw, 40px);
  font-weight: 700;
  color: var(--myst-offwhite);
}

.news-all {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.news-all:hover {
  color: var(--myst-gold);
}

.news-featured {
  display: grid;
  grid-template-columns: minmax(280px, 420px) 1fr;
  gap: 44px;
  align-items: center;
  padding: 36px 0;
  border-bottom: 1px solid var(--myst-line-12);
  color: inherit;
  transition: background 0.25s ease;
}

.news-featured:hover,
.news-row:hover {
  background: rgba(200, 178, 115, 0.02);
  color: inherit;
}

.featured-media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--myst-line-20);
}

.featured-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.85);
}

.featured-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 12px;
  background: var(--myst-gold);
  color: var(--myst-on-gold);
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.featured-meta {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.featured-copy h3 {
  margin: 12px 0;
  font-family: var(--myst-font-display);
  font-size: clamp(22px, 2.6vw, 30px);
  font-weight: 700;
  line-height: 1.2;
  color: var(--myst-offwhite);
}

.featured-copy p {
  margin: 0 0 18px;
  max-width: 64ch;
  color: var(--myst-ink-muted);
  font-size: 15px;
  line-height: 1.7;
}

.featured-read {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.news-row {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 32px;
  align-items: baseline;
  padding: 26px 0;
  border-bottom: 1px solid var(--myst-line-10);
  color: inherit;
  transition: background 0.25s ease;
}

.row-date {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.row-copy h3 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 19px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.row-copy p {
  margin: 8px 0 0;
  max-width: 70ch;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.6;
}

.news-row > i {
  color: rgba(200, 178, 115, 0.45);
  font-size: 13px;
}

/* ───────────────────── CLOSING CTA ───────────────────── */
.closing {
  position: relative;
  padding: 110px 24px;
  background: var(--myst-bg-deep);
  overflow: hidden;
  text-align: center;
}

.closing-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 50% 60% at 50% 50%, rgba(200, 178, 115, 0.07), transparent 70%);
  animation: glowPulse 7s ease-in-out infinite;
  will-change: opacity;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.7;
  }
}

.closing-inner {
  position: relative;
  max-width: 720px;
  margin: 0 auto;
}

.closing-title {
  margin: 18px 0 22px;
  font-family: var(--myst-font-display);
  font-size: clamp(30px, 4.4vw, 50px);
  font-weight: 800;
  line-height: 1.12;
  color: var(--myst-offwhite);
}

.closing-lede {
  margin: 0 auto 40px;
  max-width: 50ch;
  color: var(--myst-ink-muted);
  font-size: 16px;
  line-height: 1.7;
}

.closing-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.closing-ctas .myst-btn-gold {
  padding: 16px 36px;
  font-size: 13px;
}

.closing-ctas .myst-btn-outline {
  padding: 15px 32px;
  font-size: 13px;
}

/* ───────────────────── RESPONSIVE ───────────────────── */
@media (max-width: 980px) {
  .circle-cards {
    grid-template-columns: 1fr;
  }

  .news-featured {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 860px) {
  .tarot-card,
  .tarot-card.tilt-0,
  .tarot-card.tilt-1,
  .tarot-card.tilt-2,
  .tarot-card.tilt-3,
  .tarot-card.tilt-4 {
    transform: none;
  }

  .tarot-track {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (max-width: 700px) {
  .hero {
    min-height: calc(100svh - 105px);
  }

  .stat-strip {
    grid-auto-flow: row;
    grid-auto-columns: auto;
    width: 100%;
    max-width: 340px;
  }

  .stat-cell {
    border-right: none;
    border-bottom: 1px solid var(--myst-line-14);
  }

  .stat-cell:last-child {
    border-bottom: none;
  }

  .hero-ctas {
    flex-direction: column;
    align-items: stretch;
  }

  .ip-pill {
    width: 100%;
  }

  .circle-section,
  .tarot-section,
  .closing {
    padding-left: 20px;
    padding-right: 20px;
  }

  .news-row {
    grid-template-columns: 1fr auto;
    gap: 12px 16px;
  }

  .row-date {
    grid-column: 1 / -1;
  }
}
</style>
