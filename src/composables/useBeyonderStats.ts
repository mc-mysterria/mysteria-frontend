import {computed, ref} from "vue";

/** Occupied Sequence 0–3 seats of one pathway, indexed by sequence. */
export interface PathwaySeatOccupancy {
    /** Lowercased pathway id, matching src/data/pathways.ts. */
    pathway: string;
    counts: number[];
}

/**
 * Pre-aggregated server-side (api/beyonder-stats.ts) - only counts are ever
 * sent to the client, never the per-player roster.
 */
export interface BeyonderStatsAggregate {
    totalBeyonders: number;
    uniquePathways: number;
    advancedBeyonders: number;
    averageSequence: string;
    topPathways: { name: string; count: number }[];
    sequenceDistribution: { sequence: string; count: number }[];
    /** Absent on responses cached before the Ascension Registry shipped. */
    highSeats?: PathwaySeatOccupancy[];
}

interface BeyonderStatsResponse {
    success: boolean;
    message?: string;
    data: BeyonderStatsAggregate;
}

const CACHE_KEY = "beyonder-stats-cache-v3";
// Short enough that the Ascension Registry's seat availability stays honest;
// the endpoint itself is edge-cached for 5 minutes, so refetches are cheap.
const CACHE_DURATION = 10 * 60 * 1000;

const stats = ref<BeyonderStatsAggregate | null>(null);
const loading = ref(false);
/** When the current numbers were fetched from the server (ms epoch). */
const fetchedAt = ref<number | null>(null);
let inFlight: Promise<void> | null = null;

async function load() {
    if (stats.value || inFlight) return inFlight ?? Promise.resolve();

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached) as { data: BeyonderStatsAggregate; timestamp: number };
            if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                stats.value = parsed.data;
                fetchedAt.value = parsed.timestamp;
                return;
            }
        }
    } catch {
        // Corrupt cache - fall through to the network.
    }

    loading.value = true;
    inFlight = (async () => {
        try {
            const response = await fetch("/api/beyonder-stats");
            const result: BeyonderStatsResponse = await response.json();
            if (result.success && result.data) {
                stats.value = result.data;
                fetchedAt.value = Date.now();
                try {
                    localStorage.setItem(CACHE_KEY, JSON.stringify({data: result.data, timestamp: fetchedAt.value}));
                } catch {
                    // Storage full or unavailable - the in-memory copy is enough.
                }
            }
        } catch (error) {
            console.error("Failed to fetch beyonder stats:", error);
        } finally {
            loading.value = false;
            inFlight = null;
        }
    })();

    return inFlight;
}

export function useBeyonderStats() {
    void load();

    const topPathways = computed(() => stats.value?.topPathways ?? []);
    const maxPathwayCount = computed(() => Math.max(...topPathways.value.map(pathway => pathway.count), 1));

    return {
        stats,
        loading,
        totalBeyonders: computed(() => stats.value?.totalBeyonders ?? 0),
        uniquePathways: computed(() => stats.value?.uniquePathways ?? 0),
        advancedBeyonders: computed(() => stats.value?.advancedBeyonders ?? 0),
        averageSequence: computed(() => stats.value?.averageSequence ?? "-"),
        topPathways,
        maxPathwayCount,
        sequenceDistribution: computed(() => stats.value?.sequenceDistribution ?? []),
        highSeats: computed(() => stats.value?.highSeats ?? []),
        fetchedAt,
        reload: load,
    };
}
