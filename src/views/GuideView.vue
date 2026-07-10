<template>
  <div class="guide-page">
    <HeaderItem />

    <main class="guide-main">
      <div class="guide-body">

        <div class="guide-content-main">

          <!-- ─── Quick Start ─── -->
          <section id="quickstart" class="guide-section hero-section" data-section="quickstart">
            <div class="hero-copy">
              <div class="eyebrow">{{ t('guide.heroEyebrow') }}</div>
              <h1 class="hero-title">{{ t('guide.heroTitle') }}</h1>
              <p class="hero-lede">{{ t('guide.heroLede') }}</p>
            </div>

            <div class="quickstart-block">
              <div class="ip-block">
                <div class="mono-label" style="margin-bottom: 10px">{{ t('guide.gatewayAddressLabel') }} · {{ t('serverEdition') }}</div>
                <code class="ip-code">{{ t('serverAddress') }}</code>
                <div class="ip-row">
                  <button class="btn-primary-ritual" @click="copyIP">
                    <i :class="isCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"></i>
                    {{ isCopied ? t('copySuccess') : t('copyIP') }}
                  </button>
                  <span v-if="isCopied" class="mono-label gold-text">✓ {{ t('copySuccess').toLowerCase() }}</span>
                </div>
              </div>

              <div class="step-list" style="margin-top: 20px">
                <div class="step-row">
                  <span class="step-n">01</span>
                  <div class="step-t">
                    <b>{{ t('guide.step3_1Title') }}</b>
                    <small>{{ t('guide.step3_1Desc') }} ({{ t('minecraftVersion') }})</small>
                  </div>
                </div>
                <div class="step-row">
                  <span class="step-n">02</span>
                  <div class="step-t">
                    <b>{{ t('guide.step3_2Title') }}</b>
                    <small>{{ t('guide.step3_2Desc') }}</small>
                  </div>
                </div>
                <div class="step-row">
                  <span class="step-n">03</span>
                  <div class="step-t">
                    <b>{{ t('guide.step3_3Title') }}</b>
                    <small>{{ t('guide.step3_3Desc') }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="quickstart-block step-card">
              <div class="mono-label" style="margin-bottom: 14px">{{ t('guide.verifyRiteTitle') }}</div>
              <div class="step-list">
                <div class="step-row">
                  <span class="step-n">01</span>
                  <div class="step-t">{{ t('guide.verify1') }}</div>
                </div>
                <div class="step-row">
                  <span class="step-n">02</span>
                  <div class="step-t">{{ t('guide.verify2') }}</div>
                </div>
                <div class="step-row">
                  <span class="step-n">03</span>
                  <div class="step-t">
                    <b>{{ t('guide.verify3Title') }}</b>
                    <small>{{ t('guide.verify3Desc') }}</small>
                  </div>
                </div>
                <div class="step-row">
                  <span class="step-n">04</span>
                  <div class="step-t">{{ t('guide.verify4') }}</div>
                </div>
              </div>
              <div style="margin-top: 16px">
                <router-link class="btn-primary-ritual" to="/profile">{{ t('guide.openProfile') }}</router-link>
              </div>
            </div>
          </section>

          <!-- ─── Rules ─── -->
          <section id="rules" class="guide-section" data-section="rules">
            <h2 class="section-title">{{ t('guide.rulesTitle') }}</h2>
            <p class="section-lede">{{ t('guide.rulesLede') }}</p>

            <div class="step-list">
              <div class="step-row"><span class="step-n">✦</span><div class="step-t"><b>{{ t('guide.rule1') }}</b><small>{{ t('guide.rule1Sub') }}</small></div></div>
              <div class="step-row"><span class="step-n">✦</span><div class="step-t"><b>{{ t('guide.rule2') }}</b><small>{{ t('guide.rule2Sub') }}</small></div></div>
              <div class="step-row"><span class="step-n">✦</span><div class="step-t"><b>{{ t('guide.rule3') }}</b><small>{{ t('guide.rule3Sub') }}</small></div></div>
              <div class="step-row"><span class="step-n">✦</span><div class="step-t"><b>{{ t('guide.rule4') }}</b><small>{{ t('guide.rule4Sub') }}</small></div></div>
            </div>

            <router-link class="btn-ghost-ritual" style="margin-top: 6px" to="/rules">{{ t('guide.readFullRules') }}</router-link>
          </section>

          <!-- ─── World & Lore (optional) ─── -->
          <section id="world" class="guide-section" data-section="world">
            <div class="section-head-row">
              <h2 class="section-title">{{ t('guide.worldTitle') }}</h2>
              <span class="optional-tag">{{ t('guide.optionalTag') }}</span>
            </div>
            <p class="card-body">{{ t('guide.worldBody') }}</p>
            <div class="lore-links">
              <a class="btn-ghost-ritual" href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505" target="_blank">{{ t('readWebNovel') }}</a>
              <a class="btn-ghost-ritual" href="https://www.crunchyroll.com/series/GEXH3W2EZ/lord-of-mysteries" target="_blank">{{ t('watchAnime') }}</a>
            </div>
          </section>

          <!-- ─── Companion Mod (optional) ─── -->
          <section id="companion" class="guide-section" data-section="companion">
            <div class="section-head-row">
              <h2 class="section-title">{{ t('guide.companionTitle') }}</h2>
              <span class="optional-tag">{{ t('guide.optionalTag') }}</span>
            </div>
            <p class="section-lede">{{ t('guide.companionLede') }}</p>

            <div class="pair-grid">
              <div class="step-card">
                <div class="mono-label" style="margin-bottom: 14px">{{ t('guide.coiWhatTitle') }}</div>
                <div class="step-list">
                  <div class="step-row"><span class="step-n">✦</span><div class="step-t">{{ t('guide.coiFeature1') }}</div></div>
                  <div class="step-row"><span class="step-n">✦</span><div class="step-t">{{ t('guide.coiFeature2') }}</div></div>
                  <div class="step-row"><span class="step-n">✦</span><div class="step-t">{{ t('guide.coiFeature3') }}</div></div>
                </div>
                <div class="coi-footer">
                  <a class="btn-primary-ritual" href="https://github.com/ikeepcalm/coi-client" target="_blank">{{ t('coiClientAcquire') }} →</a>
                  <span class="muted-small">{{ t('coiClientOptional') }}</span>
                </div>
              </div>

              <div class="coi-visual">
                <div class="coi-icon-grid">
                  <div class="coi-feature">
                    <i class="fa-solid fa-bolt coi-icon"></i>
                    <span>{{ t('guide.coiFeatureSpellHotkeys') }}</span>
                  </div>
                  <div class="coi-feature">
                    <i class="fa-solid fa-eye coi-icon"></i>
                    <span>{{ t('guide.coiFeatureVisualEffects') }}</span>
                  </div>
                  <div class="coi-feature">
                    <i class="fa-solid fa-star-of-life coi-icon"></i>
                    <span>{{ t('guide.coiFeatureRichPresence') }}</span>
                  </div>
                  <div class="coi-feature">
                    <i class="fa-solid fa-music coi-icon"></i>
                    <span>{{ t('guide.coiFeatureSounds') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ─── Pathway quiz (optional, for fun) ─── -->
          <section id="pathway" class="guide-section" data-section="pathway">
            <div class="section-head-row">
              <h2 class="section-title">{{ t('guide.pathwayTitle') }}</h2>
              <span class="optional-tag">{{ t('guide.optionalTag') }}</span>
            </div>
            <p class="section-lede">{{ t('guide.pathwayLede') }}</p>

            <div class="quiz-block">
              <transition name="quiz-fade" mode="out-in">
                <div :key="quizStep">
                  <div class="quiz-meta">
                    {{ t('guide.quizQuestion') }} {{ quizStep + 1 }} {{ t('guide.quizOf') }} {{ quizQuestions.length }} ·
                    <span class="gold-text">{{ t('guide.quizChooseOne') }}</span>
                  </div>
                  <h4 class="quiz-question">{{ t(quizQuestions[quizStep].questionKey) }}</h4>
                  <div class="quiz-options">
                    <button
                      v-for="(opt, oi) in quizQuestions[quizStep].options"
                      :key="oi"
                      class="quiz-opt"
                      :class="{ sel: quizAnswers[quizStep] === oi }"
                      @click="answerQuiz(quizStep, oi)"
                    >{{ t(opt.labelKey) }}</button>
                  </div>
                </div>
              </transition>

              <div class="quiz-result" v-if="quizAnswers.some(a => a !== -1)">
                <div class="result-seal">
                  <img :src="pathwayImageUrl(tentativePathway)" :alt="tentativePathway" class="result-pathway-img" />
                </div>
                <div class="result-info">
                  <div class="result-meta">
                    {{ t('guide.tentativeLabel') }} · <span class="gold-text">the {{ capitalize(tentativePathway) }}</span>
                  </div>
                  <div class="result-sub">{{ t(pathwayHintKeys[tentativePathway]) }}</div>
                </div>
                <div class="result-actions">
                  <button
                    v-if="quizStep < quizQuestions.length - 1 && quizAnswers[quizStep] !== -1"
                    class="btn-primary-ritual"
                    @click="quizStep++"
                  >{{ t('guide.nextQuestion') }}</button>
                  <button
                    v-if="quizStep === quizQuestions.length - 1 && quizAnswers[quizStep] !== -1"
                    class="btn-primary-ritual"
                    @click="confirmPathway"
                  >{{ t('guide.confirmPathway') }}</button>
                </div>
              </div>

              <p v-if="confirmedPathway" class="pathway-confirmed-note">{{ t('guide.pathwayConfirmedNote') }}</p>
            </div>
          </section>

          <!-- ─── FAQ ─── -->
          <section id="faq" class="guide-section" data-section="faq">
            <h2 class="section-title">{{ t('guide.faqTitle') }}</h2>
            <div class="faq-block">
              <details class="faq-item"><summary>{{ t('guide.faq1Q') }}</summary><p>{{ t('guide.faq1A') }}</p></details>
              <details class="faq-item"><summary>{{ t('guide.faq2Q') }}</summary><p>{{ t('guide.faq2A') }}</p></details>
              <details class="faq-item"><summary>{{ t('guide.faq3Q') }}</summary><p>{{ t('guide.faq3A') }}</p></details>
              <details class="faq-item"><summary>{{ t('guide.faq4Q') }}</summary><p>{{ t('guide.faq4A') }}</p></details>
              <details class="faq-item"><summary>{{ t('guide.faq5Q') }}</summary><p>{{ t('guide.faq5A') }}</p></details>
            </div>
          </section>

        </div>

        <!-- ─── Table of contents — right side, jump anywhere, no gating ─── -->
        <aside class="guide-toc no-scrollbar">
          <div class="toc-frame">
            <h2 class="toc-title">{{ t('guide.tocTitle') }}</h2>
            <div class="toc-divider"></div>
            <nav class="toc-nav">
              <div
                v-for="nav in navItems"
                :key="nav.id"
                class="toc-nav-item"
                :class="{ active: activeSection === nav.id }"
                @click="scrollToId(nav.id)"
              >
                <span class="toc-text">{{ t(nav.labelKey) }}</span>
              </div>
            </nav>
          </div>
        </aside>

      </div>
    </main>
    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@/composables/useI18n';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import { getPathwayImageUrl } from '@/utils/pathwayPlugin';

const { t } = useI18n();
const route = useRoute();

function pathwayImageUrl(name: string) { return getPathwayImageUrl(name); }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Table of contents ────────────────────────────────────────────────────
const navItems = [
  { id: 'quickstart', labelKey: 'guide.navQuickStart' },
  { id: 'rules',      labelKey: 'guide.navRules' },
  { id: 'world',      labelKey: 'guide.navWorld' },
  { id: 'companion',  labelKey: 'guide.navCompanion' },
  { id: 'pathway',    labelKey: 'guide.navPathway' },
  { id: 'faq',        labelKey: 'guide.navFaq' },
];

// ── Pathway quiz — all 22 canonical Pathways, grouped into 3 thematic
// clusters that map onto the 3 answer options every question already offers
// (knowledge/hidden-truths, authority/power, shadow/mystery). ─────────────
const KNOWLEDGE_PATHWAYS = ['hermit', 'fool', 'fortune', 'visionary', 'door', 'priest', 'mother'] as const;
const AUTHORITY_PATHWAYS = ['emperor', 'sun', 'justiciar', 'giant', 'paragon', 'tyrant', 'tower'] as const;
const SHADOW_PATHWAYS = ['darkness', 'moon', 'death', 'demoness', 'abyss', 'chained', 'hanged', 'error'] as const;

type PathwayKey =
  | typeof KNOWLEDGE_PATHWAYS[number]
  | typeof AUTHORITY_PATHWAYS[number]
  | typeof SHADOW_PATHWAYS[number];

function clusterWeights(list: readonly string[]): Partial<Record<PathwayKey, number>> {
  return Object.fromEntries(list.map(p => [p, 2]));
}

const pathwayHintKeys: Record<PathwayKey, string> = {
  hermit: 'guide.hintHermit', fool: 'guide.hintFool', fortune: 'guide.hintFortune',
  visionary: 'guide.hintVisionary', door: 'guide.hintDoor', priest: 'guide.hintPriest', mother: 'guide.hintMother',
  emperor: 'guide.hintEmperor', sun: 'guide.hintSun', justiciar: 'guide.hintJusticiar',
  giant: 'guide.hintGiant', paragon: 'guide.hintParagon', tyrant: 'guide.hintTyrant', tower: 'guide.hintTower',
  darkness: 'guide.hintDarkness', moon: 'guide.hintMoon', death: 'guide.hintDeath', demoness: 'guide.hintDemoness',
  abyss: 'guide.hintAbyss', chained: 'guide.hintChained', hanged: 'guide.hintHanged', error: 'guide.hintError',
};

interface QuizOption { labelKey: string; weights: Partial<Record<PathwayKey, number>> }

const KNOWLEDGE_W = clusterWeights(KNOWLEDGE_PATHWAYS);
const AUTHORITY_W = clusterWeights(AUTHORITY_PATHWAYS);
const SHADOW_W = clusterWeights(SHADOW_PATHWAYS);

// questionKey is a translation KEY, resolved reactively via t() in the template —
// storing a resolved string here would go stale on a language switch.
const quizQuestions: { questionKey: string; options: QuizOption[] }[] = [
  {
    questionKey: 'guide.quiz1Question',
    options: [
      { labelKey: 'guide.quiz1Option1', weights: KNOWLEDGE_W },
      { labelKey: 'guide.quiz1Option2', weights: AUTHORITY_W },
      { labelKey: 'guide.quiz1Option3', weights: SHADOW_W },
    ],
  },
  {
    questionKey: 'guide.quiz2Question',
    options: [
      { labelKey: 'guide.quiz2Option1', weights: KNOWLEDGE_W },
      { labelKey: 'guide.quiz2Option2', weights: AUTHORITY_W },
      { labelKey: 'guide.quiz2Option3', weights: SHADOW_W },
    ],
  },
  {
    questionKey: 'guide.quiz3Question',
    options: [
      { labelKey: 'guide.quiz3Option1', weights: KNOWLEDGE_W },
      { labelKey: 'guide.quiz3Option2', weights: AUTHORITY_W },
      { labelKey: 'guide.quiz3Option3', weights: SHADOW_W },
    ],
  },
];

// ── Persistence (quiz result only — nothing else needs remembering) ──────
const STORAGE_KEY = 'myst.guide.v3';
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
const saved = loadState();

const quizStep        = ref<number>(saved.quizStep ?? 0);
const quizAnswers     = ref<number[]>(saved.quizAnswers ?? [-1, -1, -1]);
const selectedPathway = ref<PathwayKey>((saved.pathway as PathwayKey) || 'fool');
const confirmedPathway = ref<boolean>(Boolean(saved.pathway));

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    quizStep:    quizStep.value,
    quizAnswers: quizAnswers.value,
    pathway:     confirmedPathway.value ? selectedPathway.value : undefined,
  }));
}
watch([quizStep, quizAnswers, selectedPathway, confirmedPathway], saveState, { deep: true });

// Cluster scoring picks the dominant cluster from the 3 answers, then a
// deterministic tie-break spreads the result across all members of that
// cluster (rather than always landing on the same one or two pathways).
const tentativePathway = computed<PathwayKey>(() => {
  const scores: Partial<Record<PathwayKey, number>> = {};
  quizAnswers.value.forEach((a, qi) => {
    if (a < 0) return;
    Object.entries(quizQuestions[qi].options[a].weights).forEach(([p, v]) => {
      const key = p as PathwayKey;
      scores[key] = (scores[key] ?? 0) + (v ?? 0);
    });
  });

  const entries = Object.entries(scores) as [PathwayKey, number][];
  if (!entries.length) return selectedPathway.value;

  const maxScore = Math.max(...entries.map(([, v]) => v));
  const tied = entries.filter(([, v]) => v === maxScore).map(([p]) => p).sort();
  if (tied.length === 1) return tied[0];

  const seed = quizAnswers.value.reduce((acc, a, i) => acc + (a + 1) * Math.pow(4, i), 0);
  return tied[seed % tied.length];
});

function answerQuiz(qi: number, oi: number) {
  const arr = [...quizAnswers.value];
  arr[qi] = oi;
  quizAnswers.value = arr;
}

function confirmPathway() {
  selectedPathway.value = tentativePathway.value;
  confirmedPathway.value = true;
}

// ── IP copy ───────────────────────────────────────────────────────────────
const isCopied = ref(false);
async function copyIP() {
  try {
    await navigator.clipboard.writeText(t('serverAddress'));
    isCopied.value = true;
    setTimeout(() => { isCopied.value = false; }, 1500);
  } catch { /* ignore */ }
}

// ── Scroll helpers ────────────────────────────────────────────────────────
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Active-section highlight via IntersectionObserver (no gating) ────────
const activeSection = ref('quickstart');
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await nextTick();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          activeSection.value = (e.target as HTMLElement).dataset.section || 'quickstart';
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );
  document.querySelectorAll('[data-section]').forEach(s => observer!.observe(s));

  // Handle hash on load (e.g. /guide#verify)
  if (route.hash) {
    const id = route.hash.slice(1);
    setTimeout(() => scrollToId(id), 100);
  }
});

onUnmounted(() => { observer?.disconnect(); });
</script>

<script lang="ts">
export default {
  name: "GuideView",
};
</script>

<style scoped>
.guide-page {
  min-height: 100vh;
  background-color: #111218;
  color: var(--myst-ink);
}

.guide-main { margin-top: 80px; padding: 0 24px 80px; }

.guide-body {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  gap: 56px;
  align-items: flex-start;
}

.guide-content-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* ── Table of contents — right side, sticky, always visible ── */
.guide-toc {
  flex: 0 0 260px;
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 128px);
  overflow-y: auto;
}

.toc-frame {
  background: var(--myst-bg-2);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  padding: 26px;
}

.toc-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: var(--myst-ink);
  margin: 0 0 16px;
}

.toc-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--myst-gold), transparent);
  margin-bottom: 18px;
  opacity: 0.5;
}

.toc-nav { display: flex; flex-direction: column; gap: 4px; }

.toc-nav-item {
  padding: 9px 10px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}
.toc-nav-item:hover { background: color-mix(in srgb, var(--myst-ink-muted) 8%, transparent); }
.toc-nav-item .toc-text { font-size: 13px; color: var(--myst-ink-muted); transition: color 0.2s; }
.toc-nav-item:hover .toc-text { color: var(--myst-ink); }
.toc-nav-item.active { border-left-color: var(--myst-gold); background: color-mix(in srgb, var(--myst-gold) 8%, transparent); }
.toc-nav-item.active .toc-text { color: var(--myst-gold); }

/* ── Sections ── */
.guide-section {
  padding: 56px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  display: flex;
  flex-direction: column;
  gap: 20px;
  scroll-margin-top: 96px;
}
.guide-section:first-child { padding-top: 8px; }
.guide-section:last-child { border-bottom: none; }

.quickstart-block { display: flex; flex-direction: column; }

.section-head-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.optional-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 30%, transparent);
  padding: 3px 9px;
  border-radius: 20px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 600;
  margin: 0;
  color: var(--myst-ink);
  line-height: 1.2;
}

.section-lede { color: var(--myst-ink-muted); max-width: 62ch; font-size: 16px; margin: 0; line-height: 1.65; }

/* ── Hero ── */
.hero-copy { max-width: 62ch; }

.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--myst-gold);
  margin-bottom: 10px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 4.5vw, 46px);
  font-weight: 600;
  line-height: 1.1;
  margin: 0 0 14px;
  color: var(--myst-ink);
}

.hero-lede { color: var(--myst-ink-muted); font-size: 16px; margin: 0; line-height: 1.65; }

/* ── Buttons ── */
.btn-primary-ritual {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px;
  background: var(--myst-gold); color: var(--myst-bg);
  border: 1px solid var(--myst-gold);
  font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
  letter-spacing: .15em; text-transform: uppercase;
  cursor: pointer; text-decoration: none; transition: all .2s;
}
.btn-primary-ritual:hover { background: var(--myst-gold-soft); border-color: var(--myst-gold-soft); }

.btn-ghost-ritual {
  display: inline-flex; align-items: center; gap: 8px;
  width: fit-content;
  padding: 10px 20px;
  background: transparent; color: var(--myst-ink-muted);
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 35%, transparent);
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: .15em; text-transform: uppercase;
  cursor: pointer; text-decoration: none; transition: all .2s;
}
.btn-ghost-ritual:hover { border-color: var(--myst-ink-muted); color: var(--myst-ink); }

/* ── Quiz ── */
.quiz-block {
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent);
  background: var(--myst-bg-2);
  padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}

.quiz-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: .3em; text-transform: uppercase;
  color: var(--myst-ink-muted); margin-bottom: 8px;
}

.quiz-question { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; margin: 0 0 18px; color: var(--myst-ink); }

.quiz-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

.quiz-opt {
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 25%, transparent);
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  padding: 16px 14px; font-size: 14px; color: var(--myst-ink-muted);
  cursor: pointer; text-align: left; font-family: inherit; line-height: 1.45; transition: all .2s;
}
.quiz-opt:hover { border-color: color-mix(in srgb, var(--myst-gold) 50%, transparent); color: var(--myst-ink); }
.quiz-opt.sel { border-color: var(--myst-gold); color: var(--myst-ink); background: color-mix(in srgb, var(--myst-gold) 8%, transparent); }

.quiz-result {
  display: flex; gap: 18px; align-items: center; flex-wrap: wrap;
  border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); padding-top: 20px;
}

.result-seal {
  width: 72px; height: 72px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent); border-radius: 50%;
  overflow: hidden; flex-shrink: 0; background: var(--myst-bg);
}
.result-pathway-img { width: 100%; height: 100%; object-fit: cover; }

.result-info { flex: 1; min-width: 0; }
.result-meta { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .25em; text-transform: uppercase; color: var(--myst-ink-muted); margin-bottom: 4px; }
.result-sub { font-size: 13px; color: var(--myst-ink-muted); max-width: 44ch; line-height: 1.5; }
.result-actions { display: flex; gap: 8px; }
.gold-text { color: var(--myst-gold); }

.pathway-confirmed-note {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--myst-gold);
  margin: 0;
}

/* ── Grids ── */
.pair-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* ── IP block ── */
.ip-block { border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent); padding: 24px; background: var(--myst-bg-2); }
.mono-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--myst-ink-muted); display: block; }
.ip-code { font-family: 'JetBrains Mono', monospace; font-size: 26px; color: var(--myst-gold); display: block; padding: 14px 0; border-top: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); margin: 10px 0 16px; }
.ip-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

/* ── Step cards ── */
.step-card { border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); background: var(--myst-bg-2); padding: 22px; }
.step-list { display: flex; flex-direction: column; gap: 10px; }
.step-row { display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent); background: color-mix(in srgb, var(--myst-bg) 50%, transparent); }
.step-n { font-family: 'JetBrains Mono', monospace; color: var(--myst-gold); font-size: 12px; min-width: 26px; flex-shrink: 0; padding-top: 1px; }
.step-t { flex: 1; color: var(--myst-ink); font-size: 14px; line-height: 1.5; }
.step-t b { font-weight: 500; display: block; }
.step-t small { display: block; color: var(--myst-ink-muted); font-size: 12px; margin-top: 3px; font-family: 'JetBrains Mono', monospace; letter-spacing: .05em; }

/* ── Card body ── */
.card-body { color: var(--myst-ink-muted); font-size: 14px; margin: 0; line-height: 1.7; max-width: 68ch; }
.lore-links { display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap; }

/* ── COI visual ── */
.coi-visual { border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); background: var(--myst-bg-2); display: flex; align-items: center; justify-content: center; padding: 28px; }
.coi-icon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.coi-feature { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.coi-icon { color: var(--myst-gold); font-size: 28px; }
.coi-feature span { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--myst-ink-muted); }
.coi-footer { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }
.muted-small { font-size: 12px; color: var(--myst-ink-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: .05em; }

/* ── FAQ ── */
.faq-block { padding: 4px 0; }
.faq-item { border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 18%, transparent); padding: 12px 0; }
.faq-item summary { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--myst-ink); outline: none; list-style: none; cursor: pointer; transition: color .2s; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item[open] summary { color: var(--myst-gold); }
.faq-item p { color: var(--myst-ink-muted); font-size: 14px; margin: 8px 0 0; max-width: 56ch; line-height: 1.6; }

/* ── Quiz transition ── */
.quiz-fade-enter-active, .quiz-fade-leave-active { transition: all .3s ease; }
.quiz-fade-enter-from { opacity: 0; transform: translateX(16px); }
.quiz-fade-leave-to   { opacity: 0; transform: translateX(-16px); }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .guide-body { flex-direction: column; gap: 32px; }
  .guide-toc {
    position: static;
    flex: none;
    width: 100%;
    max-height: none;
    order: -1;
  }
  .toc-nav {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
  }
  .toc-nav-item { border-left: none; border-bottom: 2px solid transparent; text-align: center; }
  .toc-nav-item.active { border-left-color: transparent; border-bottom-color: var(--myst-gold); }
}

@media (max-width: 768px) {
  .guide-main { padding: 0 16px 60px; }
  .pair-grid { grid-template-columns: 1fr; }
  .quiz-options { grid-template-columns: 1fr; }
}
</style>
