<template>
  <div class="rules-page">
    <HeaderItem/>

    <main class="covenant myst-shell">
      <header class="covenant-head">
        <p class="myst-eyebrow">{{ t('rulesPage.eyebrow') }}</p>
        <h1 class="myst-h1">{{ t('lawsOfMysterria') }}</h1>
        <p class="covenant-lede">{{ t('rulesPage.lede') }}</p>
      </header>

      <div v-if="isPrivilegedUser" class="covenant-tabs">
        <div class="myst-segmented">
          <button
              :class="{ active: activeTab === 'player' }"
              type="button"
              @click="setActiveTab('player')"
          >
            {{ t('playerRules') }}
          </button>
          <button
              :class="{ active: activeTab === 'staff' }"
              type="button"
              @click="setActiveTab('staff')"
          >
            {{ t('staffRules') }}
          </button>
        </div>
      </div>

      <div class="covenant-body">
        <aside ref="tocRef" class="covenant-toc">
          <p class="toc-heading">{{ t('tableOfContents') }}</p>

          <nav class="toc-list">
            <button
                v-for="entry in tocEntries"
                :key="entry.id"
                :class="['toc-item', { active: activeId === entry.id, chapter: entry.isChapter }]"
                :data-toc-id="entry.id"
                type="button"
                @click="goToRule(entry.id)"
            >
              <span class="toc-id">{{ entry.id }}</span>
              <span class="toc-title">{{ entry.title }}</span>
            </button>
          </nav>

          <p class="toc-note">
            <i class="fa-solid fa-gavel" aria-hidden="true"></i>
            {{ t('rulesPage.appeals') }}
          </p>
        </aside>

        <div class="covenant-content">
          <!-- Player covenant -->
          <template v-if="activeTab === 'player'">
            <section
                v-for="chapter in chapters"
                :id="`law-${chapter.id}`"
                :key="chapter.id"
                class="law-chapter"
            >
              <header class="chapter-head">
                <span class="chapter-number">{{ chapter.id }}</span>
                <div>
                  <h2>{{ chapter.title }}</h2>
                  <p v-if="chapter.subtitle" class="chapter-subtitle">{{ chapter.subtitle }}</p>
                </div>
              </header>

              <p v-if="chapter.content" class="chapter-intro">{{ chapter.content }}</p>

              <div class="rule-rows">
                <div
                    v-for="rule in chapter.rules"
                    :id="`rule-${rule.id}`"
                    :key="rule.id"
                    class="rule-row rule-row--costed"
                >
                  <span class="rule-id">{{ rule.id }}</span>
                  <div class="rule-copy">
                    <strong>{{ rule.title }}</strong>
                    <p>{{ rule.content }}</p>
                  </div>
                  <div class="rule-cost">
                    <span
                        v-if="hasCost(rule)"
                        :class="['warns', toneFor(headlineWarns(rule))]"
                    >
                      {{ costLabel(rule) }}
                    </span>
                    <span v-else class="warns-spacer"></span>

                    <button
                        v-if="rule.ladder"
                        :aria-expanded="openLadder === rule.id"
                        :aria-label="t('rulesPage.ladderAria')"
                        class="cost-info"
                        type="button"
                        @click="toggleLadder(rule.id)"
                    >
                      <i aria-hidden="true" class="fa-solid fa-circle-info"></i>
                    </button>
                    <span v-else class="cost-info-spacer"></span>

                    <div
                        v-if="rule.ladder"
                        :class="['ladder', { open: openLadder === rule.id }]"
                        role="note"
                    >
                      <p class="ladder-heading">{{ t('rulesPage.ladderHeading') }}</p>
                      <table class="ladder-table">
                        <thead>
                        <tr>
                          <th scope="col">{{ t('rulesPage.ladderCase') }}</th>
                          <th scope="col">{{ t('rulesPage.ladderCost') }}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(step, index) in rule.ladder" :key="index">
                          <td>{{ step.case }}</td>
                          <td :class="['ladder-cost', toneFor(step.warns)]">
                            {{ warnLabel(step.warns) }}
                          </td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div class="myst-callout">
              <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
              <p>{{ t('rulesPage.staffNote') }}</p>
            </div>
          </template>

          <!-- Staff code -->
          <template v-else>
            <section
                v-for="(group, index) in staffRules"
                :id="`law-staff-${index}`"
                :key="group.group"
                class="law-chapter"
            >
              <header class="chapter-head">
                <span class="chapter-number">{{ index + 1 }}</span>
                <div>
                  <h2>{{ group.group }}</h2>
                </div>
              </header>

              <div class="rule-rows">
                <div
                    v-for="rule in group.rules"
                    :id="`staff-rule-${rule.id}`"
                    :key="rule.id"
                    class="rule-row"
                >
                  <span class="rule-id">{{ rule.id }}</span>
                  <div class="rule-copy">
                    <strong>{{ rule.title }}</strong>
                    <p>{{ rule.content }}</p>
                    <p v-if="rule.examples" class="rule-examples">
                      <span class="myst-micro">{{ t('examples') }}</span>
                      {{ rule.examples }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>
    </main>

    <FooterItem/>
    <DailyBonusCat page="rules"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {useRoute} from 'vue-router'
import {useI18n} from "@/composables/useI18n";
import {breadcrumbLd, useSeo} from "@/composables/useSeo";
import {useAuthStore} from "@/stores/auth";
import HeaderItem from "@/components/layout/HeaderItem.vue";
import FooterItem from "@/components/layout/FooterItem.vue";
import DailyBonusCat from "@/components/ui/DailyBonusCat.vue";

const {t, tree, plural, currentLanguage} = useI18n();
const authStore = useAuthStore();
const route = useRoute();

/*
 * A rule costs warnings, and warnings are the only scale on the page: they run
 * 1 to 8, and 8 is a permanent ban from both platforms. That is why nothing here
 * carries a separate "instant ban" category - an offence that ends it on the
 * spot is simply worth 8.
 *
 * A rule that has to cover both a careless mistake and a deliberate campaign
 * carries a `ladder` instead of a flat cost, and the badge then shows the range
 * rather than one number. The ladder is the source of truth for those: deriving
 * the badge from it means the headline can never drift from the breakdown.
 */
interface LadderStep {
  case: string
  warns: number
}

interface Rule {
  id: string
  title: string
  content: string
  examples?: string
  warns?: number
  ladder?: LadderStep[]
}

interface StaffRuleGroup {
  group: string
  rules: Rule[]
}

interface Chapter {
  id: string
  title: string
  subtitle?: string
  content: string
  rules: Rule[]
}

const rules = ref<Rule[]>([]);
const staffRules = ref<StaffRuleGroup[]>([]);
const activeId = ref<string>('');
const tocRef = ref<HTMLElement | null>(null);

const isPrivilegedUser = computed(() => {
  const role = authStore.userRole?.toUpperCase();
  return Boolean(role) && role !== 'MEMBER' && role !== 'PLAYER' && role !== 'USER';
});

const activeTab = ref<'player' | 'staff'>('player');
const setActiveTab = (tab: 'player' | 'staff') => (activeTab.value = tab);

useSeo(() => ({
  title: t('lawsOfMysterria'),
  description: t('rulesPage.lede'),
  path: '/rules',
  // The staff code is gated content and must never be the indexed version.
  noindex: activeTab.value === 'staff',
  jsonLd: [breadcrumbLd([{name: 'Home', path: '/'}, {name: 'Rules', path: '/rules'}])],
}));

/** "Corruption of Spirit (Chat & Communication)" → title + mono subtitle. */
const splitTitle = (raw: string) => {
  const match = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return match ? {title: match[1], subtitle: match[2]} : {title: raw, subtitle: undefined};
};

const chapters = computed<Chapter[]>(() => {
  const grouped: Chapter[] = [];
  for (const rule of rules.value) {
    if (!rule.id.includes('.')) {
      const {title, subtitle} = splitTitle(rule.title);
      grouped.push({id: rule.id, title, subtitle, content: rule.content, rules: []});
    } else {
      grouped[grouped.length - 1]?.rules.push(rule);
    }
  }
  return grouped;
});

const tocEntries = computed(() => {
  if (activeTab.value === 'staff') {
    return staffRules.value.flatMap((group, index) => [
      {id: String(index + 1), title: group.group, isChapter: true},
      ...group.rules.map(rule => ({id: rule.id, title: rule.title, isChapter: false})),
    ]);
  }

  return chapters.value.flatMap(chapter => [
    {id: chapter.id, title: chapter.title, isChapter: true},
    ...chapter.rules.map(rule => ({id: rule.id, title: rule.title, isChapter: false})),
  ]);
});

const PERMANENT = 8;

const hasCost = (rule: Rule) => rule.warns !== undefined || Boolean(rule.ladder);

const warnsIn = (rule: Rule) => rule.ladder?.map(step => step.warns) ?? [];

/** The number the badge is coloured by: the worst outcome the rule allows. */
const headlineWarns = (rule: Rule) =>
    rule.ladder ? Math.max(...warnsIn(rule)) : rule.warns ?? 0;

const warnWord = (count: number) =>
    plural(count, tree<{ one: string; few: string; many: string }>('rulesPage.warnForms'));

const countLabel = (count: number) =>
    count === 0 ? t('rulesPage.noWarning') : `${count} ${warnWord(count)}`;

/** Table cell: the full outcome, permanence spelled out. */
const warnLabel = (count: number) =>
    count >= PERMANENT ? `${countLabel(count)} · ${t('rulesPage.permanent')}` : countLabel(count);

/*
 * Badge: the count alone, never the permanence tail. Every badge on the page is
 * one fixed-width box, and "8 warns · permanent" is twice the width of "1 warn"
 * - so permanence is carried by the filled red treatment instead, and spelled
 * out where there is room for it: the ladder table, and rules 7.1 and 7.2.
 */
const costLabel = (rule: Rule) => {
  if (!rule.ladder) return countLabel(rule.warns ?? 0);

  const counts = warnsIn(rule);
  const low = Math.min(...counts);
  const high = Math.max(...counts);
  if (low === high) return countLabel(high);

  // An en dash, not "to": the range has to survive translation without a word.
  return `${low}–${high} ${warnWord(high)}`;
};

const toneFor = (count: number) => {
  if (count === 0) return 'none';
  if (count >= PERMANENT) return 'permanent';
  if (count >= 5) return 'severe';
  if (count >= 3) return 'major';
  return 'minor';
};

/*
 * The ladder opens on hover and on keyboard focus through CSS alone; this state
 * exists for touch, where neither fires. Only one is open at a time.
 */
const openLadder = ref<string>('');
const toggleLadder = (id: string) => (openLadder.value = openLadder.value === id ? '' : id);

const HEADER_OFFSET = 92;

/** TOC entry id → the DOM id of the section it points at, for the active tab. */
const elementIdFor = (id: string) => {
  const isChapter = !id.includes('.');
  if (activeTab.value === 'staff') return isChapter ? `law-staff-${Number(id) - 1}` : `staff-rule-${id}`;
  return isChapter ? `law-${id}` : `rule-${id}`;
};

/*
 * Clicking the TOC sets the active entry immediately and suppresses the
 * scroll-spy until the smooth scroll settles - otherwise every rule the page
 * flies past would grab the highlight on the way to the target.
 */
let suppressSpyUntil = 0;

const goToRule = (id: string) => {
  activeId.value = id;
  suppressSpyUntil = performance.now() + 900;

  const element = document.getElementById(elementIdFor(id));
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({top, behavior: 'smooth'});
};

/*
 * Scroll-spy. The sticky TOC implies "you are here", so it has to follow the
 * reader. Rects are read once per entry per animation frame, never per scroll
 * event - scroll events outrun frames and each read forces layout.
 */
let spyRaf: number | null = null;

const measureActiveRule = () => {
  spyRaf = null;
  if (performance.now() < suppressSpyUntil) return;

  const entries = tocEntries.value;
  if (!entries.length) return;

  // The entry whose heading is the last one at or above the reading line.
  const readingLine = HEADER_OFFSET + 24;
  let current = '';
  for (const entry of entries) {
    const element = document.getElementById(elementIdFor(entry.id));
    if (!element) continue;
    if (element.getBoundingClientRect().top <= readingLine) current = entry.id;
    else break;
  }

  // Above the first heading nothing is active; at the very bottom the last
  // entry is, since it may be too short to ever reach the reading line.
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = entries[entries.length - 1].id;
  }
  activeId.value = current;
};

const onScroll = () => {
  if (spyRaf === null) spyRaf = requestAnimationFrame(measureActiveRule);
};

const loadRulesForLanguage = async (lang: string) => {
  try {
    const module = await import(`@/assets/sources/rules_${lang}.json`);
    rules.value = module.default as Rule[];
  } catch {
    try {
      const module = await import('@/assets/sources/rules_en.json');
      rules.value = module.default as Rule[];
    } catch {
      rules.value = [];
    }
  }
};

const loadStaffRulesForLanguage = async (lang: string) => {
  if (!isPrivilegedUser.value) {
    staffRules.value = [];
    return;
  }
  try {
    const module = await import(`@/assets/sources/staff_rules_${lang}.json`);
    staffRules.value = module.default as StaffRuleGroup[];
  } catch {
    try {
      const module = await import('@/assets/sources/staff_rules_en.json');
      staffRules.value = module.default as StaffRuleGroup[];
    } catch {
      staffRules.value = [];
    }
  }
};

onMounted(() => {
  const tabQuery = route.query.tab as string | undefined;
  if (tabQuery === 'staff' || tabQuery === 'player') activeTab.value = tabQuery;
  void loadRulesForLanguage(currentLanguage.value);
  void loadStaffRulesForLanguage(currentLanguage.value);
  window.addEventListener('scroll', onScroll, {passive: true});
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  if (spyRaf !== null) cancelAnimationFrame(spyRaf);
});

/* Rules arrive asynchronously, so the first measurement waits for the DOM. */
watch(tocEntries, () => {
  void nextTick(measureActiveRule);
});

/*
 * The TOC scrolls independently once the list is long, so the highlighted entry
 * has to be kept inside it - scrolling the panel only, never the page.
 */
watch(activeId, id => {
  const panel = tocRef.value;
  if (!id || !panel) return;
  const item = panel.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(id)}"]`);
  if (!item) return;

  /*
   * Measured through rects rather than offsetTop. The panel is `position:
   * sticky`, which makes it the offsetParent, so item.offsetTop is already
   * panel-relative - subtracting panel.offsetTop then drove every result
   * negative and clamped the scroll to 0, which is why the list never followed
   * the reader.
   */
  const itemRect = item.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const itemTop = itemRect.top - panelRect.top + panel.scrollTop;
  const itemBottom = itemTop + itemRect.height;
  const margin = 40;

  if (itemTop < panel.scrollTop + margin) {
    panel.scrollTo({top: Math.max(0, itemTop - margin), behavior: 'smooth'});
  } else if (itemBottom > panel.scrollTop + panel.clientHeight - margin) {
    panel.scrollTo({top: itemBottom - panel.clientHeight + margin, behavior: 'smooth'});
  }
});

watch(currentLanguage, lang => {
  void loadRulesForLanguage(lang);
  void loadStaffRulesForLanguage(lang);
});

watch(isPrivilegedUser, privileged => {
  void loadStaffRulesForLanguage(currentLanguage.value);
  if (!privileged) activeTab.value = 'player';
});

watch(activeTab, () => (activeId.value = ''));
</script>

<style scoped>
.rules-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--myst-bg);
  color: var(--myst-ink);
}

.covenant {
  flex: 1 0 auto;
  width: 100%;
  padding: 80px 24px 90px;
}

.covenant-head {
  margin-bottom: 22px;
  text-align: center;
}

.covenant-head .myst-eyebrow {
  margin-bottom: 14px;
}

.covenant-lede {
  margin: 18px auto 0;
  max-width: 58ch;
  color: var(--myst-ink-muted);
  font-size: 15.5px;
  line-height: 1.7;
}

.covenant-tabs {
  display: flex;
  justify-content: center;
  margin: 34px 0 22px;
}

.covenant-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  align-items: start;
  margin-top: 34px;
}

/* TOC */
.covenant-toc {
  position: sticky;
  top: calc(var(--myst-header-height) + 28px);
  max-height: calc(100vh - var(--myst-header-height) - 56px);
  overflow-y: auto;
  padding: 28px 26px;
  background: var(--myst-panel);
  border: 1px solid var(--myst-line-18);
  scrollbar-width: thin;
}

.toc-heading {
  margin: 0 0 18px;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: baseline;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-left: 2px solid transparent;
  cursor: pointer;
  text-align: left;
  color: var(--myst-ink-muted);
  font-family: var(--myst-font-body);
  font-size: 13px;
  transition: all 0.2s ease;
}

.toc-item:hover {
  color: var(--myst-offwhite);
}

.toc-item.chapter .toc-title {
  color: var(--myst-offwhite);
  font-weight: 600;
}

.toc-item.active {
  background: rgba(200, 178, 115, 0.08);
  border-left-color: var(--myst-gold);
  color: var(--myst-offwhite);
}

.toc-id {
  font-family: var(--myst-font-mono);
  font-size: 10.5px;
  color: rgba(200, 178, 115, 0.7);
}

.toc-note {
  margin: 24px 0 0;
  padding-top: 20px;
  border-top: 1px solid var(--myst-line-12);
  color: var(--myst-ink-muted);
  font-size: 12px;
  line-height: 1.65;
}

.toc-note i {
  margin-right: 8px;
  color: var(--myst-gold);
  font-size: 11px;
}

/* Chapters */
.covenant-content {
  display: flex;
  flex-direction: column;
  gap: 44px;
  min-width: 0;
}

.chapter-head {
  display: flex;
  align-items: baseline;
  gap: 20px;
  padding-bottom: 16px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--myst-line-28);
}

.chapter-number {
  font-family: var(--myst-font-display);
  font-size: 40px;
  font-weight: 800;
  line-height: 1;
  color: rgba(200, 178, 115, 0.35);
}

.chapter-head h2 {
  margin: 0;
  font-family: var(--myst-font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--myst-offwhite);
}

.chapter-subtitle {
  margin: 6px 0 0;
  font-family: var(--myst-font-mono);
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.chapter-intro {
  margin: 0 0 20px;
  max-width: 72ch;
  color: var(--myst-ink-muted);
  font-size: 15px;
  line-height: 1.75;
}

.rule-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-row {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  gap: 18px;
  align-items: start;
  padding: 20px 24px;
  background: linear-gradient(160deg, rgba(13, 16, 30, 0.5), rgba(8, 10, 20, 0.75));
  border: 1px solid var(--myst-line-12);
}

/*
 * Player rules reserve a fixed cost column so every badge is the same box in
 * the same place. The width is set here once, and has to clear the longest
 * label any locale produces - "0-8 AVERTISSEMENTS" in French, not "1 WARN" in
 * English - because the UI strings localise even while the rules themselves
 * fall back to English.
 */
.rule-row--costed {
  --cost-badge: 144px;
  grid-template-columns: 48px 1fr calc(var(--cost-badge) + 26px);
}

.rule-id {
  padding-top: 2px;
  font-family: var(--myst-font-mono);
  font-size: 12px;
  color: var(--myst-gold);
}

.rule-copy strong {
  display: block;
  margin-bottom: 6px;
  color: var(--myst-offwhite);
  font-size: 15.5px;
}

.rule-copy p {
  margin: 0;
  color: var(--myst-ink-muted);
  font-size: 13.5px;
  line-height: 1.65;
}

.rule-examples {
  margin-top: 12px !important;
  padding-left: 14px;
  border-left: 2px solid var(--myst-line-20);
  font-style: italic;
}

.rule-examples .myst-micro {
  display: block;
  margin-bottom: 4px;
  font-style: normal;
}

/*
 * What a rule costs, in warnings.
 *
 * The badge is one fixed width for every rule on the page, and the column is
 * reserved even on the rules that carry no cost at all (7.1-7.4, 8.1, 8.3), so
 * the badges line up as a column rather than ragging along the right edge.
 */
.rule-cost {
  position: relative;
  display: grid;
  grid-template-columns: var(--cost-badge) 20px;
  gap: 6px;
  align-items: center;
}

.warns,
.warns-spacer {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--cost-badge);
  min-height: 26px;
  box-sizing: border-box;
  padding: 5px 8px;
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.warns {
  border: 1px solid;
}

.warns.none {
  color: var(--myst-ink-muted);
  border-color: var(--myst-line-20);
}

.warns.minor,
.warns.major {
  color: var(--myst-amber);
  border-color: rgba(224, 160, 79, 0.35);
}

.warns.severe {
  color: var(--myst-red);
  border-color: rgba(217, 106, 106, 0.4);
}

/* Filled rather than outlined: 8 warnings is the end of the ladder, and the
   badge no longer has room to say so in words. */
.warns.permanent {
  color: var(--myst-bg);
  background: var(--myst-red);
  border-color: var(--myst-red);
  font-weight: 600;
}

.cost-info {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--myst-ink-muted);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.cost-info:hover,
.cost-info:focus-visible {
  color: var(--myst-ink);
}

/*
 * The breakdown. Hover and keyboard focus open it through CSS; `.open` is the
 * touch path, where neither of those fires.
 */
.ladder {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 5;
  width: max-content;
  min-width: 250px;
  max-width: min(360px, 82vw);
  padding: 12px 14px;
  border: 1px solid var(--myst-line-20);
  background: var(--myst-bg-2);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
}

.rule-cost:hover .ladder,
.rule-cost:focus-within .ladder,
.ladder.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.ladder-heading {
  margin: 0 0 10px;
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.ladder-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.ladder-table th {
  padding: 0 0 6px;
  border-bottom: 1px solid var(--myst-line-20);
  font-family: var(--myst-font-mono);
  font-size: 8.5px;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--myst-ink-muted);
}

.ladder-table th:last-child,
.ladder-cost {
  text-align: right;
}

.ladder-table td {
  padding: 8px 0;
  border-bottom: 1px solid var(--myst-line-12);
  vertical-align: top;
}

.ladder-table tr:last-child td {
  border-bottom: 0;
  padding-bottom: 0;
}

.ladder-table td:first-child {
  padding-right: 14px;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--myst-ink-muted);
}

.ladder-cost {
  font-family: var(--myst-font-mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.ladder-cost.none {
  color: var(--myst-ink-muted);
}

.ladder-cost.minor,
.ladder-cost.major {
  color: var(--myst-amber);
}

.ladder-cost.severe,
.ladder-cost.permanent {
  color: var(--myst-red);
}

@media (max-width: 1000px) {
  .covenant-body {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .covenant-toc {
    position: static;
    max-height: none;
  }

  .toc-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 4px;
  }
}

@media (max-width: 640px) {
  .covenant {
    padding: 50px 20px 70px;
  }

  .rule-row {
    grid-template-columns: 42px 1fr;
    gap: 12px;
    padding: 18px 18px;
  }
  .rule-row--costed {
    grid-template-columns: 42px 1fr;
  }

  .rule-cost {
    grid-column: 2;
    justify-self: start;
    margin-top: 4px;
  }

  .ladder {
    right: auto;
    left: 0;
  }
}
</style>
