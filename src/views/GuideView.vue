<template>
  <div class="guide-page">
    <HeaderItem/>

    <main class="guide-main">
      <Transition name="guide-page">
      <div v-if="!selectedTopic" key="guide-home" class="guide-home">
        <section v-reveal class="guide-hero" aria-labelledby="guide-title">
          <div class="hero-copy">
            <span class="eyebrow">{{ content.ui.eyebrow }}</span>
            <h1 id="guide-title">{{ content.ui.title }}</h1>
            <p>{{ content.ui.lede }}</p>

            <div class="hero-actions">
              <button class="button-primary" type="button" @click="scrollToId('first-hour')">
                {{ content.ui.startJourney }}
                <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
              </button>
              <button class="button-secondary" type="button" @click="focusSearch">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                {{ content.ui.findAnswer }}
              </button>
            </div>
          </div>

          <div class="join-card">
            <span class="micro-label">{{ content.ui.serverAddress }}</span>
            <div class="server-address">{{ t('serverAddress') }}</div>
            <button class="copy-button" type="button" @click="copyIP">
              <i :class="isCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'" aria-hidden="true"></i>
              {{ isCopied ? content.ui.copied : content.ui.copyAddress }}
            </button>
            <div class="join-card-note">
              <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
              {{ content.facts[2].value }} · {{ content.facts[2].note }}
            </div>
          </div>
        </section>

        <section v-reveal class="quick-facts" :aria-label="content.ui.quickFactsLabel">
          <div class="quick-facts-label">{{ content.ui.quickFactsLabel }}</div>
          <div v-for="fact in content.facts" :key="fact.label" class="quick-fact">
            <span>{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
            <small>{{ fact.note }}</small>
          </div>
        </section>

        <section v-reveal class="guide-section expectations-section" aria-labelledby="expectations-title">
          <GuideSectionHeading
            :eyebrow="content.ui.expectationsEyebrow"
            :title="content.ui.expectationsTitle"
            :lede="content.ui.expectationsLede"
          />

          <div class="expectation-grid">
            <details v-for="expectation in content.expectations" :key="expectation.title" class="expectation-card">
              <summary>
                <span class="expectation-icon"><i :class="expectation.icon" aria-hidden="true"></i></span>
                <span class="expectation-copy">
                  <strong>{{ expectation.title }}</strong>
                  <small>{{ expectation.summary }}</small>
                </span>
                <i class="fa-solid fa-plus expectation-toggle" aria-hidden="true"></i>
              </summary>
              <p>{{ expectation.detail }}</p>
            </details>
          </div>
        </section>

        <section id="find-answer" v-reveal class="guide-section task-section" aria-labelledby="tasks-title">
          <GuideSectionHeading
            :eyebrow="content.ui.tasksEyebrow"
            :title="content.ui.tasksTitle"
            :lede="content.ui.tasksLede"
          />

          <div class="search-wrap">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              ref="searchInput"
              v-model.trim="searchQuery"
              type="search"
              :placeholder="content.ui.searchPlaceholder"
              :aria-label="content.ui.findAnswer"
            >
            <button v-if="searchQuery" type="button" @click="searchQuery = ''">
              {{ content.ui.clearSearch }}
            </button>
          </div>

          <div v-if="searchQuery" class="search-results" aria-live="polite">
            <div class="results-meta">{{ content.ui.searchResults }} · {{ filteredTopics.length }}</div>
            <TransitionGroup v-if="filteredTopics.length" name="search-result" tag="div" class="result-list">
              <button
                v-for="topic in filteredTopics"
                :key="topic.id"
                class="search-result"
                type="button"
                @click="openTopic(topic.id)"
              >
                <span class="topic-icon"><i :class="topic.icon" aria-hidden="true"></i></span>
                <span>
                  <strong>{{ topic.title }}</strong>
                  <small>{{ topic.summary }}</small>
                </span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </TransitionGroup>
            <div v-else class="empty-results">
              <i class="fa-regular fa-compass" aria-hidden="true"></i>
              <strong>{{ content.ui.noResults }}</strong>
              <span>{{ content.ui.noResultsHint }}</span>
            </div>
          </div>

          <div v-else class="task-grid">
            <button
              v-for="task in content.tasks"
              :key="task.title"
              class="task-card"
              type="button"
              @click="openTopic(task.topicId)"
            >
              <span class="task-icon"><i :class="task.icon" aria-hidden="true"></i></span>
              <span class="task-copy">
                <strong>{{ task.title }}</strong>
                <small>{{ task.description }}</small>
              </span>
              <i class="fa-solid fa-arrow-right task-arrow" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <section id="first-hour" v-reveal class="guide-section first-hour-section" aria-labelledby="first-hour-title">
          <GuideSectionHeading
            :eyebrow="content.ui.firstHourEyebrow"
            :title="content.ui.firstHourTitle"
            :lede="content.ui.firstHourLede"
          />

          <ol class="journey-list">
            <li v-for="(step, index) in content.firstHour" :key="step.title" class="journey-step">
              <span class="journey-number">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="journey-copy">
                <h3>{{ step.title }}</h3>
                <p>{{ step.description }}</p>
              </div>
              <button v-if="step.topicId" type="button" @click="openTopic(step.topicId)">
                {{ content.ui.openStep }}
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </li>
          </ol>
        </section>

        <section v-reveal class="guide-section starter-section" aria-labelledby="starter-title">
          <GuideSectionHeading
            :eyebrow="content.ui.starterEyebrow"
            :title="content.ui.starterTitle"
            :lede="content.ui.starterLede"
          />

          <GuideChoiceComparison :choices="content.starterChoices" :ui="content.ui"/>

          <div class="important-callout">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
            <div>
              <strong>{{ content.ui.important }}</strong>
              <p>{{ content.ui.starterWarning }}</p>
            </div>
          </div>
        </section>

        <section v-reveal class="guide-section direction-section" aria-labelledby="direction-title">
          <GuideSectionHeading
            :eyebrow="content.ui.directionEyebrow"
            :title="content.ui.directionTitle"
            :lede="content.ui.directionLede"
          />

          <div class="direction-grid">
            <article v-for="direction in content.directions" :key="direction.title" class="direction-card">
              <div class="direction-head">
                <span class="direction-icon"><i :class="direction.icon" aria-hidden="true"></i></span>
                <div>
                  <span class="micro-label">{{ direction.eyebrow }}</span>
                  <h3>{{ direction.title }}</h3>
                </div>
              </div>
              <p>{{ direction.description }}</p>
              <ul>
                <li v-for="point in direction.points" :key="point">{{ point }}</li>
              </ul>
              <button class="text-link" type="button" @click="openTopic(direction.topicId)">
                {{ content.ui.openTopic }}
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </article>
          </div>
        </section>

        <section v-reveal class="guide-section browse-section" aria-labelledby="browse-title">
          <GuideSectionHeading
            :eyebrow="content.ui.browseEyebrow"
            :title="content.ui.browseTitle"
            :lede="content.ui.browseLede"
          />

          <div class="category-list">
            <section v-for="group in topicGroups" :key="group.id" class="category-group">
              <div class="category-heading">
                <h3>{{ group.label }}</h3>
                <span>{{ group.topics.length }} {{ content.ui.topics }}</span>
              </div>
              <div class="category-topics">
                <button
                  v-for="topic in group.topics"
                  :key="topic.id"
                  type="button"
                  @click="openTopic(topic.id)"
                >
                  <span class="topic-icon"><i :class="topic.icon" aria-hidden="true"></i></span>
                  <span>
                    <strong>{{ topic.shortTitle }}</strong>
                    <small>{{ topic.summary }}</small>
                  </span>
                  <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
                </button>
              </div>
            </section>
          </div>
        </section>

        <section v-reveal class="guide-section popular-section" aria-labelledby="popular-title">
          <GuideSectionHeading :eyebrow="content.ui.popularEyebrow" :title="content.ui.popularTitle"/>

          <div class="question-grid">
            <button
              v-for="item in content.popularQuestions"
              :key="item.question"
              type="button"
              @click="openTopic(item.topicId)"
            >
              <span>{{ item.question }}</span>
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </div>

          <div class="support-row">
            <router-link to="/profile" class="button-primary">{{ content.ui.profileCta }}</router-link>
            <router-link to="/pathways" class="button-secondary">{{ content.ui.pathwaysCta }}</router-link>
            <router-link to="/rules" class="button-secondary">{{ content.ui.fullRulesCta }}</router-link>
            <a class="button-secondary" href="https://discord.com/invite/jc7GSxBWgb" target="_blank" rel="noopener">
              <i class="fa-brands fa-discord" aria-hidden="true"></i>
              {{ content.ui.supportCta }}
            </a>
          </div>
        </section>
      </div>

      <div v-else :key="selectedTopic.id" class="topic-layout">
        <aside class="topic-sidebar">
          <button class="back-button" type="button" @click="backToGuide">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            {{ content.ui.backToGuide }}
          </button>

          <nav :aria-label="content.ui.mobileBrowse">
            <div v-for="group in topicGroups" :key="group.id" class="sidebar-group">
              <span>{{ group.label }}</span>
              <button
                v-for="topic in group.topics"
                :key="topic.id"
                :class="{ active: topic.id === selectedTopic.id }"
                type="button"
                @click="openTopic(topic.id)"
              >
                {{ topic.shortTitle }}
              </button>
            </div>
          </nav>
        </aside>

        <article class="topic-article">
          <button class="mobile-back" type="button" @click="backToGuide">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            {{ content.ui.backToGuide }}
          </button>

          <details class="mobile-topic-index">
            <summary>
              <i class="fa-solid fa-list" aria-hidden="true"></i>
              {{ content.ui.mobileBrowse }}
            </summary>
            <div>
              <button
                v-for="topic in content.topics"
                :key="topic.id"
                :class="{ active: topic.id === selectedTopic.id }"
                type="button"
                @click="openTopic(topic.id)"
              >
                {{ topic.shortTitle }}
              </button>
            </div>
          </details>

          <header v-reveal class="topic-header">
            <span class="eyebrow">{{ content.categories[selectedTopic.category] }}</span>
            <div class="topic-title-row">
              <span class="topic-hero-icon"><i :class="selectedTopic.icon" aria-hidden="true"></i></span>
              <h1>{{ selectedTopic.title }}</h1>
            </div>
            <p>{{ selectedTopic.summary }}</p>
          </header>

          <section v-reveal class="quick-answer">
            <span>{{ content.ui.quickAnswer }}</span>
            <p>{{ selectedTopic.answer }}</p>
          </section>

          <section v-if="selectedTopic.id === 'connect'" v-reveal class="screenshot-section">
            <span class="micro-label">{{ content.ui.screenshotsLabel }}</span>
            <div class="screenshot-grid">
              <figure>
                <img :src="ipScreenshot" :alt="content.ui.screenshotIp">
                <figcaption>01 · {{ content.ui.screenshotIp }}</figcaption>
              </figure>
              <figure>
                <img :src="joinScreenshot" :alt="content.ui.screenshotJoin">
                <figcaption>02 · {{ content.ui.screenshotJoin }}</figcaption>
              </figure>
              <figure>
                <img :src="portalScreenshot" :alt="content.ui.screenshotPortal">
                <figcaption>03 · {{ content.ui.screenshotPortal }}</figcaption>
              </figure>
            </div>
          </section>

          <GuideChoiceComparison
            v-if="selectedTopic.id === 'starter-choice'"
            v-reveal
            class="topic-choice-comparison"
            :choices="content.starterChoices"
            :ui="content.ui"
          />

          <nav v-reveal class="section-index" :aria-label="content.ui.onThisPage">
            <span>{{ content.ui.onThisPage }}</span>
            <button
              v-for="(section, index) in selectedTopic.sections"
              :key="section.title"
              type="button"
              @click="scrollToId(`topic-section-${index}`)"
            >
              {{ section.title }}
            </button>
          </nav>

          <section
            v-for="(section, index) in selectedTopic.sections"
            :id="`topic-section-${index}`"
            :key="section.title"
            v-reveal="index"
            class="topic-section"
          >
            <span class="section-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="topic-section-content">
              <h2>{{ section.title }}</h2>

              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>

              <ul v-if="section.bullets" class="content-list">
                <li v-for="bullet in section.bullets" :key="bullet">{{ bullet }}</li>
              </ul>

              <ol v-if="section.steps" class="content-steps">
                <li v-for="(step, stepIndex) in section.steps" :key="step">
                  <span>{{ stepIndex + 1 }}</span>
                  <p>{{ step }}</p>
                </li>
              </ol>

              <div v-if="section.commands" class="command-list">
                <div v-for="command in section.commands" :key="command.command" class="command-row">
                  <code>{{ command.command }}</code>
                  <span>{{ command.purpose }}</span>
                </div>
              </div>

              <div v-if="section.warning" class="inline-callout warning">
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <div>
                  <strong>{{ content.ui.commonMistake }}</strong>
                  <p>{{ section.warning }}</p>
                </div>
              </div>

              <div v-if="section.tip" class="inline-callout tip">
                <i class="fa-regular fa-lightbulb" aria-hidden="true"></i>
                <div>
                  <strong>{{ content.ui.usefulTip }}</strong>
                  <p>{{ section.tip }}</p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="relatedTopics.length" v-reveal class="related-section">
            <span class="eyebrow">{{ content.ui.relatedTopics }}</span>
            <div class="related-grid">
              <button
                v-for="topic in relatedTopics"
                :key="topic.id"
                type="button"
                @click="openTopic(topic.id)"
              >
                <span class="topic-icon"><i :class="topic.icon" aria-hidden="true"></i></span>
                <span>
                  <strong>{{ topic.shortTitle }}</strong>
                  <small>{{ topic.summary }}</small>
                </span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </div>
          </section>
        </article>
      </div>
      </Transition>
    </main>

    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, ref, watch, type DirectiveBinding} from "vue";
import {useRoute, useRouter} from "vue-router";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import GuideSectionHeading from "@/components/guide/GuideSectionHeading.vue";
import GuideChoiceComparison from "@/components/guide/GuideChoiceComparison.vue";
import {useI18n} from "@/composables/useI18n";
import {
  guideContent,
  type GuideCategory,
  type GuideTopic,
} from "@/data/guideContent";
import ipScreenshot from "@/assets/images/guide/ip.webp";
import portalScreenshot from "@/assets/images/guide/portal.webp";
import joinScreenshot from "@/assets/images/guide/join.webp";

const {t, currentLanguage} = useI18n();
const route = useRoute();
const router = useRouter();

const content = computed(() => guideContent[currentLanguage.value]);
const searchQuery = ref("");
const searchInput = ref<HTMLInputElement | null>(null);
const isCopied = ref(false);
let revealObserver: IntersectionObserver | null = null;

type RevealElement = HTMLElement & {__guideRevealDelay?: number};

const vReveal = {
  mounted(element: RevealElement, binding: DirectiveBinding<number | undefined>) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      element.classList.add("is-revealed");
      return;
    }

    const delay = Math.min(Math.max(binding.value ?? 0, 0) * 45, 180);
    element.__guideRevealDelay = delay;
    element.style.setProperty("--reveal-delay", `${delay}ms`);
    element.classList.add("reveal-item");

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-revealed");
            revealObserver?.unobserve(entry.target);
          });
        },
        {rootMargin: "0px 0px -8% 0px", threshold: 0.08},
      );
    }

    revealObserver.observe(element);
  },
  unmounted(element: RevealElement) {
    revealObserver?.unobserve(element);
    delete element.__guideRevealDelay;
  },
};

const categoryOrder: GuideCategory[] = ["start", "progression", "world", "community", "help"];

const selectedTopic = computed<GuideTopic | null>(() => {
  const topicId = typeof route.params.topic === "string" ? route.params.topic : "";
  return content.value.topics.find(topic => topic.id === topicId) ?? null;
});

const topicGroups = computed(() => categoryOrder
  .map(id => ({
    id,
    label: content.value.categories[id],
    topics: content.value.topics.filter(topic => topic.category === id),
  }))
  .filter(group => group.topics.length));

const filteredTopics = computed(() => {
  const query = normalizeSearch(searchQuery.value);
  if (!query) return [];

  return content.value.topics
    .map(topic => {
      const searchable = normalizeSearch([
        topic.title,
        topic.shortTitle,
        topic.summary,
        topic.answer,
        ...topic.tags,
        ...topic.sections.flatMap(section => [
          section.title,
          ...(section.paragraphs ?? []),
          ...(section.bullets ?? []),
          ...(section.steps ?? []),
          section.warning ?? "",
          section.tip ?? "",
          ...(section.commands ?? []).flatMap(command => [command.command, command.purpose]),
        ]),
      ].join(" "));

      const titleMatch = normalizeSearch(`${topic.title} ${topic.shortTitle} ${topic.tags.join(" ")}`).includes(query);
      const allTermsMatch = query.split(" ").every(term => searchable.includes(term));
      return {topic, score: titleMatch ? 2 : allTermsMatch ? 1 : 0};
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.topic);
});

const relatedTopics = computed(() => {
  if (!selectedTopic.value) return [];
  return selectedTopic.value.related
    .map(id => content.value.topics.find(topic => topic.id === id))
    .filter((topic): topic is GuideTopic => Boolean(topic));
});

watch(
  () => route.params.topic,
  topicId => {
    if (topicId && typeof topicId === "string" && !content.value.topics.some(topic => topic.id === topicId)) {
      void router.replace({name: "guide"});
    }
  },
  {immediate: true},
);

onBeforeUnmount(() => {
  revealObserver?.disconnect();
  revealObserver = null;
});

function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase(currentLanguage.value === "uk" ? "uk-UA" : "en-US")
    .replace(/[’ʼ`]/g, "'")
    .replace(/[^\p{L}\p{N}/' -]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function openTopic(topicId: string) {
  void router.push({name: "guide", params: {topic: topicId}});
}

function backToGuide() {
  void router.push({name: "guide"});
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({behavior: "smooth", block: "start"});
}

async function focusSearch() {
  scrollToId("find-answer");
  await nextTick();
  searchInput.value?.focus({preventScroll: true});
}

async function copyIP() {
  try {
    await navigator.clipboard.writeText(t("serverAddress"));
    isCopied.value = true;
    window.setTimeout(() => {
      isCopied.value = false;
    }, 1800);
  } catch {
    isCopied.value = false;
  }
}
</script>

<style scoped>
.guide-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 7%, rgba(200, 178, 115, 0.07), transparent 25rem),
    #080a10;
  color: var(--myst-ink);
}

.guide-main {
  position: relative;
  width: 100%;
  padding: 112px 24px 96px;
}

.guide-home,
.topic-layout {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.guide-page-enter-active {
  transition:
    opacity 0.24s ease,
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}

.guide-page-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
  transition: none;
}

.guide-page-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.guide-page-leave-to {
  opacity: 0;
  transform: none;
}

.reveal-item {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(24px);
  transition:
    opacity 0.58s ease var(--reveal-delay, 0ms),
    filter 0.58s ease var(--reveal-delay, 0ms),
    transform 0.64s cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
}

.reveal-item.is-revealed {
  opacity: 1;
  filter: none;
  transform: translateY(0);
}

@keyframes guide-child-reveal {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-item.is-revealed .expectation-card,
.reveal-item.is-revealed .task-card,
.reveal-item.is-revealed .journey-step,
.reveal-item.is-revealed .direction-card,
.reveal-item.is-revealed .category-group,
.reveal-item.is-revealed .question-grid button {
  animation: guide-child-reveal 0.45s both;
}

.reveal-item.is-revealed :is(
  .expectation-card,
  .task-card,
  .journey-step,
  .direction-card,
  .category-group,
  .question-grid button
):nth-child(2) {
  animation-delay: 55ms;
}

.reveal-item.is-revealed :is(
  .expectation-card,
  .task-card,
  .journey-step,
  .direction-card,
  .category-group,
  .question-grid button
):nth-child(3) {
  animation-delay: 100ms;
}

.reveal-item.is-revealed :is(
  .expectation-card,
  .task-card,
  .journey-step,
  .direction-card,
  .category-group,
  .question-grid button
):nth-child(4) {
  animation-delay: 145ms;
}

.reveal-item.is-revealed :is(
  .expectation-card,
  .task-card,
  .journey-step,
  .direction-card,
  .category-group,
  .question-grid button
):nth-child(n + 5) {
  animation-delay: 180ms;
}

button,
input {
  font: inherit;
}

button {
  color: inherit;
}

.eyebrow,
.micro-label {
  display: block;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.26em;
  line-height: 1.4;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.guide-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: clamp(40px, 7vw, 96px);
  align-items: center;
  min-height: 430px;
  padding: 56px 0 72px;
}

.hero-copy h1,
.topic-header h1 {
  margin: 14px 0 18px;
  font-family: "Playfair Display", serif;
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.02;
  color: var(--myst-ink-strong);
}

.hero-copy > p,
.topic-header > p {
  max-width: 680px;
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: clamp(16px, 2vw, 19px);
  line-height: 1.75;
}

.hero-actions,
.support-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.button-primary,
.button-secondary,
.copy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 12px 20px;
  border: 1px solid var(--myst-gold);
  border-radius: 0;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.button-primary,
.copy-button {
  background: var(--myst-gold);
  color: #080a10;
}

.button-secondary {
  background: transparent;
  color: var(--myst-ink);
  border-color: rgba(245, 245, 247, 0.2);
}

.button-primary:hover,
.copy-button:hover {
  background: var(--myst-gold-soft);
  color: #080a10;
  transform: translateY(-1px);
}

.button-secondary:hover {
  color: var(--myst-gold);
  border-color: rgba(200, 178, 115, 0.65);
}

.button-primary i,
.button-secondary i,
.text-link i,
.journey-step button i,
.task-arrow,
.search-result > i,
.category-topics button > i,
.question-grid button i,
.related-grid button > i {
  transition: transform 0.22s ease;
}

.button-primary:hover i.fa-arrow-down {
  transform: translateY(3px);
}

.button-secondary:hover i.fa-magnifying-glass {
  transform: scale(1.08);
}

.text-link:hover i,
.journey-step button:hover i,
.task-card:hover .task-arrow,
.search-result:hover > i,
.category-topics button:hover > i,
.question-grid button:hover i,
.related-grid button:hover > i {
  transform: translateX(4px);
}

.join-card {
  position: relative;
  padding: 30px;
  overflow: hidden;
  border: 1px solid rgba(200, 178, 115, 0.32);
  background:
    linear-gradient(135deg, rgba(200, 178, 115, 0.09), transparent 58%),
    rgba(13, 15, 23, 0.94);
}

.join-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 30px;
  width: 56px;
  height: 2px;
  background: var(--myst-gold);
}

.server-address {
  margin: 13px 0 22px;
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1.25;
  color: var(--myst-ink-strong);
  overflow-wrap: anywhere;
}

.copy-button {
  width: 100%;
}

.join-card-note {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  margin-top: 18px;
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.55;
}

.join-card-note i {
  margin-top: 3px;
  color: var(--myst-gold);
}

.quick-facts {
  display: grid;
  grid-template-columns: 0.75fr repeat(3, 1fr);
  border-top: 1px solid rgba(245, 245, 247, 0.12);
  border-bottom: 1px solid rgba(245, 245, 247, 0.12);
}

.quick-facts-label,
.quick-fact {
  min-width: 0;
  padding: 24px;
}

.quick-facts-label {
  align-content: center;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  color: var(--myst-gold);
}

.quick-fact {
  border-left: 1px solid rgba(245, 245, 247, 0.12);
}

.quick-fact span,
.quick-fact strong,
.quick-fact small {
  display: block;
}

.quick-fact span {
  margin-bottom: 5px;
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--myst-ink-muted);
}

.quick-fact strong {
  margin-bottom: 5px;
  font-family: "Playfair Display", serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--myst-ink);
}

.quick-fact small {
  color: var(--myst-ink-muted);
  font-size: 11px;
  line-height: 1.45;
}

.guide-section {
  padding: 92px 0 20px;
  scroll-margin-top: 88px;
}

.expectation-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

.expectation-card {
  grid-column: span 2;
  border: 1px solid rgba(245, 245, 247, 0.13);
  background: rgba(17, 19, 29, 0.78);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.expectation-card:nth-child(4) {
  grid-column: 2 / span 2;
}

.expectation-card:hover,
.expectation-card[open] {
  border-color: rgba(200, 178, 115, 0.48);
  background: rgba(21, 23, 34, 0.92);
}

.expectation-card summary {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 14px;
  align-items: start;
  min-height: 150px;
  padding: 22px;
  list-style: none;
  cursor: pointer;
}

.expectation-card summary::-webkit-details-marker {
  display: none;
}

.expectation-icon,
.task-icon,
.topic-icon,
.direction-icon,
.topic-hero-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(200, 178, 115, 0.26);
  background: rgba(200, 178, 115, 0.07);
  color: var(--myst-gold);
}

.expectation-copy strong,
.expectation-copy small {
  display: block;
}

.expectation-copy strong {
  margin-bottom: 8px;
  font-family: "Playfair Display", serif;
  font-size: 18px;
  line-height: 1.25;
}

.expectation-copy small {
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.55;
}

.expectation-toggle {
  margin-top: 4px;
  color: var(--myst-ink-muted);
  font-size: 11px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.expectation-card[open] .expectation-toggle {
  color: var(--myst-gold);
  transform: rotate(45deg);
}

.expectation-card > p {
  margin: 0;
  padding: 0 22px 22px 78px;
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.65;
}

.expectation-card[open] > p {
  animation: detail-content-in 0.24s ease both;
}

@keyframes detail-content-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-wrap {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  min-height: 64px;
  padding: 0 20px;
  border: 1px solid rgba(200, 178, 115, 0.34);
  background: rgba(13, 15, 23, 0.92);
}

.search-wrap > i {
  margin-right: 14px;
  color: var(--myst-gold);
}

.search-wrap input {
  width: 100%;
  min-width: 0;
  padding: 18px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--myst-ink);
  font-size: 16px;
}

.search-wrap input::placeholder {
  color: color-mix(in srgb, var(--myst-ink-muted) 75%, transparent);
}

.search-wrap button {
  border: 0;
  background: transparent;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.task-card,
.search-result,
.category-topics button,
.related-grid button {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  width: 100%;
  padding: 20px;
  border: 1px solid rgba(245, 245, 247, 0.12);
  background: rgba(17, 19, 29, 0.72);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.task-card:hover,
.search-result:hover,
.category-topics button:hover,
.related-grid button:hover {
  border-color: rgba(200, 178, 115, 0.48);
  background: rgba(24, 26, 38, 0.9);
  transform: translateY(-1px);
}

.task-copy strong,
.task-copy small,
.search-result strong,
.search-result small,
.category-topics strong,
.category-topics small,
.related-grid strong,
.related-grid small {
  display: block;
}

.task-copy strong,
.search-result strong,
.category-topics strong,
.related-grid strong {
  margin-bottom: 4px;
  font-family: "Playfair Display", serif;
  font-size: 17px;
  font-weight: 600;
}

.task-copy small,
.search-result small,
.category-topics small,
.related-grid small {
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.5;
}

.task-arrow,
.search-result > i,
.category-topics button > i,
.related-grid button > i {
  color: var(--myst-ink-muted);
  font-size: 11px;
}

.results-meta {
  margin: 20px 0 10px;
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.result-list {
  position: relative;
  display: grid;
  gap: 10px;
}

.search-result-enter-active,
.search-result-leave-active,
.search-result-move {
  transition:
    opacity 0.24s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.search-result-enter-from,
.search-result-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.search-result-leave-active {
  position: absolute;
  width: 100%;
}

.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 44px 20px;
  border: 1px solid rgba(245, 245, 247, 0.1);
  color: var(--myst-ink-muted);
  text-align: center;
}

.empty-results i {
  margin-bottom: 6px;
  color: var(--myst-gold);
  font-size: 24px;
}

.empty-results strong {
  color: var(--myst-ink);
}

.empty-results span {
  max-width: 500px;
  font-size: 13px;
}

.journey-list {
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}

.journey-list::before {
  content: "";
  position: absolute;
  top: 32px;
  bottom: 32px;
  left: 31px;
  width: 1px;
  background: linear-gradient(var(--myst-gold), rgba(200, 178, 115, 0.08));
}

.journey-step {
  position: relative;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 22px;
  align-items: center;
  min-height: 94px;
  padding: 14px 18px 14px 0;
  border-bottom: 1px solid rgba(245, 245, 247, 0.1);
}

.journey-number {
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 1px solid rgba(200, 178, 115, 0.4);
  border-radius: 50%;
  background: #0d0f17;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
}

.journey-copy h3 {
  margin: 0 0 5px;
  font-family: "Playfair Display", serif;
  font-size: 20px;
  font-weight: 600;
}

.journey-copy p {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.55;
}

.journey-step button,
.text-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.important-callout,
.inline-callout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-top: 18px;
  padding: 18px 20px;
  border-left: 2px solid #c9845a;
  background: rgba(201, 132, 90, 0.08);
}

.important-callout > i,
.inline-callout > i {
  margin-top: 3px;
  color: #d49a72;
}

.important-callout strong,
.inline-callout strong {
  display: block;
  margin-bottom: 4px;
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #d7a17d;
}

.important-callout p,
.inline-callout p {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.6;
}

.direction-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.direction-card {
  display: flex;
  flex-direction: column;
  min-height: 390px;
  padding: 30px;
  border: 1px solid rgba(245, 245, 247, 0.13);
  background: rgba(17, 19, 29, 0.75);
}

.direction-head {
  display: flex;
  gap: 16px;
  align-items: center;
}

.direction-card h3 {
  margin: 5px 0 0;
  font-family: "Playfair Display", serif;
  font-size: 25px;
  font-weight: 600;
}

.direction-card > p {
  margin: 24px 0 14px;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.65;
}

.direction-card ul,
.content-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.direction-card li,
.content-list li {
  position: relative;
  padding: 10px 0 10px 22px;
  border-top: 1px solid rgba(245, 245, 247, 0.08);
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.55;
}

.direction-card li::before,
.content-list li::before {
  content: "✦";
  position: absolute;
  top: 11px;
  left: 1px;
  color: var(--myst-gold);
  font-size: 9px;
}

.direction-card .text-link {
  margin-top: auto;
  align-self: flex-start;
}

.category-list {
  border-top: 1px solid rgba(245, 245, 247, 0.12);
}

.category-group {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 34px;
  padding: 30px 0;
  border-bottom: 1px solid rgba(245, 245, 247, 0.12);
}

.category-heading h3 {
  margin: 0 0 4px;
  font-family: "Playfair Display", serif;
  font-size: 19px;
  font-weight: 600;
}

.category-heading span {
  color: var(--myst-ink-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.category-topics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.category-topics button {
  padding: 16px;
}

.category-topics .topic-icon,
.related-grid .topic-icon {
  width: 36px;
  height: 36px;
}

.category-topics strong,
.related-grid strong {
  font-size: 15px;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid rgba(245, 245, 247, 0.12);
}

.question-grid button {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  min-height: 66px;
  padding: 17px 20px;
  border: 0;
  border-right: 1px solid rgba(245, 245, 247, 0.12);
  border-bottom: 1px solid rgba(245, 245, 247, 0.12);
  background: transparent;
  color: var(--myst-ink);
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.question-grid button:hover {
  background: rgba(200, 178, 115, 0.06);
  color: var(--myst-gold);
}

.question-grid button i {
  flex: 0 0 auto;
  color: var(--myst-gold);
  font-size: 10px;
}

.support-row {
  justify-content: center;
  margin-top: 36px;
}

/* Topic view */
.topic-layout {
  display: grid;
  grid-template-columns: 232px minmax(0, 1fr);
  gap: clamp(40px, 7vw, 84px);
  align-items: start;
}

.topic-sidebar {
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 6px;
}

.back-button,
.mobile-back {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 0 0 18px;
  border: 0;
  border-bottom: 1px solid rgba(245, 245, 247, 0.13);
  background: transparent;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-align: left;
  text-transform: uppercase;
  cursor: pointer;
}

.sidebar-group {
  padding-top: 21px;
}

.sidebar-group > span {
  display: block;
  margin-bottom: 7px;
  color: var(--myst-ink-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sidebar-group button {
  display: block;
  width: 100%;
  padding: 7px 10px;
  border: 0;
  border-left: 1px solid transparent;
  background: transparent;
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.35;
  text-align: left;
  cursor: pointer;
}

.sidebar-group button:hover,
.sidebar-group button.active {
  border-left-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.06);
  color: var(--myst-gold);
}

.topic-article {
  width: 100%;
  max-width: 820px;
}

.mobile-back,
.mobile-topic-index {
  display: none;
}

.topic-header {
  padding: 26px 0 36px;
  border-bottom: 1px solid rgba(245, 245, 247, 0.12);
}

.topic-title-row {
  display: flex;
  gap: 20px;
  align-items: center;
}

.topic-header h1 {
  margin: 14px 0 18px;
  font-size: clamp(38px, 5vw, 60px);
}

.topic-hero-icon {
  width: 58px;
  height: 58px;
  font-size: 20px;
}

.quick-answer {
  margin: 32px 0;
  padding: 24px 26px;
  border: 1px solid rgba(200, 178, 115, 0.38);
  background:
    linear-gradient(120deg, rgba(200, 178, 115, 0.1), transparent 60%),
    rgba(17, 19, 29, 0.84);
}

.quick-answer > span,
.section-index > span {
  display: block;
  margin-bottom: 10px;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.18em;
}

.quick-answer p {
  margin: 0;
  font-family: "Playfair Display", serif;
  font-size: clamp(18px, 2.5vw, 23px);
  line-height: 1.55;
  color: var(--myst-ink);
}

.screenshot-section {
  margin: 38px 0;
}

.screenshot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.screenshot-grid figure {
  margin: 0;
  border: 1px solid rgba(245, 245, 247, 0.12);
  background: rgba(17, 19, 29, 0.8);
}

.screenshot-grid img {
  width: 100%;
  aspect-ratio: 1.65 / 1;
  object-fit: cover;
  image-rendering: auto;
}

.screenshot-grid figcaption {
  padding: 10px 12px;
  color: var(--myst-ink-muted);
  font-family: "JetBrains Mono", monospace;
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.topic-choice-comparison {
  margin: 38px 0;
}

.section-index {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 38px 0 8px;
  padding: 20px 0;
  border-top: 1px solid rgba(245, 245, 247, 0.12);
  border-bottom: 1px solid rgba(245, 245, 247, 0.12);
}

.section-index > span {
  flex: 0 0 100%;
  margin-bottom: 4px;
}

.section-index button {
  padding: 7px 10px;
  border: 1px solid rgba(245, 245, 247, 0.14);
  background: transparent;
  color: var(--myst-ink-muted);
  font-size: 11px;
  cursor: pointer;
}

.section-index button:hover {
  border-color: rgba(200, 178, 115, 0.48);
  color: var(--myst-gold);
}

.topic-section {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 20px;
  padding: 48px 0;
  border-bottom: 1px solid rgba(245, 245, 247, 0.11);
  scroll-margin-top: 90px;
}

.section-number {
  padding-top: 5px;
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 10px;
}

.topic-section-content h2 {
  margin: 0 0 20px;
  font-family: "Playfair Display", serif;
  font-size: clamp(25px, 3vw, 33px);
  font-weight: 600;
  line-height: 1.2;
}

.topic-section-content > p {
  margin: 0 0 14px;
  color: var(--myst-ink-muted);
  font-size: 15px;
  line-height: 1.75;
}

.content-list {
  margin: 10px 0;
}

.content-list li {
  font-size: 14px;
}

.content-steps {
  margin: 16px 0;
  padding: 0;
  list-style: none;
}

.content-steps li {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 14px;
  align-items: start;
  padding: 12px 0;
  border-top: 1px solid rgba(245, 245, 247, 0.09);
}

.content-steps li > span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(200, 178, 115, 0.36);
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 9px;
}

.content-steps p {
  margin: 1px 0 0;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.65;
}

.command-list {
  margin: 18px 0;
  border-top: 1px solid rgba(245, 245, 247, 0.12);
}

.command-row {
  display: grid;
  grid-template-columns: minmax(150px, 0.75fr) 1.25fr;
  gap: 20px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid rgba(245, 245, 247, 0.1);
}

.command-row code {
  color: var(--myst-gold);
  font-family: "JetBrains Mono", monospace;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.command-row span {
  color: var(--myst-ink-muted);
  font-size: 13px;
  line-height: 1.5;
}

.inline-callout.tip {
  border-left-color: var(--myst-gold);
  background: rgba(200, 178, 115, 0.07);
}

.inline-callout.tip > i,
.inline-callout.tip strong {
  color: var(--myst-gold);
}

.related-section {
  padding: 64px 0 10px;
}

.related-grid {
  display: grid;
  gap: 10px;
  margin-top: 15px;
}

@media (max-width: 1024px) {
  .expectation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .expectation-card,
  .expectation-card:nth-child(4) {
    grid-column: auto;
  }

  .expectation-card:last-child {
    grid-column: 1 / -1;
  }

  .topic-layout {
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 38px;
  }

}

@media (max-width: 800px) {
  .guide-main {
    padding: 92px 18px 70px;
  }

  .guide-hero {
    grid-template-columns: 1fr;
    gap: 34px;
    min-height: 0;
    padding: 38px 0 50px;
  }

  .quick-facts {
    grid-template-columns: 1fr;
  }

  .quick-facts-label,
  .quick-fact {
    padding: 18px;
  }

  .quick-fact {
    border-top: 1px solid rgba(245, 245, 247, 0.12);
    border-left: 0;
  }

  .expectation-grid,
  .task-grid,
  .direction-grid,
  .question-grid {
    grid-template-columns: 1fr;
  }

  .expectation-card:last-child {
    grid-column: auto;
  }

  .expectation-card summary {
    min-height: 0;
  }

  .category-group {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .category-topics {
    grid-template-columns: 1fr;
  }

  .question-grid button {
    border-right: 0;
  }

  .topic-layout {
    display: block;
  }

  .topic-sidebar {
    display: none;
  }

  .mobile-back {
    display: flex;
    margin-bottom: 14px;
  }

  .mobile-topic-index {
    display: block;
    margin-bottom: 22px;
    border: 1px solid rgba(245, 245, 247, 0.14);
  }

  .mobile-topic-index summary {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 13px 15px;
    color: var(--myst-gold);
    font-family: "JetBrains Mono", monospace;
    font-size: 9px;
    letter-spacing: 0.12em;
    list-style: none;
    text-transform: uppercase;
    cursor: pointer;
  }

  .mobile-topic-index summary::-webkit-details-marker {
    display: none;
  }

  .mobile-topic-index > div {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 8px;
    border-top: 1px solid rgba(245, 245, 247, 0.12);
  }

  .mobile-topic-index button {
    padding: 9px;
    border: 0;
    background: transparent;
    color: var(--myst-ink-muted);
    font-size: 11px;
    text-align: left;
  }

  .mobile-topic-index button.active {
    color: var(--myst-gold);
    background: rgba(200, 178, 115, 0.07);
  }

  .screenshot-grid {
    grid-template-columns: 1fr;
  }

  .screenshot-grid img {
    aspect-ratio: auto;
  }
}

@media (max-width: 560px) {
  .guide-main {
    padding-right: 14px;
    padding-left: 14px;
  }

  .hero-copy h1,
  .topic-header h1 {
    font-size: 38px;
  }

  .hero-actions,
  .support-row {
    flex-direction: column;
  }

  .hero-actions > *,
  .support-row > * {
    width: 100%;
  }

  .guide-section {
    padding-top: 72px;
  }

  .expectation-card summary,
  .task-card,
  .search-result,
  .category-topics button,
  .related-grid button {
    grid-template-columns: 38px 1fr;
    gap: 12px;
    padding: 17px;
  }

  .expectation-toggle,
  .task-arrow,
  .search-result > i,
  .category-topics button > i,
  .related-grid button > i {
    display: none;
  }

  .expectation-card > p {
    padding-left: 67px;
  }

  .journey-step {
    grid-template-columns: 52px 1fr;
    gap: 14px;
    padding-right: 0;
  }

  .journey-list::before {
    left: 25px;
  }

  .journey-number {
    width: 52px;
    height: 52px;
  }

  .journey-step button {
    grid-column: 2;
    justify-self: start;
  }

  .direction-card {
    padding: 22px;
  }

  .direction-card {
    min-height: 0;
  }

  .topic-title-row {
    align-items: flex-start;
  }

  .topic-hero-icon {
    width: 46px;
    height: 46px;
    margin-top: 15px;
  }

  .topic-section {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 38px 0;
  }

  .command-row {
    grid-template-columns: 1fr;
    gap: 5px;
  }

  .mobile-topic-index > div {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation: none !important;
    filter: none !important;
    opacity: 1 !important;
    transform: none !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
