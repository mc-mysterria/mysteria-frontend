<template>
  <div class="ascension-page">
    <HeaderItem/>
    <main>
      <header class="registry-hero">
        <span class="eyebrow">{{ ui.eyebrow }}</span>
        <h1>{{ ui.title }}</h1>
        <p>{{ ui.subtitle }}</p>

        <div class="seat-legend">
          <div v-for="rank in seatRanks" :key="rank.sequence" :class="`legend-chip rank-${rank.sequence}`">
            <b>{{ rank.sequence }}</b>
            <span><strong>{{ rank.name }}</strong><small>{{ rank.limit }} {{ seatsLabel(rank.limit) }}</small></span>
          </div>
        </div>

        <RouterLink class="archive-link" to="/pathways">{{ ui.archiveLink }} →</RouterLink>
      </header>

      <section class="registry-body">
        <aside class="epoch-callout">
          <span aria-hidden="true" class="epoch-mark">†</span>
          <div>
            <h2>{{ ui.epochTitle }}</h2>
            <p>{{ ui.epochBody }}</p>
          </div>
        </aside>

        <div v-if="stats" class="registry-toolbar">
          <div class="registry-totals">
            <span><b>{{ totals.claimed }}</b> / {{ totals.seats }} {{ ui.seatsClaimed }}</span><i/>
            <span><b>{{ totals.deities }}</b> {{ ui.deitiesSeated }}</span><i/>
            <span><b>{{ totals.openPathways }}</b> {{ ui.pathwaysOpen }}</span>
          </div>
          <div class="myst-segmented sort-segmented" role="group" :aria-label="ui.sortLabel">
            <button v-for="mode in sortModes" :key="mode.id" :class="{active: sortMode === mode.id}"
                    @click="sortMode = mode.id">{{ mode.label }}
            </button>
          </div>
        </div>

        <div v-if="loading && !stats" class="registry-grid">
          <span v-for="row in 6" :key="row" class="card-skeleton"></span>
        </div>

        <div v-else-if="!stats" class="registry-error">
          <span aria-hidden="true">⌁</span>
          <h3>{{ ui.errorTitle }}</h3>
          <p>{{ ui.errorBody }}</p>
          <button @click="reload">{{ ui.retry }}</button>
        </div>

        <template v-else>
          <section v-for="group in groups" :key="group.id" class="registry-group">
            <div class="group-heading"><span>{{ group.label }}</span><b>{{ group.rows.length }}</b></div>
            <div class="registry-grid">
              <article v-for="row in group.rows" :key="row.id"
                       :class="['seat-card', {'deity-claimed': row.deityClaimed}]">
                <header class="card-head">
                  <RouterLink :to="`/pathways/${row.id}`" class="card-identity">
                    <span class="sigil"><img v-if="pathwayImage(row.id)" :src="pathwayImage(row.id)" alt=""><b v-else>{{
                        row.id[0].toUpperCase()
                      }}</b></span>
                    <span class="card-words">
                      <strong>{{ row.name }}</strong>
                      <small>{{ row.claimed }}/{{ row.total }} {{ ui.claimedShort }}</small>
                    </span>
                  </RouterLink>
                  <span :data-state="row.state" class="card-badge">{{ ui.badges[row.state] }}</span>
                </header>
                <div class="seat-rows">
                  <div v-for="seat in row.seats" :key="seat.sequence"
                       :class="[`seat-row rank-${seat.sequence}`, {full: seat.count >= seat.limit}]">
                    <span class="seat-rank"><b>{{ seat.sequence }}</b>{{ seat.rank }}</span>
                    <span class="seat-designation">{{ seat.designation }}</span>
                    <span class="seat-pips" aria-hidden="true">
                      <i v-for="pip in seat.limit" :key="pip" :class="{filled: pip <= seat.count}"/>
                    </span>
                    <span class="seat-count">{{ seat.count }}/{{ seat.limit }}</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <p class="registry-footnote">
            <span class="live-dot"/>{{ ui.liveNote }}
            <template v-if="formattedFetchedAt"><i>·</i>{{ ui.asOf }} {{ formattedFetchedAt }}</template>
          </p>
        </template>
      </section>
    </main>
    <FooterItem/>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref} from 'vue';
import HeaderItem from '@/components/layout/HeaderItem.vue';
import FooterItem from '@/components/layout/FooterItem.vue';
import {useI18n} from '@/composables/useI18n';
import {breadcrumbLd, useSeo} from '@/composables/useSeo';
import {useBeyonderStats} from '@/composables/useBeyonderStats';
import {
  boonPathwayIds,
  HIGH_SEAT_LIMITS,
  type Pathway,
  pathwayImage,
  pathwayName,
  pathways,
  sequenceRank,
} from '@/data/pathways';

const copy = {
  en: {
    eyebrow: 'HIGH SEQUENCE REGISTRY',
    title: 'Thrones of Ascension',
    subtitle: 'Above Sequence 4 the ladder narrows: every pathway seats only so many Beyonders at once. Survey who has climbed — and where a throne still stands empty — before you choose your road.',
    archiveLink: 'Study the pathways in the archive',
    epochTitle: 'The Epoch will turn',
    epochBody: 'When the next Epoch begins, every Beyonder is reset and all of these seats are vacated. Whatever is claimed below is held only for now — come the new Epoch, everyone fights for the thrones again.',
    seatsClaimed: 'seats claimed',
    deitiesSeated: 'Deities enthroned',
    pathwaysOpen: 'pathways fully open',
    sortLabel: 'Sort pathways',
    sortContested: 'Contested first',
    sortOpen: 'Open first',
    sortAz: 'A–Z',
    badges: {deity: 'Deity enthroned', contested: 'Contested', open: 'All seats open'},
    standard: 'Standard Pathways',
    boons: 'Boons',
    claimedShort: 'claimed',
    liveNote: 'Counts come from the server itself and refresh every few minutes.',
    asOf: 'As of',
    errorTitle: 'The registry is unreachable',
    errorBody: 'The census could not be consulted. Try again in a moment.',
    retry: 'Consult again',
  },
  uk: {
    eyebrow: 'РЕЄСТР ВИСОКИХ ПОСЛІДОВНОСТЕЙ',
    title: 'Трони Вознесіння',
    subtitle: 'Вище Послідовності 4 драбина звужується: кожен Шлях вміщує лише обмежену кількість Потойбічних водночас. Погляньте, хто вже піднявся — і де трон досі порожній — перш ніж обрати свою дорогу.',
    archiveLink: 'Дослідити Шляхи в архіві',
    epochTitle: 'Епоха зміниться',
    epochBody: 'З початком нової Епохи кожного Потойбічного буде скинуто, і всі ці місця звільняться. Здобуте нижче утримується лише до часу — у новій Епосі боротьба за трони почнеться знову.',
    seatsClaimed: 'місць зайнято',
    deitiesSeated: 'Божеств на тронах',
    pathwaysOpen: 'Шляхів повністю вільні',
    sortLabel: 'Сортування Шляхів',
    sortContested: 'Спершу зайняті',
    sortOpen: 'Спершу вільні',
    sortAz: 'А–Я',
    badges: {deity: 'Божество на троні', contested: 'Є претенденти', open: 'Усі місця вільні'},
    standard: 'Звичайні Шляхи',
    boons: 'Благословення',
    claimedShort: 'зайнято',
    liveNote: 'Дані надходять із самого сервера й оновлюються щокілька хвилин.',
    asOf: 'Станом на',
    errorTitle: 'Реєстр недоступний',
    errorBody: 'Не вдалося звернутися до перепису. Спробуйте ще раз за мить.',
    retry: 'Запитати знову',
  },
};

const {currentLanguage} = useI18n();
const ui = computed(() => copy[currentLanguage.value]);
const {stats, loading, highSeats, fetchedAt, reload} = useBeyonderStats();

/** The four limited rungs, thrones first — Deity at the top of every listing. */
const HIGH_SEQUENCES = [0, 1, 2, 3] as const;

function seatsLabel(count: number): string {
  if (currentLanguage.value === 'uk') {
    if (count === 1) return 'місце';
    if (count >= 2 && count <= 4) return 'місця';
    return 'місць';
  }
  return count === 1 ? 'seat' : 'seats';
}

const seatRanks = computed(() => HIGH_SEQUENCES.map(sequence => ({
  sequence,
  name: sequenceRank(sequence, currentLanguage.value),
  limit: HIGH_SEAT_LIMITS[sequence],
})));

const occupancy = computed(() => {
  const map = new Map<string, number[]>();
  for (const entry of highSeats.value) map.set(entry.pathway, entry.counts);
  return map;
});

interface SeatRow {
  sequence: number;
  rank: string;
  designation: string;
  count: number;
  limit: number;
}

interface PathwayRow {
  id: string;
  name: string;
  seats: SeatRow[];
  claimed: number;
  total: number;
  deityClaimed: boolean;
  state: 'deity' | 'contested' | 'open';
}

function buildRow(pathway: Pathway): PathwayRow | null {
  // The ability archive stops at Sequence 1, but every pathway that climbs
  // into the divine rungs has all four seats on the server — so eligibility
  // is judged by reach, not by which rungs the archive happens to document.
  // Boons stop at Sequence 5 and are rightly excluded.
  if (!pathway.sequences.some(s => s.sequence <= 4)) return null;
  const counts = occupancy.value.get(pathway.id) ?? [];
  const seats: SeatRow[] = HIGH_SEQUENCES.map(sequence => {
    const rung = pathway.sequences.find(s => s.sequence === sequence);
    return {
      sequence,
      rank: sequenceRank(sequence, currentLanguage.value),
      // A pathway's Sequence 0 bears the pathway's own name — the deity title.
      designation: rung
          ? (rung.name[currentLanguage.value] || rung.name.en)
          : pathwayName(pathway.id, currentLanguage.value),
      count: counts[sequence] ?? 0,
      limit: HIGH_SEAT_LIMITS[sequence],
    };
  });
  const claimed = seats.reduce((n, seat) => n + seat.count, 0);
  const deityClaimed = (counts[0] ?? 0) > 0;
  return {
    id: pathway.id,
    name: pathwayName(pathway.id, currentLanguage.value),
    seats,
    claimed,
    total: seats.reduce((n, seat) => n + seat.limit, 0),
    deityClaimed,
    state: deityClaimed ? 'deity' : claimed > 0 ? 'contested' : 'open',
  };
}

type SortMode = 'contested' | 'open' | 'az';
const sortMode = ref<SortMode>('contested');
const sortModes = computed(() => [
  {id: 'contested' as const, label: ui.value.sortContested},
  {id: 'open' as const, label: ui.value.sortOpen},
  {id: 'az' as const, label: ui.value.sortAz},
]);

function sortRows(rows: PathwayRow[]): PathwayRow[] {
  const byName = (a: PathwayRow, b: PathwayRow) => a.name.localeCompare(b.name, currentLanguage.value);
  if (sortMode.value === 'az') return [...rows].sort(byName);
  const direction = sortMode.value === 'contested' ? -1 : 1;
  return [...rows].sort((a, b) => direction * (a.claimed - b.claimed) || byName(a, b));
}

const groups = computed(() => {
  const core: PathwayRow[] = [];
  const boons: PathwayRow[] = [];
  for (const pathway of pathways) {
    const row = buildRow(pathway);
    if (row) (boonPathwayIds.has(pathway.id) ? boons : core).push(row);
  }
  return [
    {id: 'core', label: ui.value.standard, rows: sortRows(core)},
    {id: 'boons', label: ui.value.boons, rows: sortRows(boons)},
  ].filter(group => group.rows.length);
});

const totals = computed(() => {
  const rows = groups.value.flatMap(group => group.rows);
  return {
    seats: rows.reduce((n, row) => n + row.total, 0),
    claimed: rows.reduce((n, row) => n + row.claimed, 0),
    deities: rows.filter(row => row.deityClaimed).length,
    openPathways: rows.filter(row => row.claimed === 0).length,
  };
});

const formattedFetchedAt = computed(() => {
  if (!fetchedAt.value) return '';
  return new Intl.DateTimeFormat(currentLanguage.value === 'uk' ? 'uk-UA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fetchedAt.value));
});

useSeo(() => ({
  title: 'Ascension Registry — Sequence 3–0 Seat Availability',
  description: 'Live seat availability for the high Sequences on Mysterria: every pathway seats at most 18 Saints, 9 Angels, 3 Archangels and a single Deity. See which thrones are taken before you climb — the next Epoch resets them all.',
  path: '/ascension',
  imageAlt: 'Mysterria Ascension Registry',
  jsonLd: [breadcrumbLd([
    {name: 'Home', path: '/'},
    {name: 'Pathways', path: '/pathways'},
    {name: 'Ascension Registry', path: '/ascension'},
  ])],
}));
</script>

<style scoped>
.ascension-page {
  min-height: 100vh;
  background: #070910;
  color: #eceae4;
}

/* ---- Hero ---- */
.registry-hero {
  padding: 84px 24px 44px;
  text-align: center;
  background: radial-gradient(circle at 50% 0, rgba(200, 178, 115, .13), transparent 48%), linear-gradient(#0c0e1a, #070910);
  border-bottom: 1px solid rgba(200, 178, 115, .12);
}

.eyebrow {
  font: 10px 'JetBrains Mono', monospace;
  letter-spacing: 3px;
  color: var(--myst-gold);
}

.registry-hero h1 {
  margin: 10px 0 14px;
  font: 700 clamp(34px, 6vw, 60px) 'Playfair Display', serif;
}

.registry-hero > p {
  max-width: 680px;
  margin: auto;
  color: #92929c;
  line-height: 1.8;
}

.seat-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}

.legend-chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 18px 9px 12px;
  border: 1px solid #292b34;
  background: #0c0e15;
  text-align: left;
}

.legend-chip > b {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid currentColor;
  font: 700 17px 'Playfair Display', serif;
  text-shadow: 0 0 14px currentColor;
}

.legend-chip strong {
  display: block;
  font: 600 13.5px 'Playfair Display', serif;
  color: #eceae4;
}

.legend-chip small {
  display: block;
  font: 9px 'JetBrains Mono', monospace;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: currentColor;
  opacity: .85;
}

.archive-link {
  display: inline-block;
  margin-top: 22px;
  font: 10.5px 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #8e8e98;
  transition: color .25s ease;
}

.archive-link:hover {
  color: var(--myst-gold);
}

/* Rank auras — same hues the archive uses for Sequences 3 → 0. */
.rank-3 {
  color: #c9d7e8;
}

.rank-2 {
  color: #e7d7ff;
}

.rank-1 {
  color: #ffe7a5;
}

.rank-0 {
  color: #fff2bc;
}

/* ---- Body ---- */
.registry-body {
  max-width: 1320px;
  margin: auto;
  padding: 40px 24px 100px;
}

.epoch-callout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 860px;
  margin: 0 auto 38px;
  padding: 22px 28px;
  border: 1px solid rgba(200, 178, 115, .3);
  background: radial-gradient(circle at 0 50%, rgba(200, 178, 115, .1), transparent 46%), #0d0f17;
}

.epoch-mark {
  margin-top: 2px;
  font: 26px 'Playfair Display', serif;
  color: var(--myst-gold);
  text-shadow: 0 0 16px rgba(200, 178, 115, .55);
}

.epoch-callout h2 {
  margin: 0 0 6px;
  font: 10.5px 'JetBrains Mono', monospace;
  letter-spacing: 2.6px;
  text-transform: uppercase;
  color: var(--myst-gold);
}

.epoch-callout p {
  margin: 0;
  color: #a9a394;
  font-size: 13.5px;
  line-height: 1.75;
}

/* ---- Toolbar ---- */
.registry-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
  margin-bottom: 30px;
}

.registry-totals {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px;
  color: #777780;
  font: 10.5px 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.registry-totals b {
  color: var(--myst-gold);
  font-size: 16px;
}

.registry-totals i {
  height: 18px;
  width: 1px;
  background: #32323a;
}

.sort-segmented button {
  padding: 11px 20px;
  font-size: 10px;
}

/* ---- Groups & grid ---- */
.group-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 34px 2px 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #22242c;
  color: #aaaab2;
  font: 700 10px 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.registry-group:first-of-type .group-heading {
  margin-top: 0;
}

.group-heading b {
  color: var(--myst-gold);
}

.registry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(370px, 1fr));
  gap: 16px;
}

.card-skeleton {
  height: 244px;
  background: linear-gradient(90deg, rgba(255, 255, 255, .03), rgba(255, 255, 255, .06), rgba(255, 255, 255, .03));
  background-size: 200% 100%;
  animation: registryShimmer 1.6s linear infinite;
}

@keyframes registryShimmer {
  to {
    background-position: -200% 0;
  }
}

/* ---- Card ---- */
.seat-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #22242c;
  background: #0b0d14;
  transition: border-color .25s ease;
}

.seat-card:hover {
  border-color: rgba(200, 178, 115, .32);
}

.seat-card.deity-claimed {
  border-color: rgba(255, 229, 145, .4);
  box-shadow: 0 0 0 1px rgba(255, 229, 145, .07), 0 0 26px rgba(255, 218, 102, .07);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #1d1f27;
  background: linear-gradient(135deg, rgba(200, 178, 115, .06), transparent 55%);
}

.card-identity {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 0;
  color: inherit;
}

.card-identity:hover {
  color: inherit;
}

.card-identity:hover strong {
  color: var(--myst-gold);
}

.sigil {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: none;
  border: 1px solid #292b34;
  background: #090b11;
}

.sigil img {
  width: 35px;
  height: 35px;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(200, 178, 115, .3));
}

.sigil b {
  font-family: 'Playfair Display', serif;
  color: var(--myst-gold);
}

.card-words {
  min-width: 0;
}

.card-words strong {
  display: block;
  font: 600 17px 'Playfair Display', serif;
  color: #eceae4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color .25s ease;
}

.card-words small {
  display: block;
  margin-top: 2px;
  font: 9px 'JetBrains Mono', monospace;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #62626b;
}

.card-badge {
  flex: none;
  padding: 5px 10px;
  border: 1px solid #2c2e37;
  font: 8.5px 'JetBrains Mono', monospace;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: #75757e;
}

.card-badge[data-state="open"] {
  border-color: rgba(140, 190, 160, .35);
  color: #9cc4ab;
}

.card-badge[data-state="contested"] {
  border-color: rgba(200, 178, 115, .35);
  color: #d7c88f;
}

.card-badge[data-state="deity"] {
  border-color: rgba(255, 229, 145, .6);
  color: #fff2bc;
  background: radial-gradient(circle at 50% 120%, rgba(255, 218, 102, .22), transparent 70%);
  text-shadow: 0 0 10px rgba(255, 221, 118, .5);
}

/* ---- Seat rows ---- */
.seat-rows {
  display: flex;
  flex-direction: column;
}

.seat-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) auto 44px;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
}

.seat-row + .seat-row {
  border-top: 1px solid #171922;
}

.seat-rank {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 9px 'JetBrains Mono', monospace;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: currentColor;
}

.seat-rank b {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  flex: none;
  border: 1px solid color-mix(in srgb, currentColor 45%, transparent);
  font: 700 12px 'Playfair Display', serif;
  text-shadow: 0 0 10px currentColor;
}

.seat-designation {
  font: 12px 'Playfair Display', serif;
  color: #85858e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.seat-pips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
  max-width: 148px;
}

.seat-pips i {
  width: 7px;
  height: 7px;
  transform: rotate(45deg);
  border: 1px solid color-mix(in srgb, currentColor 34%, transparent);
  background: transparent;
  transition: background .3s ease;
}

.seat-pips i.filled {
  border-color: currentColor;
  background: currentColor;
  box-shadow: 0 0 7px color-mix(in srgb, currentColor 65%, transparent);
}

/* The lone Deity seat is the headline — give it a larger throne mark. */
.seat-row.rank-0 .seat-pips i {
  width: 11px;
  height: 11px;
}

.seat-row.rank-0.full {
  background: radial-gradient(circle at 100% 50%, rgba(255, 218, 102, .09), transparent 55%);
}

.seat-count {
  font: 11px 'JetBrains Mono', monospace;
  color: #62626b;
  text-align: right;
}

.seat-row.full .seat-count {
  color: currentColor;
  text-shadow: 0 0 8px color-mix(in srgb, currentColor 50%, transparent);
}

/* ---- Footnote / error ---- */
.registry-footnote {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 44px 0 0;
  color: #6f7079;
  font: 9.5px 'JetBrains Mono', monospace;
  letter-spacing: .35px;
}

.registry-footnote i {
  font-style: normal;
  color: #42434b;
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--myst-gold);
  box-shadow: 0 0 7px rgba(200, 178, 115, .65);
}

.registry-error {
  padding: 90px 20px;
  text-align: center;
  border: 1px solid #22242c;
  color: #777;
}

.registry-error span {
  font-size: 44px;
  color: var(--myst-gold);
}

.registry-error h3 {
  margin: 14px 0 6px;
  color: #ddd;
  font: 600 22px 'Playfair Display', serif;
}

.registry-error p {
  margin: 0 0 22px;
}

.registry-error button {
  padding: 12px 28px;
  border: 1px solid rgba(200, 178, 115, .5);
  background: transparent;
  color: var(--myst-gold);
  font: 10.5px 'JetBrains Mono', monospace;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .25s ease;
}

.registry-error button:hover {
  background: rgba(200, 178, 115, .12);
}

/* ---- Responsive ---- */
@media (max-width: 900px) {
  .registry-hero {
    padding: 56px 20px 36px;
  }

  .registry-toolbar {
    justify-content: center;
  }

  .registry-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .registry-body {
    padding: 28px 14px 70px;
  }

  .epoch-callout {
    padding: 18px;
    gap: 14px;
  }

  .seat-row {
    grid-template-columns: 88px minmax(0, 1fr) 40px;
  }

  .seat-designation {
    display: none;
  }

  .seat-pips {
    max-width: none;
    justify-content: flex-start;
    grid-column: 2;
  }

  .legend-chip {
    padding: 7px 12px 7px 9px;
    gap: 9px;
  }
}
</style>
