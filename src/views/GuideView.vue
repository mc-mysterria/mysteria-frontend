<template>
  <div class="guide-page">
    <HeaderItem />

    <main class="guide-main">
      <div class="guide-layout">

        <!-- ─── Sticky Rail ─── -->
        <aside class="guide-rail">
          <div class="rail-label">{{ t('guide.riteLabel') }} · {{ completedChapters.length }}/0{{ chapIds.length - 1 }}</div>
          <ol class="rail-list">
            <li
              v-for="(ch, idx) in chapDefs"
              :key="idx"
              :class="{ 'is-on': activeChapter === idx, done: completedChapters.includes(idx) }"
              @click="scrollToId(chapIds[idx])"
            >
              <span class="sigil-dot">
                <span v-if="completedChapters.includes(idx)">†</span>
                <span v-else>{{ ch.roman }}</span>
              </span>
              <span>{{ t(ch.labelKey) }}</span>
            </li>
          </ol>
          <div class="rail-hand">{{ t('guide.tapToJump') }}</div>
          <div class="rail-rule"></div>
          <div class="rail-label">{{ t('guide.savedLocally') }}</div>
          <p class="rail-sub">{{ t('guide.savedNote') }}</p>
        </aside>

        <!-- ─── Scroll Story ─── -->
        <div class="guide-story">

          <!-- I. Awakening -->
          <section class="story-section" :id="chapIds[0]" data-chapter="0">
            <div class="chap-no">{{ t('guide.chap1No') }}</div>
            <div class="welcome-block">
              <div class="sigil-ring" aria-hidden="true">✦ RITUAL OF INITIATION ✦</div>
              <h2 class="welcome-big" v-html="t('guide.chap1Title').replace('?', '?<br>')"></h2>
              <p class="welcome-lede">{{ t('guide.chap1Lede') }}</p>
              <div class="cta-row">
                <button class="btn-primary-ritual" @click="scrollToId(chapIds[1])">{{ t('guide.beginRite') }}</button>
                <button class="btn-ghost-ritual" @click="scrollToId(chapIds[6])">{{ t('guide.skipToEnd') }}</button>
              </div>
              <span class="handwriting">{{ t('guide.welcomeBack') }}</span>
            </div>
          </section>

          <!-- II. Pathway -->
          <section class="story-section" :id="chapIds[1]" data-chapter="1">
            <div class="chap-no">{{ t('guide.chap2No') }}</div>
            <h3 class="chap-title">{{ t('guide.chap2Title') }}</h3>
            <p class="chap-lede">{{ t('guide.chap2Lede') }}</p>

            <div class="quiz-block">
              <transition name="quiz-fade" mode="out-in">
                <div :key="quizStep">
                  <div class="quiz-meta">
                    {{ t('guide.quizQuestion') }} {{ quizStep + 1 }} {{ t('guide.quizOf') }} {{ quizQuestions.length }} ·
                    <span class="gold-text">{{ t('guide.quizChooseOne') }}</span>
                  </div>
                  <h4 class="quiz-question">{{ quizQuestions[quizStep].questionKey }}</h4>
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
            </div>
          </section>

          <!-- III. Gateway & Join -->
          <section class="story-section" :id="chapIds[2]" data-chapter="2">
            <div class="chap-no">{{ t('guide.chap3No') }}</div>
            <h3 class="chap-title">{{ t('guide.chap3Title') }}</h3>
            <p class="chap-lede">{{ t('guide.chap3Lede') }}</p>

            <div class="hero-grid">
              <div>
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

              <div class="img-frame">
                <img :src="joinImg" alt="Add server screenshot" class="guide-img" />
                <div class="frame-inset"></div>
              </div>
            </div>

            <div class="section-check" @click="toggleComplete(2)">
              <span class="checkbox-box" :class="{ done: completedChapters.includes(2) }"></span>
              <span class="check-text">{{ t('guide.chap3Check') }}</span>
            </div>
          </section>

          <!-- IV. Verify -->
          <section class="story-section" :id="chapIds[3]" data-chapter="3">
            <div class="chap-no">{{ t('guide.chap4No') }}</div>
            <h3 class="chap-title">{{ t('guide.chap4Title') }}</h3>
            <p class="chap-lede">{{ t('guide.chap4Lede') }}</p>

            <div class="pair-grid">
              <div class="step-card">
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

              <div class="img-frame">
                <img :src="verifyImg" alt="Verify screenshot" class="guide-img" />
                <div class="frame-inset"></div>
              </div>
            </div>

            <div class="section-check" @click="toggleComplete(3)">
              <span class="checkbox-box" :class="{ done: completedChapters.includes(3) }"></span>
              <span class="check-text">{{ t('guide.chap4Check') }}</span>
            </div>
          </section>

          <!-- V. Covenant & World -->
          <section class="story-section" :id="chapIds[4]" data-chapter="4">
            <div class="chap-no">{{ t('guide.chap5No') }}</div>
            <h3 class="chap-title">{{ t('guide.chap5Title') }}</h3>
            <p class="chap-lede">{{ t('guide.chap5Lede') }}</p>

            <div class="pair-grid">
              <div class="step-card">
                <div class="mono-label" style="margin-bottom: 14px">{{ t('guide.covenantTitle') }}</div>
                <div class="step-list">
                  <div class="step-row"><span class="step-n">I</span><div class="step-t"><b>{{ t('guide.rule1') }}</b><small>{{ t('guide.rule1Sub') }}</small></div></div>
                  <div class="step-row"><span class="step-n">II</span><div class="step-t"><b>{{ t('guide.rule2') }}</b><small>{{ t('guide.rule2Sub') }}</small></div></div>
                  <div class="step-row"><span class="step-n">III</span><div class="step-t"><b>{{ t('guide.rule3') }}</b><small>{{ t('guide.rule3Sub') }}</small></div></div>
                  <div class="step-row"><span class="step-n">IV</span><div class="step-t"><b>{{ t('guide.rule4') }}</b><small>{{ t('guide.rule4Sub') }}</small></div></div>
                </div>
              </div>

              <div class="step-card">
                <div class="mono-label" style="margin-bottom: 14px">{{ t('guide.worldTitle') }}</div>
                <p class="card-body">{{ t('guide.worldBody') }}</p>
                <div class="lore-links">
                  <a class="btn-ghost-ritual" href="https://www.webnovel.com/book/lord-of-mysteries_11022733006234505" target="_blank">{{ t('readWebNovel') }}</a>
                  <a class="btn-ghost-ritual" href="https://www.crunchyroll.com/series/GEXH3W2EZ/lord-of-mysteries" target="_blank">{{ t('watchAnime') }}</a>
                </div>
              </div>
            </div>

            <div class="section-check" @click="toggleComplete(4)">
              <span class="checkbox-box" :class="{ done: completedChapters.includes(4) }"></span>
              <span class="check-text">{{ t('guide.chap5Check') }}</span>
            </div>
          </section>

          <!-- VI. COI Mod -->
          <section class="story-section" :id="chapIds[5]" data-chapter="5">
            <div class="chap-no">{{ t('guide.chap6No') }}</div>
            <h3 class="chap-title">{{ t('guide.chap6Title') }}</h3>
            <p class="chap-lede">{{ t('guide.chap6Lede') }}</p>

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

            <div class="section-check" @click="toggleComplete(5)">
              <span class="checkbox-box" :class="{ done: completedChapters.includes(5) }"></span>
              <span class="check-text">{{ t('guide.chap6Check') }}</span>
            </div>
          </section>

          <!-- Completion + FAQ -->
          <section class="story-section" :id="chapIds[6]" data-chapter="6">
            <div class="chap-no">{{ t('guide.sealNo') }}</div>
            <h3 class="chap-title">{{ t('guide.sealTitle') }}</h3>
            <p class="chap-lede">{{ t('guide.sealLede') }}</p>

            <div class="final-grid">
              <div class="sigil-complete">
                <div class="seal-big">
                  <img :src="pathwayImageUrl(selectedPathway)" :alt="selectedPathway" class="seal-pathway-img" />
                </div>
                <div class="mono-label gold-text" style="margin: 16px 0 6px">
                  {{ t('guide.believerLabel') }} · {{ selectedPathway.toUpperCase() }} {{ t('guide.pathwayLabel') }}
                </div>
                <div class="muted-small">{{ t('guide.initiatedLabel') }} · {{ initiationDate }}</div>
                <div class="cta-row" style="justify-content: center; margin-top: 20px; gap: 10px">
                  <router-link class="btn-primary-ritual" to="/">{{ t('guide.returnGateway') }}</router-link>
                  <button class="btn-ghost-ritual" @click="resetProgress">{{ t('guide.resetProgress') }}</button>
                </div>
              </div>

              <div class="faq-block">
                <div class="mono-label" style="margin-bottom: 14px">{{ t('guide.faqTitle') }}</div>
                <details class="faq-item"><summary>{{ t('guide.faq1Q') }}</summary><p>{{ t('guide.faq1A') }}</p></details>
                <details class="faq-item"><summary>{{ t('guide.faq2Q') }}</summary><p>{{ t('guide.faq2A') }}</p></details>
                <details class="faq-item"><summary>{{ t('guide.faq3Q') }}</summary><p>{{ t('guide.faq3A') }}</p></details>
                <details class="faq-item"><summary>{{ t('guide.faq4Q') }}</summary><p>{{ t('guide.faq4A') }}</p></details>
                <details class="faq-item"><summary>{{ t('guide.faq5Q') }}</summary><p>{{ t('guide.faq5A') }}</p></details>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@/composables/useI18n';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import { getPathwayImageUrl } from '@/utils/pathwayPlugin';
import joinImg from '@/assets/images/guide/join.webp';
import verifyImg from '@/assets/images/guide/verify.webp';

const { t } = useI18n();
const route = useRoute();

function pathwayImageUrl(name: string) { return getPathwayImageUrl(name); }
function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Chapter definitions ────────────────────────────────────────────────────
const chapIds = ['awakening', 'pathway', 'gateway', 'verify', 'covenant', 'companion', 'completion'];

const chapDefs = [
  { roman: 'I',   labelKey: 'guide.chap1Label' },
  { roman: 'II',  labelKey: 'guide.chap2Label' },
  { roman: 'III', labelKey: 'guide.chap3Label' },
  { roman: 'IV',  labelKey: 'guide.chap4Label' },
  { roman: 'V',   labelKey: 'guide.chap5Label' },
  { roman: 'VI',  labelKey: 'guide.chap6Label' },
  { roman: '✦',   labelKey: 'guide.chap7Label' },
];

// ── Pathway quiz ──────────────────────────────────────────────────────────
type PathwayKey = 'fool' | 'hermit' | 'emperor' | 'moon' | 'death' | 'sun' | 'darkness' | 'fortune';

const pathwayHintKeys: Record<string, string> = {
  fool:     'guide.hintFool',
  hermit:   'guide.hintHermit',
  emperor:  'guide.hintEmperor',
  moon:     'guide.hintMoon',
  death:    'guide.hintDeath',
  sun:      'guide.hintSun',
  darkness: 'guide.hintDarkness',
  fortune:  'guide.hintFortune',
};

interface QuizOption { labelKey: string; weights: Partial<Record<PathwayKey, number>> }

const quizQuestions: { questionKey: string; options: QuizOption[] }[] = [
  {
    questionKey: computed(() => t('guide.quiz1Question')).value,
    options: [
      { labelKey: 'guide.quiz1Option1', weights: { hermit: 2, fool: 1, fortune: 1 } },
      { labelKey: 'guide.quiz1Option2', weights: { emperor: 2, sun: 1 } },
      { labelKey: 'guide.quiz1Option3', weights: { darkness: 2, moon: 1, death: 1 } },
    ],
  },
  {
    questionKey: computed(() => t('guide.quiz2Question')).value,
    options: [
      { labelKey: 'guide.quiz2Option1', weights: { hermit: 2, fortune: 1 } },
      { labelKey: 'guide.quiz2Option2', weights: { emperor: 2, sun: 1 } },
      { labelKey: 'guide.quiz2Option3', weights: { darkness: 2, moon: 1, death: 1, fool: 1 } },
    ],
  },
  {
    questionKey: computed(() => t('guide.quiz3Question')).value,
    options: [
      { labelKey: 'guide.quiz3Option1', weights: { hermit: 2, fool: 2, fortune: 1 } },
      { labelKey: 'guide.quiz3Option2', weights: { emperor: 2, sun: 2 } },
      { labelKey: 'guide.quiz3Option3', weights: { death: 2, darkness: 1, moon: 1 } },
    ],
  },
];

// ── Persistence ───────────────────────────────────────────────────────────
const STORAGE_KEY = 'myst.guide.v2';
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
const saved = loadState();

const quizStep          = ref<number>(saved.quizStep ?? 0);
const quizAnswers       = ref<number[]>(saved.quizAnswers ?? [-1, -1, -1]);
const selectedPathway   = ref<string>(saved.pathway ?? 'fool');
const completedChapters = ref<number[]>(saved.completed ?? []);

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    quizStep:    quizStep.value,
    quizAnswers: quizAnswers.value,
    pathway:     selectedPathway.value,
    completed:   completedChapters.value,
  }));
}
watch([quizStep, quizAnswers, selectedPathway, completedChapters], saveState, { deep: true });

const tentativePathway = computed<string>(() => {
  const scores: Record<string, number> = {};
  quizAnswers.value.forEach((a, qi) => {
    if (a < 0) return;
    Object.entries(quizQuestions[qi].options[a].weights).forEach(([p, v]) => {
      scores[p] = (scores[p] ?? 0) + v;
    });
  });
  if (!Object.keys(scores).length) return selectedPathway.value;
  return Object.entries(scores).sort((x, y) => y[1] - x[1])[0][0];
});

function answerQuiz(qi: number, oi: number) {
  const arr = [...quizAnswers.value];
  arr[qi] = oi;
  quizAnswers.value = arr;
}

function confirmPathway() {
  selectedPathway.value = tentativePathway.value;
  toggleComplete(1);
  scrollToId(chapIds[2]);
}

function toggleComplete(idx: number) {
  const arr = [...completedChapters.value];
  const pos = arr.indexOf(idx);
  if (pos >= 0) arr.splice(pos, 1); else arr.push(idx);
  completedChapters.value = arr;
}

function resetProgress() {
  quizStep.value = 0;
  quizAnswers.value = [-1, -1, -1];
  selectedPathway.value = 'fool';
  completedChapters.value = [];
  scrollToId(chapIds[0]);
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

// ── Initiation date ───────────────────────────────────────────────────────
const initiationDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// ── Scroll helpers ────────────────────────────────────────────────────────
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Scroll-spy via IntersectionObserver ──────────────────────────────────
const activeChapter = ref(0);
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await nextTick();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          activeChapter.value = Number((e.target as HTMLElement).dataset.chapter);
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
  );
  document.querySelectorAll('[data-chapter]').forEach(s => observer!.observe(s));

  // Handle hash on load (e.g. /guide#verify)
  if (route.hash) {
    const id = route.hash.slice(1);
    setTimeout(() => scrollToId(id), 100);
  }
});

onUnmounted(() => { observer?.disconnect(); });
</script>

<style scoped>
/* ── Page shell — matches RulesView background exactly ── */
.guide-page {
  min-height: 100vh;
  background-color: #111218;
  color: var(--myst-ink);
}

.guide-main {
  margin-top: 80px;
  padding: 0 32px 80px;
}

.guide-layout {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 52px;
  align-items: start;
}

/* ── Rail ── */
.guide-rail {
  position: sticky;
  top: 96px;
  border-left: 2px solid color-mix(in srgb, var(--myst-gold) 20%, transparent);
  padding: 4px 0 4px 20px;
}

.rail-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: .3em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
  margin-bottom: 14px;
  display: block;
}

.rail-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rail-list li {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: var(--myst-ink-muted);
  cursor: pointer;
  transition: color .2s;
  user-select: none;
}

.rail-list li:hover { color: var(--myst-ink); }

.sigil-dot {
  width: 22px;
  height: 22px;
  border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 40%, transparent);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--myst-ink-muted);
  flex-shrink: 0;
  transition: all .25s;
}

.rail-list li.is-on { color: var(--myst-gold); }
.rail-list li.is-on .sigil-dot {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--myst-gold) 10%, transparent);
}
.rail-list li.done .sigil-dot {
  background: color-mix(in srgb, var(--myst-gold) 12%, transparent);
  border-color: var(--myst-gold);
  color: var(--myst-gold);
}

.rail-hand {
  font-family: 'Caveat', cursive;
  color: var(--myst-gold);
  font-size: 15px;
  margin-top: 14px;
  transform: rotate(-2deg);
  display: inline-block;
  opacity: .6;
}

.rail-rule { height: 1px; background: color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); margin: 14px 0; }

.rail-sub { font-size: 12px; color: var(--myst-ink-muted); margin: 6px 0 0; max-width: 160px; line-height: 1.5; }

/* ── Story ── */
.guide-story { padding-top: 16px; }

.story-section {
  min-height: 80vh;
  padding: 52px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--myst-ink-muted) 15%, transparent);
  display: flex;
  flex-direction: column;
  gap: 20px;
  /* offset so sticky header doesn't overlap the anchor target */
  scroll-margin-top: 90px;
}

.story-section:last-child { border-bottom: none; min-height: auto; }

.chap-no {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: .45em;
  color: var(--myst-gold);
  text-transform: uppercase;
}

.chap-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 600;
  margin: 0;
  color: var(--myst-ink);
  line-height: 1.2;
}

.chap-lede { color: var(--myst-ink-muted); max-width: 62ch; font-size: 16px; margin: 0; line-height: 1.65; }

/* ── Welcome block ── */
.welcome-block {
  background: radial-gradient(ellipse at 25% 30%, color-mix(in srgb, var(--myst-gold) 6%, transparent), transparent 60%);
  border: 1px solid color-mix(in srgb, var(--myst-gold) 25%, transparent);
  padding: 48px 40px;
  position: relative;
  overflow: hidden;
}

.sigil-ring {
  position: absolute; right: -50px; top: 50%; transform: translateY(-50%);
  width: 260px; height: 260px;
  border: 1px solid color-mix(in srgb, var(--myst-gold) 18%, transparent); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: color-mix(in srgb, var(--myst-gold) 25%, transparent);
  font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .4em;
  pointer-events: none;
}
.sigil-ring::before {
  content: ''; position: absolute; inset: 22px;
  border: 1px dashed color-mix(in srgb, var(--myst-gold) 15%, transparent); border-radius: 50%;
}

.welcome-big {
  font-family: 'Playfair Display', serif;
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 600; line-height: 1.1; max-width: 16ch;
  margin: 0 0 14px; color: var(--myst-ink);
}

.welcome-lede { color: var(--myst-ink-muted); max-width: 52ch; font-size: 16px; margin: 0 0 22px; line-height: 1.65; }

.cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

.handwriting {
  font-family: 'Caveat', cursive;
  font-size: 20px; color: var(--myst-gold);
  transform: rotate(-1.5deg); display: inline-block; margin-top: 14px; opacity: .75;
}

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

/* ── Grids ── */
.hero-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items: start; margin-top: 8px; }
.pair-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }

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

/* ── Images ── */
.img-frame { border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); background: var(--myst-bg-2); position: relative; overflow: hidden; min-height: 220px; display: flex; align-items: center; justify-content: center; }
.guide-img { width: 100%; height: 100%; object-fit: cover; opacity: .88; display: block; }
.frame-inset { position: absolute; inset: 8px; border: 1px solid color-mix(in srgb, var(--myst-gold) 12%, transparent); pointer-events: none; }

/* ── Card body ── */
.card-body { color: var(--myst-ink-muted); font-size: 14px; margin: 0; line-height: 1.7; }
.lore-links { display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap; }

/* ── COI visual ── */
.coi-visual { border: 1px solid color-mix(in srgb, var(--myst-ink-muted) 20%, transparent); background: var(--myst-bg-2); display: flex; align-items: center; justify-content: center; padding: 28px; }
.coi-icon-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.coi-feature { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
.coi-icon { color: var(--myst-gold); font-size: 28px; }
.coi-feature span { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--myst-ink-muted); }
.coi-footer { margin-top: 18px; display: flex; flex-direction: column; gap: 10px; }

/* ── Checkboxes ── */
.section-check { display: flex; align-items: center; gap: 10px; margin-top: 18px; cursor: pointer; width: fit-content; }
.check-text { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .15em; text-transform: uppercase; color: var(--myst-ink-muted); }
.checkbox-box { width: 18px; height: 18px; border: 1px solid color-mix(in srgb, var(--myst-gold) 40%, transparent); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: transparent; }
.checkbox-box:hover { border-color: var(--myst-gold); }
.checkbox-box.done { background: color-mix(in srgb, var(--myst-gold) 12%, transparent); border-color: var(--myst-gold); color: var(--myst-gold); }
.checkbox-box.done::after { content: '†'; }

/* ── Final / Sigil ── */
.final-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 8px; }
.sigil-complete { border: 1px solid color-mix(in srgb, var(--myst-gold) 30%, transparent); padding: 36px; text-align: center; background: var(--myst-bg-2); display: flex; flex-direction: column; align-items: center; }
.seal-big { width: 140px; height: 140px; border: 1px solid color-mix(in srgb, var(--myst-gold) 45%, transparent); border-radius: 50%; overflow: hidden; position: relative; box-shadow: 0 0 0 8px color-mix(in srgb, var(--myst-gold) 6%, transparent); }
.seal-big::before { content: ''; position: absolute; inset: 10px; border: 1px dashed color-mix(in srgb, var(--myst-gold) 20%, transparent); border-radius: 50%; z-index: 1; pointer-events: none; }
.seal-pathway-img { width: 100%; height: 100%; object-fit: cover; display: block; }
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
  .guide-layout { grid-template-columns: 1fr; padding: 0; }
  .guide-rail { display: none; }
  .hero-grid, .pair-grid, .final-grid { grid-template-columns: 1fr; }
  .quiz-options { grid-template-columns: 1fr; }
  .sigil-ring { display: none; }
  .welcome-block { padding: 32px 24px; }
}
</style>
