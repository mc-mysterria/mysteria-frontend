<template>
  <div class="pathways-page">
    <HeaderItem/>
    <main>
      <header class="archive-hero">
        <span class="eyebrow">{{ ui.archive }}</span>
        <h1>{{ ui.title }}</h1>
        <p>{{ ui.subtitle }}</p>
        <div class="archive-stats"><span><b>{{ pathways.length }}</b> {{
            ui.pathways
          }}</span><i/><span><b>{{ totalSequences }}</b> {{ ui.sequences }}</span><i/><span><b>{{ totalAbilities }}</b> {{
            ui.abilities
          }}</span></div>
        <div class="archive-freshness"><span
            class="freshness-dot"/>{{ currentLanguage === 'uk' ? 'Оновлено' : 'Last updated' }} {{
            formattedLastUpdated
          }} <i>·</i> {{
            currentLanguage === 'uk' ? 'Дані можуть дещо відрізнятися від поточної версії гри' : 'Details may differ slightly from the current game version'
          }}
        </div>
        <RouterLink class="registry-cta" to="/ascension">{{ ui.registryCta }} →</RouterLink>
      </header>
      <section class="archive-layout">
        <aside class="pathway-browser">
          <label class="search-label"
                 for="pathway-search">{{ currentLanguage === 'uk' ? 'Пошук в архіві' : 'Search the archive' }}</label>
          <label class="search-box">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-4-4"/>
            </svg>
            <input id="pathway-search" v-model="query" :placeholder="ui.search" type="search">
            <button v-if="query" :aria-label="currentLanguage === 'uk' ? 'Очистити пошук' : 'Clear search'"
                    @click="query=''">×
            </button>
            <kbd v-else>⌕</kbd></label>
          <nav class="pathway-list" :aria-label="ui.allPathways">
            <template v-for="group in pathwayGroups" :key="group.id">
              <div v-if="group.pathways.length" class="browser-heading"><span>{{
                  group.label
                }}</span><b>{{ group.pathways.length }}</b></div>
              <button v-for="pathway in group.pathways" :key="pathway.id" :class="{active:pathway.id===selected.id}"
                      @click="selectPathway(pathway.id)">
                <span class="sigil"><img v-if="imageFor(pathway.id)" :src="imageFor(pathway.id)" alt=""><b
                    v-else>{{ pathway.id[0].toUpperCase() }}</b></span>
                <span><strong>{{ pathwayName(pathway.id) }}</strong><small>{{
                    pathway.sequences.length
                  }} {{ ui.sequences }}</small></span><span class="chevron">›</span>
              </button>
            </template>
          </nav>
          <p v-if="!filteredPathways.length" class="empty">{{ ui.noResults }}</p>
        </aside>
        <article class="pathway-detail">
          <div class="pathway-controls">
            <header class="pathway-header">
              <div class="large-sigil"><img v-if="imageFor(selected.id)" :src="imageFor(selected.id)" alt=""><b v-else>{{
                  selected.id[0].toUpperCase()
                }}</b></div>
              <div><span>{{ ui.pathway }}</span>
                <h2>{{ pathwayName(selected.id) }}</h2>
                <p>{{ ui.progression }}</p></div>
            </header>
            <div class="sequence-jump">
              <button v-for="sequence in visibleSequences" :key="sequence.sequence"
                      :class="[sequenceClass(sequence.sequence),{current:activeSequence===sequence.sequence}]"
                      @click="scrollToSequence(sequence.sequence)"><small>{{
                  sequenceRank(sequence.sequence) || ui.seq
                }}</small><b>{{ sequence.sequence }}</b></button>
            </div>
          </div>
          <div v-if="visibleSequences.length" class="sequence-list">
            <section v-for="sequence in visibleSequences" :id="`sequence-${sequence.sequence}`" :key="sequence.sequence"
                     :class="['sequence-card',{current:activeSequence===sequence.sequence}]">
              <div class="sequence-number" :class="sequenceClass(sequence.sequence)">
                <small>{{ sequenceRank(sequence.sequence) || ui.sequence }}</small><b>{{ sequence.sequence }}</b></div>
              <div class="sequence-content">
                <div class="sequence-title">
                  <div><span>{{ ui.designation }}</span>
                    <h3>{{ localized(sequence.name) }}</h3></div>
                  <small>{{ matchingSequenceAbilities(sequence).length }} {{ ui.abilities }}</small></div>
                <div class="abilities-grid">
                  <div v-for="ability in matchingSequenceAbilities(sequence)" :key="ability.id" class="ability"><span
                      class="ability-mark"/>
                    <div><h4>{{ localized(ability.name) }}</h4>
                      <p>{{ localized(ability.description) }}</p></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div v-else class="detail-empty"><span>⌁</span>
            <h3>{{ ui.noAbilities }}</h3>
            <p>{{ ui.trySearch }}</p></div>
        </article>
      </section>
    </main>
    <FooterItem/>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useI18n} from '@/composables/useI18n';
import {breadcrumbLd, itemListLd, useSeo} from '@/composables/useSeo';
import {
  type Ability,
  boonPathwayIds,
  corePathways,
  type Localized,
  type Pathway,
  type Sequence,
  pathwayImage,
  pathwayImageName,
  pathwayName as localizedPathwayName,
  pathways,
  pathwaysLastUpdated,
  sequenceRank as localizedSequenceRank,
} from '@/data/pathways';

const formattedLastUpdated = computed(() => new Intl.DateTimeFormat(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC'
}).format(new Date(`${pathwaysLastUpdated}T00:00:00Z`)));
const copy = {
  en: {
    archive: 'BEYONDER ARCHIVE',
    title: 'Pathways & Sequences',
    subtitle: 'Study every route to the divine. Discover each Sequence and the abilities it unlocks before choosing your fate.',
    pathways: 'Pathways',
    sequences: 'Sequences',
    abilities: 'Abilities',
    search: 'Search pathways or abilities…',
    allPathways: 'All pathways',
    pathway: 'Pathway',
    progression: 'Sequence progression · 9 → 0',
    seq: 'SEQ',
    sequence: 'Sequence',
    designation: 'Designation',
    noResults: 'Nothing found in the archive.',
    noAbilities: 'No matching abilities',
    trySearch: 'Try another search or clear the field.',
    registryCta: 'Sequence 3–0 seats are limited - see live availability'
  },
  uk: {
    archive: 'АРХІВ ПОТОЙБІЧНОГО',
    title: 'Шляхи та Послідовності',
    subtitle: 'Дослідіть кожен шлях до божественного. Дізнайтеся про Послідовності та здібності, перш ніж обрати свою долю.',
    pathways: 'Шляхів',
    sequences: 'Послідовностей',
    abilities: 'Здібностей',
    search: 'Пошук Шляхів або здібностей…',
    allPathways: 'Усі Шляхи',
    pathway: 'Шлях',
    progression: 'Розвиток Послідовності · 9 → 0',
    seq: 'ПОСЛ',
    sequence: 'Послідовність',
    designation: 'Назва',
    noResults: 'В архіві нічого не знайдено.',
    noAbilities: 'Здібностей не знайдено',
    trySearch: 'Спробуйте інший запит або очистьте поле.',
    registryCta: 'Місця Послідовностей 3–0 обмежені - перегляньте наявність'
  }
};
const {currentLanguage} = useI18n(), route = useRoute(), router = useRouter(), query = ref(''),
    activeSequence = ref<number>();
const ui = computed(() => copy[currentLanguage.value]);
const routeId = computed(() => typeof route.params.pathway === 'string' && pathways.some(p => p.id === route.params.pathway) ? route.params.pathway : pathways[0].id),
    selectedId = ref(routeId.value);
watch(routeId, id => selectedId.value = id);
const selected = computed(() => pathways.find(p => p.id === selectedId.value) ?? pathways[0]);
const localized = (v: Localized) => v[currentLanguage.value] || v.en;
const pathwayName = (id: string) => localizedPathwayName(id, currentLanguage.value);
const imageFor = (id: string) => pathwayImage(id);
const totalSequences = computed(() => pathways.reduce((n, p) => n + p.sequences.length, 0)),
    totalAbilities = computed(() => pathways.reduce((n, p) => n + p.sequences.reduce((m, s) => m + s.abilities.length, 0), 0));
const haystack = (p: Pathway) => [pathwayName(p.id), ...p.sequences.flatMap(s => [localized(s.name), ...s.abilities.flatMap(a => [localized(a.name), localized(a.description)])])].join(' ').toLowerCase();
const filteredPathways = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? pathways.filter(p => haystack(p).includes(q)) : pathways
});
const pathwayGroups = computed(() => [
  {
    id: 'normal',
    label: currentLanguage.value === 'uk' ? 'Звичайні Шляхи' : 'Standard Pathways',
    pathways: filteredPathways.value.filter(p => !boonPathwayIds.has(p.id))
  },
  {
    id: 'boons',
    label: currentLanguage.value === 'uk' ? 'Благословення' : 'Boons',
    pathways: filteredPathways.value.filter(p => boonPathwayIds.has(p.id))
  }
]);

useSeo(() => {
  const hasPathway = typeof route.params.pathway === 'string';
  const name = pathwayName(selected.value.id);
  const abilityCount = selected.value.sequences.reduce((n, s) => n + s.abilities.length, 0);
  const trail = [{name: 'Home', path: '/'}, {name: 'Pathways', path: '/pathways'}];

  if (!hasPathway) {
    return {
      title: 'Pathways & Sequences - Beyonder Archive',
      description: `Every one of the ${corePathways.length} Beyonder Pathways from Lord of the Mysteries, playable on Mysterria: Sequence names 9 to 0 and all ${totalAbilities.value} abilities.`,
      path: '/pathways',
      imageAlt: 'Mysterria Beyonder Pathways',
      jsonLd: [
        breadcrumbLd(trail),
        itemListLd(
            'Beyonder Pathways',
            corePathways.map(p => ({name: pathwayName(p.id), path: `/pathways/${p.id}`})),
        ),
      ],
    };
  }

  return {
    title: `${name} Pathway - Sequences & Abilities`,
    description: `The ${name} Pathway on Mysterria: ${selected.value.sequences.length} Sequences from 9 to 0 and ${abilityCount} Beyonder abilities, with the ritual and acting each rung demands.`,
    path: `/pathways/${selected.value.id}`,
    image: imageFor(selected.value.id)
        ? `/pathways/${pathwayImageName(selected.value.id)}.webp`
        : undefined,
    imageAlt: `${name} Pathway symbol`,
    jsonLd: [breadcrumbLd([...trail, {name, path: `/pathways/${selected.value.id}`}])],
  };
});

const selectedNameMatches = computed(() => {
  const q = query.value.trim().toLowerCase();
  return !!q && pathwayName(selected.value.id).toLowerCase().includes(q)
});
const matchingAbilities = (abilities: Ability[]) => {
  const q = query.value.trim().toLowerCase();
  return q && !selectedNameMatches.value ? abilities.filter(a => `${localized(a.name)} ${localized(a.description)}`.toLowerCase().includes(q)) : abilities
};
const matchingSequenceAbilities = (sequence: Sequence) => {
  const q = query.value.trim().toLowerCase();
  return q && localized(sequence.name).toLowerCase().includes(q) ? sequence.abilities : matchingAbilities(sequence.abilities)
};
const visibleSequences = computed(() => {
  const q = query.value.trim().toLowerCase();
  return !q || selectedNameMatches.value ? selected.value.sequences : selected.value.sequences.filter(s => localized(s.name).toLowerCase().includes(q) || matchingAbilities(s.abilities).length)
});
watch(filteredPathways, (matches) => {
  if (query.value.trim() && matches.length && !matches.some(p => p.id === selectedId.value)) {
    selectedId.value = matches[0].id;
    router.replace({name: 'pathways', params: {pathway: matches[0].id}})
  }
}, {flush: 'post'});
function sequenceRank(n: number) {
  return localizedSequenceRank(n, currentLanguage.value)
}

function sequenceClass(n: number) {
  return n <= 4 ? `ranked rank-${n}` : ''
}

/*
 * Scroll-spy for the sequence rail. The rects are read once per card and only
 * once per animation frame - the previous version re-measured both sides of the
 * comparison inside a reduce, so a single scroll event forced ~20 layouts and
 * scroll events fire far faster than frames.
 */
let spyRaf: number | null = null;

function measureActiveSequence() {
  spyRaf = null;
  const cards = document.querySelectorAll<HTMLElement>('.sequence-card');
  if (!cards.length) return;
  const threshold = 240;
  let bestId = '';
  let bestDistance = Infinity;
  for (const card of cards) {
    const distance = Math.abs(card.getBoundingClientRect().top - threshold);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = card.id;
    }
  }
  if (bestId) activeSequence.value = Number(bestId.replace('sequence-', ''))
}

function updateActiveSequence() {
  if (spyRaf === null) spyRaf = requestAnimationFrame(measureActiveSequence)
}

function selectPathway(id: string) {
  selectedId.value = id;
  activeSequence.value = pathways.find(p => p.id === id)?.sequences[0]?.sequence;
  router.replace({name: 'pathways', params: {pathway: id}});
  if (innerWidth < 900) requestAnimationFrame(() => document.querySelector('.pathway-detail')?.scrollIntoView({behavior: 'smooth'}))
}

function scrollToSequence(n: number) {
  activeSequence.value = n;
  document.getElementById(`sequence-${n}`)?.scrollIntoView({behavior: 'smooth', block: 'start'})
}

watch(visibleSequences, sequences => {
  activeSequence.value = sequences[0]?.sequence;
  nextTick(updateActiveSequence)
}, {immediate: true});
// Metadata is handled by useSeo above, which tracks these sources itself.
onMounted(() => window.addEventListener('scroll', updateActiveSequence, {passive: true}));
onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSequence);
  if (spyRaf !== null) cancelAnimationFrame(spyRaf)
});
</script>

<style scoped>
.pathways-page {
  min-height: 100vh;
  background: #070910;
  color: #eceae4
}

.archive-hero {
  padding: 84px 24px 72px;
  text-align: center;
  background: radial-gradient(circle at 50% 0, rgba(200, 178, 115, .13), transparent 48%), linear-gradient(#0c0e1a, #070910);
  border-bottom: 1px solid rgba(200, 178, 115, .12)
}

.eyebrow, .pathway-header span, .sequence-title span {
  font: 10px 'JetBrains Mono', monospace;
  letter-spacing: 3px;
  color: var(--myst-gold)
}

.archive-hero h1 {
  margin: 10px 0 14px;
  font: 700 clamp(38px, 7vw, 72px) 'Playfair Display', serif
}

.archive-hero > p {
  max-width: 700px;
  margin: auto;
  color: #92929c;
  line-height: 1.8
}

.archive-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 36px;
  color: #777780;
  font: 11px 'JetBrains Mono', monospace;
  text-transform: uppercase
}

.archive-stats b {
  color: #ded8c6;
  font-size: 16px
}

.archive-stats i {
  height: 20px;
  width: 1px;
  background: #32323a
}

.archive-layout {
  max-width: 1320px;
  margin: auto;
  padding: 56px 24px 100px;
  display: grid;
  grid-template-columns:310px 1fr;
  gap: 42px;
  align-items: start
}

.pathway-browser {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 112px);
  display: flex;
  flex-direction: column
}

.search-box {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px;
  border: 1px solid #292b34;
  background: #0d0f17
}

.search-box:focus-within {
  border-color: rgba(200, 178, 115, .6)
}

.search-box svg {
  width: 17px;
  fill: none;
  stroke: #777;
  stroke-width: 1.8
}

.search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: none;
  color: #eee;
  font: 12px 'JetBrains Mono', monospace
}

.search-box button {
  border: 0;
  background: none;
  color: #999;
  font-size: 20px;
  cursor: pointer
}

.browser-heading {
  display: flex;
  justify-content: space-between;
  margin: 22px 4px 10px;
  color: #75757e;
  font: 10px 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px
}

.browser-heading b {
  color: var(--myst-gold)
}

.pathway-list {
  overflow: auto;
  padding-right: 5px
}

.pathway-list > button {
  width: 100%;
  display: grid;
  grid-template-columns:44px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: #aaa;
  text-align: left;
  cursor: pointer;
  transition: .2s
}

.pathway-list > button:hover {
  background: #10121b;
  color: #eee
}

.pathway-list > button.active {
  background: linear-gradient(90deg, rgba(200, 178, 115, .12), transparent);
  border-color: rgba(200, 178, 115, .2);
  color: #fff
}

.sigil {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #292b34;
  background: #090b11
}

.sigil img {
  width: 34px;
  height: 34px;
  object-fit: contain
}

.sigil b, .large-sigil b {
  font-family: 'Playfair Display';
  color: var(--myst-gold)
}

.pathway-list strong {
  display: block;
  font: 600 15px 'Playfair Display', serif
}

.pathway-list small {
  display: block;
  color: #62626b;
  font: 9px 'JetBrains Mono', monospace;
  text-transform: uppercase
}

.chevron {
  color: #595961;
  font-size: 21px
}

.empty {
  padding: 30px 10px;
  color: #777;
  text-align: center
}

.pathway-header {
  min-height: 150px;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 22px 28px;
  border: 1px solid rgba(200, 178, 115, .22);
  background: radial-gradient(circle at 10% 50%, rgba(200, 178, 115, .12), transparent 42%), #0d0f17
}

.large-sigil {
  width: 105px;
  height: 105px;
  display: grid;
  place-items: center;
  flex: none
}

.large-sigil img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(200, 178, 115, .18))
}

.large-sigil b {
  font-size: 55px
}

.pathway-header h2 {
  margin: 3px 0 2px;
  font: 700 clamp(30px, 5vw, 48px) 'Playfair Display', serif
}

.pathway-header p {
  margin: 0;
  color: #72727c;
  font: 11px 'JetBrains Mono', monospace;
  text-transform: uppercase
}

.sequence-jump {
  display: flex;
  gap: 8px;
  overflow: auto;
  padding: 18px 0 22px
}

.sequence-jump button {
  min-width: 60px;
  height: 48px;
  border: 1px solid #292b34;
  background: #0c0e15;
  color: #aaa;
  cursor: pointer
}

.sequence-jump button:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold)
}

.sequence-jump small {
  display: block;
  font: 8px 'JetBrains Mono', monospace;
  color: #666
}

.sequence-jump b {
  font: 20px 'Playfair Display', serif
}

.sequence-list {
  display: flex;
  flex-direction: column;
  gap: 16px
}

.sequence-card {
  scroll-margin-top: 82px;
  display: grid;
  grid-template-columns:100px 1fr;
  border: 1px solid #22242c;
  background: #0b0d14
}

.sequence-number {
  padding: 25px 15px;
  text-align: center;
  border-right: 1px solid #22242c;
  background: linear-gradient(135deg, rgba(200, 178, 115, .08), transparent)
}

.sequence-number small {
  display: block;
  color: #707079;
  font: 8px 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px
}

.sequence-number b {
  font: 700 52px 'Playfair Display', serif;
  color: var(--myst-gold)
}

.sequence-content {
  padding: 25px 28px 30px
}

.sequence-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 18px;
  border-bottom: 1px solid #22242c
}

.sequence-title h3 {
  margin: 4px 0 0;
  font: 600 28px 'Playfair Display', serif
}

.sequence-title > small {
  color: #666;
  font: 9px 'JetBrains Mono', monospace;
  text-transform: uppercase
}

.abilities-grid {
  display: grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap: 14px 28px;
  padding-top: 22px
}

.ability {
  display: flex;
  gap: 12px
}

.ability-mark {
  width: 5px;
  height: 5px;
  margin-top: 8px;
  flex: none;
  transform: rotate(45deg);
  background: var(--myst-gold)
}

.ability h4 {
  margin: 0 0 4px;
  color: #ddd9ce;
  font: 600 14px 'Playfair Display', serif
}

.ability p {
  margin: 0;
  color: #85858e;
  font-size: 12px;
  line-height: 1.6
}

.detail-empty {
  padding: 100px 20px;
  text-align: center;
  border: 1px solid #22242c;
  color: #777
}

.detail-empty span {
  font-size: 44px;
  color: var(--myst-gold)
}

.detail-empty h3 {
  color: #ddd
}

@media (max-width: 900px) {
  .archive-layout {
    grid-template-columns:1fr;
    padding-top: 30px
  }

  .pathway-browser {
    position: static;
    max-height: none
  }

  .pathway-list {
    display: grid;
    grid-template-columns:repeat(2, minmax(0, 1fr));
    max-height: 390px
  }

  .archive-stats {
    gap: 12px
  }

  .abilities-grid {
    grid-template-columns:1fr
  }
}

@media (max-width: 560px) {
  .archive-hero {
    padding-top: 56px
  }

  .archive-stats {
    font-size: 8px
  }

  .archive-layout {
    padding-left: 14px;
    padding-right: 14px
  }

  .pathway-list {
    grid-template-columns:1fr
  }

  .pathway-header {
    padding: 18px;
    gap: 16px
  }

  .large-sigil {
    width: 72px;
    height: 72px
  }

  .sequence-card {
    grid-template-columns:1fr
  }

  .sequence-number {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px;
    border-right: 0;
    border-bottom: 1px solid #22242c
  }

  .sequence-number b {
    font-size: 30px
  }

  .sequence-content {
    padding: 20px 18px
  }

  .sequence-title h3 {
    font-size: 23px
  }
}

/* Keep the archive itself in the first viewport and make discovery controls unmistakable. */
.archive-hero {
  padding: 88px 24px 20px
}

.archive-hero h1 {
  margin: 3px 0 4px;
  font-size: clamp(32px, 5vw, 52px)
}

.archive-hero > p {
  line-height: 1.5
}

.archive-stats {
  margin-top: 12px;
  gap: 18px
}

.archive-layout {
  padding-top: 24px
}

.pathway-browser {
  top: 76px;
  max-height: calc(100vh - 88px)
}

.search-label {
  margin: 0 0 7px;
  color: var(--myst-gold);
  font: 700 11px 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1.6px
}

.search-box {
  height: 52px;
  border-color: rgba(200, 178, 115, .5);
  background: #11131d;
  box-shadow: 0 0 0 3px rgba(200, 178, 115, .05)
}

.search-box:focus-within {
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px rgba(200, 178, 115, .12)
}

.search-box svg {
  width: 20px;
  stroke: var(--myst-gold)
}

.search-box kbd {
  color: #777;
  font: 18px sans-serif
}

.browser-heading {
  margin: 18px 4px 7px;
  color: #aaaab2;
  font-weight: 700
}

@media (max-width: 900px) {
  .archive-hero {
    padding-top: 40px
  }

  .archive-layout {
    padding-top: 20px
  }

  .pathway-list {
    display: block;
    max-height: 430px
  }

  .pathway-browser {
    max-height: none
  }
}

@media (max-width: 560px) {
  .archive-hero {
    padding: 78px 16px 18px
  }

  .archive-hero .eyebrow {
    display: none
  }

  .archive-hero > p {
    font-size: 13px
  }

  .archive-stats {
    margin-top: 9px
  }

  .archive-layout {
    padding-top: 16px
  }
}

/* Persistent pathway context and progression controls. */
.pathway-controls {
  position: sticky;
  top: 64px;
  z-index: 20;
  background: #070910;
  padding-bottom: 1px;
  box-shadow: 0 12px 22px rgba(7, 9, 16, .92)
}

.pathway-controls .pathway-header {
  min-height: 94px;
  padding: 10px 20px
}

.pathway-controls .large-sigil {
  width: 72px;
  height: 72px
}

.pathway-controls .pathway-header h2 {
  font-size: clamp(26px, 4vw, 38px)
}

.pathway-controls .sequence-jump {
  display: flex;
  width: 100%;
  gap: 6px;
  padding: 8px 0 12px
}

.pathway-controls .sequence-jump button {
  flex: 1;
  min-width: 0;
  height: 51px
}

.sequence-card {
  scroll-margin-top: 232px
}

/* Sequence 4 onward crosses into divinity; each rank gets a stronger aura. */
.sequence-jump button.ranked {
  position: relative;
  overflow: hidden;
  border-color: rgba(200, 178, 115, .34);
  color: #d7c88f;
  background: linear-gradient(145deg, rgba(200, 178, 115, .12), #0c0e15)
}

.sequence-jump button.ranked:after {
  content: '';
  position: absolute;
  inset: auto 12% 0;
  height: 1px;
  background: currentColor;
  box-shadow: 0 0 9px currentColor
}

.sequence-jump button.ranked small {
  color: currentColor;
  font-size: 7px
}

.sequence-jump button.rank-3 {
  color: #c9d7e8;
  border-color: rgba(170, 196, 226, .42);
  background: linear-gradient(145deg, rgba(133, 166, 204, .15), #0c0e15)
}

.sequence-jump button.rank-2 {
  color: #e7d7ff;
  border-color: rgba(204, 171, 255, .48);
  background: radial-gradient(circle at 50% 120%, rgba(170, 109, 255, .25), transparent 65%), #0c0e15
}

.sequence-jump button.rank-1 {
  color: #ffe7a5;
  border-color: rgba(255, 216, 114, .58);
  background: radial-gradient(circle at 50% 120%, rgba(255, 190, 66, .3), transparent 65%), #0c0e15
}

.sequence-jump button.rank-0 {
  color: #fff2bc;
  border-color: rgba(255, 229, 145, .8);
  background: radial-gradient(circle at 50% 110%, rgba(255, 218, 102, .38), transparent 70%), #17140d;
  box-shadow: inset 0 0 14px rgba(255, 221, 118, .12), 0 0 12px rgba(255, 221, 118, .08)
}

.sequence-number.ranked {
  color: #d7c88f;
  background: radial-gradient(circle at 50% 40%, rgba(200, 178, 115, .18), transparent 65%)
}

.sequence-number.ranked small {
  color: currentColor
}

.sequence-number.rank-3 {
  color: #b8cee8;
  background: radial-gradient(circle at 50% 40%, rgba(133, 166, 204, .2), transparent 65%)
}

.sequence-number.rank-2 {
  color: #d9bdff;
  background: radial-gradient(circle at 50% 40%, rgba(170, 109, 255, .22), transparent 65%)
}

.sequence-number.rank-1, .sequence-number.rank-0 {
  color: #ffe3a0;
  background: radial-gradient(circle at 50% 40%, rgba(255, 195, 70, .25), transparent 65%)
}

.sequence-number.ranked b {
  color: currentColor;
  text-shadow: 0 0 18px currentColor
}

@media (max-width: 900px) {
  .pathway-controls {
    top: 64px
  }

  .pathway-controls .pathway-header {
    min-height: 82px
  }

  .pathway-controls .large-sigil {
    width: 60px;
    height: 60px
  }

  .pathway-controls .sequence-jump {
    overflow-x: auto
  }

  .pathway-controls .sequence-jump button {
    flex: 1 0 62px
  }

  .sequence-card {
    scroll-margin-top: 220px
  }
}

@media (max-width: 560px) {
  .archive-hero > p, .archive-stats {
    display: none
  }

  .archive-hero {
    padding-bottom: 10px
  }

  .pathway-controls .pathway-header {
    min-height: 70px;
    padding: 7px 12px
  }

  .pathway-controls .large-sigil {
    width: 52px;
    height: 52px
  }

  .pathway-controls .pathway-header p {
    display: none
  }

  .pathway-controls .sequence-jump {
    padding: 6px 0 9px
  }

  .pathway-controls .sequence-jump button {
    height: 46px
  }

  .sequence-card {
    scroll-margin-top: 200px
  }
}

/* Search stays prominent before interaction; current Sequence remains easy to locate. */
.search-box {
  height: 58px;
  border-color: var(--myst-gold);
  box-shadow: 0 0 0 3px rgba(200, 178, 115, .1), 0 8px 24px rgba(0, 0, 0, .18)
}

.search-box:focus-within {
  box-shadow: 0 0 0 3px rgba(200, 178, 115, .14), 0 8px 24px rgba(0, 0, 0, .24)
}

.sequence-jump button.current {
  color: #fff3c7;
  border-color: var(--myst-gold);
  background: linear-gradient(145deg, rgba(200, 178, 115, .27), rgba(200, 178, 115, .07));
  box-shadow: inset 0 0 14px rgba(200, 178, 115, .14), 0 0 9px rgba(200, 178, 115, .13);
  transform: translateY(-1px)
}

.sequence-card.current {
  border-color: rgba(200, 178, 115, .38);
  box-shadow: 0 0 0 1px rgba(200, 178, 115, .06), 0 8px 28px rgba(0, 0, 0, .18)
}

.archive-freshness {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 9px;
  color: #6f7079;
  font: 9px 'JetBrains Mono', monospace;
  letter-spacing: .35px
}

.archive-freshness i {
  font-style: normal;
  color: #42434b
}

.freshness-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--myst-gold);
  box-shadow: 0 0 7px rgba(200, 178, 115, .65)
}

.registry-cta {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid rgba(200, 178, 115, .34);
  background: rgba(200, 178, 115, .06);
  color: #d7c88f;
  font: 10px 'JetBrains Mono', monospace;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  transition: .25s
}

.registry-cta:hover {
  border-color: var(--myst-gold);
  color: var(--myst-gold);
  background: rgba(200, 178, 115, .12)
}

@media (max-width: 560px) {
  .archive-freshness {
    margin-top: 5px;
    line-height: 1.4;
    flex-wrap: wrap
  }

  .archive-freshness i {
    display: none
  }
}
</style>
