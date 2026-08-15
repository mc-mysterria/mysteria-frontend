<template>
  <div class="guide-home">
    <!-- ───────────────────────── HERO ───────────────────────── -->
    <section class="guide-hero">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="myst-shell hero-grid">
        <div class="hero-copy">
          <p class="myst-eyebrow">{{ content.ui.eyebrow }}</p>
          <h1 class="hero-title">{{ content.ui.title }}</h1>
          <p class="hero-lede">{{ content.ui.lede }}</p>

          <div class="hero-actions">
            <button class="myst-btn-gold" type="button" @click="scrollTo('first-hour')">
              {{ content.ui.startJourney }}
              <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
            </button>
            <button class="myst-btn-outline" type="button" @click="focusSearch">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
              {{ content.ui.findAnswer }}
            </button>
          </div>

          <div class="quick-facts">
            <div v-for="fact in content.facts" :key="fact.label" class="quick-fact">
              <span class="myst-micro">{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
            </div>
          </div>
        </div>

        <div class="join-card">
          <span class="myst-corner-frame join-frame" aria-hidden="true"></span>
          <p class="join-label">{{ content.ui.serverAddress }}</p>
          <div class="join-address">{{ SERVER_IP }}</div>
          <button class="join-copy" type="button" @click="copyIp">
            <i :class="copied ? 'fa-solid fa-check' : 'fa-solid fa-copy'" aria-hidden="true"></i>
            {{ copied ? content.ui.copied : content.ui.copyAddress }}
          </button>
          <div class="join-points">
            <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>{{ t('guidePage.joinNoMods') }}</span>
            <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>{{ t('guidePage.joinBedrock') }}</span>
            <span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>{{ t('guidePage.joinFree') }}</span>
          </div>

          <!-- "No mods required" always raises the same follow-up question, so the
               answer sits directly underneath it. -->
          <RouterLink class="join-companion" to="/#companion">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
            {{ t('guidePage.joinCompanion') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ──────────────────── FIRST-HOUR CHECKLIST ──────────────────── -->
    <section id="first-hour" class="checklist-section">
      <div class="myst-shell checklist-grid">
        <div class="checklist-aside">
          <p class="myst-eyebrow">{{ t('guidePage.checklistEyebrow') }}</p>
          <h2 class="checklist-title">{{ t('guidePage.checklistTitle') }}</h2>
          <p class="checklist-lede">{{ t('guidePage.checklistLede') }}</p>

          <div class="progress-box">
            <div class="progress-head">
              <span class="myst-micro">{{ t('guidePage.checklistProgress') }}</span>
              <span class="progress-count">{{ doneCount }} / {{ steps.length }}</span>
            </div>
            <div class="myst-meter">
              <span :style="{ width: `${progressPercent}%` }"></span>
            </div>
          </div>
        </div>

        <ol class="checklist">
          <li
              v-for="(step, index) in steps"
              :key="step.title"
              :class="['checklist-step', { done: isDone(index) }]"
          >
            <button
                :aria-pressed="isDone(index)"
                class="step-toggle"
                type="button"
                @click="toggleStep(index)"
            >
              <span class="step-check" aria-hidden="true">{{ isDone(index) ? '✓' : '' }}</span>
              <span class="step-body">
                <span class="step-head">
                  <span class="step-number">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="step-title">{{ step.title }}</span>
                </span>
                <span class="step-description">{{ step.description }}</span>
              </span>
            </button>
            <button
                v-if="step.topicId"
                class="step-link"
                type="button"
                @click="emit('open-topic', step.topicId)"
            >
              {{ content.ui.openStep }}
              <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </button>
          </li>
        </ol>
      </div>
    </section>

    <!-- ───────────────────── STARTER CHOICE ───────────────────── -->
    <section class="starter-section">
      <div class="myst-shell">
        <header class="myst-section-head">
          <span class="rule left" aria-hidden="true"></span>
          <p class="myst-eyebrow">{{ content.ui.starterEyebrow }}</p>
          <span class="rule right" aria-hidden="true"></span>
        </header>
        <h2 class="section-title">{{ content.ui.starterTitle }}</h2>
        <p class="section-lede">{{ content.ui.starterLede }}</p>

        <GuideChoiceComparison :choices="content.starterChoices" :ui="content.ui"/>

        <div class="myst-callout warn starter-warning">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          <p><strong>{{ content.ui.important }}</strong>{{ content.ui.starterWarning }}</p>
        </div>
      </div>
    </section>

    <!-- ─────────────────────── QUICK HELP ─────────────────────── -->
    <section id="answers" class="answers-section">
      <div class="myst-shell">
        <header class="myst-section-head">
          <span class="rule left" aria-hidden="true"></span>
          <p class="myst-eyebrow">{{ content.ui.tasksEyebrow }}</p>
          <span class="rule right" aria-hidden="true"></span>
        </header>
        <h2 class="section-title answers-title">{{ content.ui.tasksTitle }}</h2>

        <div class="search-bar">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input
              ref="searchInput"
              v-model.trim="query"
              :aria-label="content.ui.findAnswer"
              :placeholder="content.ui.searchPlaceholder"
              type="search"
          >
          <span class="search-count">{{ visibleCards.length }} {{ t('guidePage.topicsCount') }}</span>
        </div>

        <p v-if="query && !visibleCards.length" class="no-results">{{ t('guidePage.noTopics') }}</p>

        <div class="topic-cards">
          <button
              v-for="card in visibleCards"
              :key="card.topicId"
              class="topic-card"
              type="button"
              @click="emit('open-topic', card.topicId)"
          >
            <span class="topic-icon"><i :class="card.icon" aria-hidden="true"></i></span>
            <span class="topic-copy">
              <strong>{{ card.title }}</strong>
              <small>{{ card.description }}</small>
            </span>
            <i class="fa-solid fa-arrow-right topic-arrow" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Every topic stays reachable, including the ones without a quick-help card -->
        <details v-if="!query" class="browse-all">
          <summary>
            <i class="fa-solid fa-list" aria-hidden="true"></i>
            {{ t('guidePage.browseAll') }}
          </summary>
          <div class="browse-groups">
            <section v-for="group in topicGroups" :key="group.id">
              <p class="browse-heading">{{ group.label }}</p>
              <button
                  v-for="topic in group.topics"
                  :key="topic.id"
                  class="browse-item"
                  type="button"
                  @click="emit('open-topic', topic.id)"
              >
                <span>{{ topic.shortTitle }}</span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </section>
          </div>
        </details>

        <div class="support-row">
          <RouterLink class="myst-btn-gold" to="/profile">{{ content.ui.profileCta }}</RouterLink>
          <RouterLink class="myst-btn-outline" to="/pathways">{{ content.ui.pathwaysCta }}</RouterLink>
          <RouterLink class="myst-btn-outline" to="/rules">{{ content.ui.fullRulesCta }}</RouterLink>
          <a
              class="myst-btn-outline"
              href="https://discord.com/invite/jc7GSxBWgb"
              rel="noopener noreferrer"
              target="_blank"
          >
            <IconDiscord aria-hidden="true"/>
            {{ content.ui.supportCta }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, ref} from "vue";
import GuideChoiceComparison from "@/components/guide/GuideChoiceComparison.vue";
import IconDiscord from "@/assets/icons/IconDiscord.vue";
import {useI18n} from "@/composables/useI18n";
import {SERVER_IP, useCopyIp} from "@/composables/useServer";
import type {GuideCategory, GuideContent, GuideTopic} from "@/data/guideContent";

const props = defineProps<{
  content: GuideContent;
  /** Full topic list, used by the live search. */
  topics: GuideTopic[];
}>();

const emit = defineEmits<{ (e: "open-topic", topicId: string): void }>();

const {t} = useI18n();
const {copied, copyIp} = useCopyIp();

/* ---------------- First-hour checklist ---------------- */

const STORAGE_KEY = "myst-guide-steps-v1";

const steps = computed(() => props.content.firstHour);

const loadDone = (): number[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((value): value is number => typeof value === "number") : [];
  } catch {
    return [];
  }
};

const done = ref<number[]>(loadDone());

const isDone = (index: number) => done.value.includes(index);
const doneCount = computed(() => done.value.filter(index => index < steps.value.length).length);
const progressPercent = computed(() =>
    steps.value.length ? Math.round((doneCount.value / steps.value.length) * 100) : 0,
);

const toggleStep = (index: number) => {
  done.value = isDone(index) ? done.value.filter(value => value !== index) : [...done.value, index];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done.value));
  } catch {
    // Private-mode storage — the toggle still works for this session.
  }
};

/* ---------------- Quick help search ---------------- */

const query = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

interface TopicCard {
  topicId: string;
  icon: string;
  title: string;
  description: string;
}

const taskCards = computed<TopicCard[]>(() =>
    props.content.tasks.map(task => ({
      topicId: task.topicId,
      icon: task.icon,
      title: task.title,
      description: task.description,
    })),
);

const normalize = (value: string) =>
    value.toLocaleLowerCase().replace(/[’ʼ`]/g, "'").replace(/\s+/g, " ").trim();

const searchCards = computed<TopicCard[]>(() => {
  const needle = normalize(query.value);
  if (!needle) return [];

  return props.topics
      .filter(topic =>
          normalize([topic.title, topic.shortTitle, topic.summary, topic.answer, ...topic.tags].join(" "))
              .includes(needle),
      )
      .map(topic => ({
        topicId: topic.id,
        icon: topic.icon,
        title: topic.shortTitle,
        description: topic.summary,
      }));
});

const visibleCards = computed(() => (query.value ? searchCards.value : taskCards.value));

const categoryOrder: GuideCategory[] = ["start", "progression", "world", "community", "help"];

const topicGroups = computed(() =>
    categoryOrder
        .map(id => ({
          id,
          label: props.content.categories[id],
          topics: props.topics.filter(topic => topic.category === id),
        }))
        .filter(group => group.topics.length),
);

/* ---------------- Navigation helpers ---------------- */

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({behavior: "smooth", block: "start"});
}

async function focusSearch() {
  scrollTo("answers");
  await nextTick();
  searchInput.value?.focus({preventScroll: true});
}
</script>

<style scoped>
/* ───────────────────────── HERO ───────────────────────── */
.guide-hero {
  position: relative;
  padding: 90px 24px 70px;
  background: linear-gradient(180deg, var(--myst-bg-deep), var(--myst-bg));
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 60% 70% at 78% 20%, rgba(200, 178, 115, 0.06), transparent 65%);
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero-title {
  margin: 16px 0 22px;
  font-family: var(--myst-font-display);
  font-size: clamp(36px, 5vw, 60px);
  font-weight: 800;
  line-height: 1.05;
  color: var(--myst-offwhite);
}

.hero-lede {
  margin: 0 0 36px;
  max-width: 56ch;
  color: var(--myst-ink-muted);
  font-size: 17px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.quick-facts {
  display: flex;
  gap: 36px;
  flex-wrap: wrap;
  margin-top: 44px;
  padding-top: 28px;
  border-top: 1px solid var(--myst-line-14);
}

.quick-fact {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.quick-fact strong {
  color: var(--myst-offwhite);
  font-size: 14.5px;
  font-weight: 600;
}

/* Join card */
.join-card {
  position: relative;
  padding: 42px 38px;
  text-align: center;
  background: var(--myst-panel-strong);
  border: 1px solid var(--myst-line-28);
}

.join-frame {
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border-color: var(--myst-line-12);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 24px, 24px 0);
}

.join-label {
  margin: 0 0 16px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.join-address {
  margin-bottom: 24px;
  font-family: var(--myst-font-mono);
  font-size: clamp(19px, 2vw, 24px);
  letter-spacing: 0.02em;
  color: var(--myst-offwhite);
  overflow-wrap: anywhere;
}

.join-copy {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 15px;
  background: var(--myst-gold);
  border: none;
  color: var(--myst-on-gold);
  cursor: pointer;
  font-family: var(--myst-font-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: background 0.25s ease;
}

.join-copy:hover {
  background: var(--myst-offwhite);
}

.join-points {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.join-points span {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--myst-ink-muted);
  font-size: 13px;
}

.join-points i {
  color: var(--myst-gold);
  font-size: 12px;
}

.join-companion {
  margin-top: 18px;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-top: 1px solid var(--myst-line-12);
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  transition: color 0.25s ease;
}

.join-companion:hover {
  color: var(--myst-gold);
}

/* ──────────────────── CHECKLIST ──────────────────── */
.checklist-section {
  padding: 90px 24px;
  background: var(--myst-bg);
}

.checklist-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 64px;
  align-items: start;
}

.checklist-aside {
  position: sticky;
  top: calc(var(--myst-header-height) + 32px);
}

.checklist-title {
  margin: 14px 0 16px;
  font-family: var(--myst-font-display);
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 700;
  line-height: 1.15;
  color: var(--myst-offwhite);
}

.checklist-lede {
  margin: 0 0 24px;
  color: var(--myst-ink-muted);
  font-size: 14.5px;
  line-height: 1.7;
}

.progress-box {
  padding: 18px 22px;
  border: 1px solid var(--myst-line-20);
}

.progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-count {
  font-family: var(--myst-font-mono);
  font-size: 15px;
  font-weight: 700;
  color: var(--myst-gold);
}

.checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.checklist-step {
  position: relative;
  background: var(--myst-panel);
  border: 1px solid var(--myst-line-14);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.checklist-step.done {
  background: rgba(200, 178, 115, 0.03);
  border-color: var(--myst-line-35);
}

.step-toggle {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 24px 28px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: inherit;
}

.step-check {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  margin-top: 2px;
  display: grid;
  place-items: center;
  border: 1px solid var(--myst-line-40);
  border-radius: 2px;
  color: var(--myst-on-gold);
  font-size: 13px;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.checklist-step.done .step-check {
  background: var(--myst-gold);
  border-color: var(--myst-gold);
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 6px;
}

.step-number {
  font-family: var(--myst-font-mono);
  font-size: 11px;
  color: rgba(200, 178, 115, 0.6);
}

.step-title {
  font-family: var(--myst-font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--myst-offwhite);
  transition: color 0.3s ease;
}

.checklist-step.done .step-title {
  color: rgba(200, 178, 115, 0.55);
}

.step-description {
  display: block;
  color: var(--myst-ink-muted);
  font-size: 14px;
  line-height: 1.65;
}

.step-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 28px 20px 80px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  transition: color 0.25s ease;
}

.step-link:hover {
  color: var(--myst-gold);
}

/* ──────────────────── STARTER CHOICE ──────────────────── */
.starter-section {
  padding: 90px 24px;
  background: linear-gradient(180deg, var(--myst-bg), var(--myst-bg-deep) 25%, var(--myst-bg-deep) 75%, var(--myst-bg));
}

.section-title {
  margin: 0 auto 14px;
  font-family: var(--myst-font-display);
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 700;
  color: var(--myst-offwhite);
  text-align: center;
}

.section-lede {
  margin: 0 auto 56px;
  max-width: 66ch;
  text-align: center;
  color: var(--myst-ink-muted);
  font-size: 15.5px;
  line-height: 1.7;
}

.starter-warning {
  max-width: 960px;
  margin: 26px auto 0;
}

/* ──────────────────── QUICK HELP ──────────────────── */
.answers-section {
  padding: 90px 24px 40px;
  background: var(--myst-bg);
}

.answers-title {
  margin-bottom: 48px;
}

.search-bar {
  max-width: 720px;
  margin: 0 auto 44px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 4px 4px 22px;
  background: rgba(13, 16, 30, 0.7);
  border: 1px solid var(--myst-line-28);
  transition: border-color 0.25s ease;
}

.search-bar:focus-within {
  border-color: var(--myst-gold);
}

.search-bar > i {
  color: rgba(200, 178, 115, 0.5);
}

.search-bar input {
  flex: 1;
  min-width: 0;
  padding: 14px 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--myst-offwhite);
  font-family: var(--myst-font-body);
  font-size: 15px;
}

.search-count {
  padding: 10px 16px;
  background: rgba(200, 178, 115, 0.07);
  border: 1px solid var(--myst-line-18);
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  white-space: nowrap;
}

.no-results {
  margin: 0 auto 32px;
  max-width: 60ch;
  text-align: center;
  color: var(--myst-ink-muted);
  font-size: 14.5px;
}

.topic-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  background: var(--myst-panel);
  border: 1px solid var(--myst-line-14);
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.topic-card:hover {
  border-color: var(--myst-line-55);
  transform: translateY(-3px);
}

.topic-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  background: rgba(200, 178, 115, 0.08);
  border: 1px solid var(--myst-line-20);
  border-radius: 2px;
  color: var(--myst-gold);
}

.topic-copy {
  flex: 1;
  min-width: 0;
}

.topic-copy strong {
  display: block;
  margin-bottom: 4px;
  color: var(--myst-offwhite);
  font-size: 15px;
}

.topic-copy small {
  color: var(--myst-ink-muted);
  font-size: 12.5px;
  line-height: 1.5;
}

.topic-arrow {
  color: rgba(200, 178, 115, 0.4);
  font-size: 12px;
}

/* Browse-all fallback */
.browse-all {
  margin-top: 28px;
  border: 1px solid var(--myst-line-12);
}

.browse-all summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 22px;
  cursor: pointer;
  font-family: var(--myst-font-mono);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.browse-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  padding: 0 22px 22px;
}

.browse-heading {
  margin: 0 0 10px;
  font-family: var(--myst-font-mono);
  font-size: 9.5px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.browse-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  background: none;
  border: none;
  border-bottom: 1px solid var(--myst-line-10);
  cursor: pointer;
  text-align: left;
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  transition: color 0.25s ease;
}

.browse-item:hover {
  color: var(--myst-gold);
}

.browse-item i {
  font-size: 10px;
  opacity: 0.5;
}

.support-row {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 64px 0 50px;
}

.support-row .myst-btn-gold,
.support-row .myst-btn-outline {
  padding: 13px 28px;
  font-size: 11.5px;
}

/* ──────────────────── RESPONSIVE ──────────────────── */
@media (max-width: 980px) {
  .hero-grid,
  .checklist-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .checklist-aside {
    position: static;
  }
}

@media (max-width: 700px) {
  .guide-hero,
  .checklist-section,
  .starter-section,
  .answers-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .step-toggle {
    padding: 20px;
    gap: 16px;
  }

  .step-link {
    margin: 0 20px 18px 68px;
  }

  .topic-cards {
    grid-template-columns: 1fr;
  }

  .search-bar {
    flex-wrap: wrap;
    padding: 4px 4px 4px 16px;
  }

  .search-count {
    flex: 1;
    text-align: center;
  }
}
</style>
