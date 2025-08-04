<template>
  <div class="stats-dashboard" ref="dashboardRef">
    <div class="dashboard-header">
      <h1 class="dashboard-title fade-in-up">{{ titleText }}</h1>

      <!-- Server Selector -->
      <div v-if="showServerSelector" class="server-selector fade-in-up" :style="{ 'animation-delay': '0.1s' }">
        <label for="server-select">{{ t('server') }}:</label>
        <DropdownSelect
          v-model="selectedServer"
          :options="serverOptions"
          :placeholder="t('selectServer')"
          @change="onServerChange"
          class="server-select-dropdown"
        />
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="metrics-container">
      <div
        class="metric-card fade-in-up"
        :style="{ 'animation-delay': '0.1s' }"
      >
        <div class="metric-icon players-icon">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ playerCountLabelText }}</div>
          <div class="metric-value">{{ animatedTotalPlayers }}</div>
        </div>
      </div>

      <div
        class="metric-card fade-in-up"
        :style="{ 'animation-delay': '0.2s' }"
      >
        <div class="metric-icon online-icon pulse-online">
          <i class="fa-solid fa-circle"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ onlineLabelText }}</div>
          <div class="metric-value">{{ animatedOnlinePlayers }}</div>
        </div>
      </div>

      <div
        class="metric-card fade-in-up"
        :style="{ 'animation-delay': '0.3s' }"
      >
        <div class="metric-icon new-icon">
          <i class="fa-solid fa-user-plus"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">{{ newPlayersLabelText }}</div>
          <div class="metric-value">{{ animatedNewPlayers }}</div>
        </div>
      </div>

      <div
        class="metric-card fade-in-up"
        :style="{ 'animation-delay': '0.4s' }"
      >
        <div class="metric-icon time-icon">
          <i class="fa-solid fa-gauge-high"></i>
        </div>
        <div class="metric-content">
          <div class="metric-label">TPS</div>
          <div class="metric-value">{{ tps }}</div>
        </div>
      </div>
    </div>

    <!-- Tabs for Different Charts -->
    <div
      class="charts-container fade-in-up"
      :style="{ 'animation-delay': '0.5s' }"
    >
      <div class="tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          :class="['tab', { active: activeTab === index }]"
          @click="switchTab(index)"
        >
          {{ tab.label }}
        </div>
      </div>

      <div class="chart-panel">
        <!-- Hourly Online Chart -->
        <Transition name="chart-slide" mode="out-in">
          <div v-if="activeTab === 0" class="chart-wrapper" key="hourly">
            <div ref="hourlyChart" class="chart"></div>
            <div v-if="isLoadingHourly" class="chart-loading">
              <div class="loading-spinner"></div>
              <span>Завантаження даних графіка...</span>
            </div>
          </div>
        </Transition>

        <!-- Top Players Chart -->
        <Transition name="chart-slide" mode="out-in">
          <div v-if="activeTab === 1" class="chart-wrapper" key="players">
            <div class="top-players-list">
              <div
                v-for="(player, index) in topPlayers"
                :key="player.uuid"
                class="top-player-item slide-in-left"
                :style="{ 'animation-delay': `${index * 0.1}s` }"
              >
                <div class="player-rank">{{ index + 1 }}</div>
                <div class="player-info">
                  <div class="player-name">{{ player.name }}</div>
                  <div class="player-time">
                    {{ formatPlaytime(player.playtime) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch, nextTick} from "vue";
import {catwalkAPI, getUkrServerName} from "@/utils/api/catwalk";
import type {StatsSummary, TopPlayer, HourlyDistribution} from "@/types/catwalk";
import DropdownSelect from "../ui/DropdownSelect.vue";
import { useI18n } from "@/composables/useI18n";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
]);

type TabOption = {
  label: string;
  key: string;
};

type PlayerItem = {
  uuid: string;
  name: string;
  playtime: number;
  online: boolean;
};


interface LocalStatsSummary {
  totalPlayers: number;
  onlinePlayers: number;
  newPlayers: number;
  tps: string;
  avgPlaytime: number;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
}

interface ApiError extends Error {
  message: string;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    playerCountLabel?: string;
    onlineLabel?: string;
    newPlayersLabel?: string;
    avgPlaytimeLabel?: string;
    playersOnlineLabel?: string;
    topPlayersLabel?: string;
    serverIdentifier?: string;
    autoRefreshInterval?: number;
    apiBasePath?: string;
    lazy?: boolean;
    servers?: string[];
    showServerSelector?: boolean;
  }>(),
  {
    title: '',
    playerCountLabel: '',
    onlineLabel: '',
    newPlayersLabel: '',
    avgPlaytimeLabel: '',
    playersOnlineLabel: '',
    topPlayersLabel: '',
    serverIdentifier: "",
    autoRefreshInterval: 0,
    apiBasePath: "plan/v1",
    lazy: true,
    servers: () => [],
    showServerSelector: true,
  },
);

const { t } = useI18n();
const dashboardRef = ref<HTMLElement | null>(null);

// Computed properties for internationalized labels
const titleText = computed(() => props.title || t('networkStatistics'));
const playerCountLabelText = computed(() => props.playerCountLabel || t('players'));
const onlineLabelText = computed(() => props.onlineLabel || t('online'));
const newPlayersLabelText = computed(() => props.newPlayersLabel || t('newPlayers24h'));
// Unused for now but available if needed in future
// const avgPlaytimeLabelText = computed(() => props.avgPlaytimeLabel || t('avgPlaytime'));
// const playersOnlineLabelText = computed(() => props.playersOnlineLabel || t('playersOnline'));
const topPlayersLabelText = computed(() => props.topPlayersLabel || t('topPlayers'));

const isLoading = ref(true);
const error = ref<string | null>(null);
const totalPlayers = ref(0);
const onlinePlayers = ref(0);
const newPlayers = ref(0);
const tps = ref("20.0");
const avgPlaytime = ref(0);
const topPlayers = ref<(PlayerItem & { name: string; online: boolean })[]>([]);
const activeTab = ref(0);

const isLoadingHourly = ref(false);
const hourlyError = ref<string | undefined>(undefined);
const hourlyChartData = ref<Array<{hour: number; players: number}>>([]);
const hourlyChart = ref<HTMLElement | null>(null);
let hourlyChartInstance: echarts.ECharts | null = null;
const tabs = computed<TabOption[]>(() => [
  { label: t('hourlyActivity'), key: "hourly" },
  { label: topPlayersLabelText.value, key: "topPlayers" },
]);

const isVisible = ref(false);
const dashboardElement = ref<HTMLElement | null>(null);

const animatedTotalPlayers = ref(0);
const animatedOnlinePlayers = ref(0);
const animatedNewPlayers = ref(0);

const selectedServer = ref<string>("combined");

const serverOptions = computed(() => {
  const servers = props.servers.length > 0 ? props.servers : [...catwalkAPI.availableServers];
  return [
    { value: "combined", label: t('allServers') },
    ...servers.map(server => ({
      value: server,
      label: getUkrServerName(server)
    }))
  ];
});

const animateNumber = (
  from: number,
  to: number,
  target: { value: number },
  duration = 1000,
) => {
  const start = Date.now();
  const animate = () => {
    const now = Date.now();
    const progress = Math.min((now - start) / duration, 1);
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * easeOutCubic;
    target.value = Math.round(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

const switchTab = (index: number) => {
  if (activeTab.value === index) return;
  activeTab.value = index;
};

const onServerChange = async (value: string | number | string[]) => {
  selectedServer.value = value as string;

  // Clear cached data for the new server
  cache.clear();

  // Reset data
  topPlayers.value = [];
  hourlyChartData.value = [];
  
  // Dispose hourly chart instance
  if (hourlyChartInstance) {
    hourlyChartInstance.dispose();
    hourlyChartInstance = null;
  }

  // Reload data for new server with force refresh
  await loadEssentialData(true);

  if (activeTab.value === 0) {
    await loadHourlyData(true); // Force refresh for new server
  } else if (activeTab.value === 1) {
    await loadTopPlayersData(true);
  }
};

const cache = new Map<string, CacheData<unknown>>();
const CACHE_TTL = 60000;
const PERSISTENT_CACHE_KEY = 'hourly-chart-cache';
const PERSISTENT_CACHE_TTL = 5 * 60000; // 5 minutes

const cachedFetch = async <T,>(
  fetchFunction: () => Promise<T>,
  cacheKey: string,
  bypassCache = false,
): Promise<T> => {
  const now = Date.now();

  if (!bypassCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  try {
    const data = await fetchFunction();

    cache.set(cacheKey, {
      data,
      timestamp: now,
    });

    return data;
  } catch (err: unknown) {
    const apiError = err as ApiError;
    console.error(`Error fetching data:`, apiError);
    throw apiError;
  }
};

// Persistent cache helpers
const saveToPersistentCache = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(`${PERSISTENT_CACHE_KEY}-${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

const loadFromPersistentCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(`${PERSISTENT_CACHE_KEY}-${key}`);
    if (cached) {
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheData.timestamp < PERSISTENT_CACHE_TTL) {
        return cacheData.data as T;
      } else {
        // Remove expired cache
        localStorage.removeItem(`${PERSISTENT_CACHE_KEY}-${key}`);
      }
    }
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
  }
  return null;
};

const fetchStatsSummary = async (
  bypassCache = false,
): Promise<LocalStatsSummary> => {
  const cacheKey = `stats-summary-${selectedServer.value}`;
  return cachedFetch(
    async () => {
      let statsSummary: StatsSummary;

      if (selectedServer.value === "combined") {
        const servers = props.servers.length > 0 ? props.servers : [...catwalkAPI.availableServers];
        statsSummary = await catwalkAPI.getCombinedStatsSummary(servers);
      } else {
        statsSummary = await catwalkAPI.getStatsSummary(selectedServer.value);
      }

      return {
        totalPlayers: statsSummary.totalPlayers || 0,
        onlinePlayers: statsSummary.onlinePlayers || 0,
        newPlayers: statsSummary.newPlayers || 0,
        tps: statsSummary.tps?.toString() || "20.0",
        avgPlaytime: statsSummary.avgPlaytime || 0,
      };
    },
    cacheKey,
    bypassCache,
  );
};


const fetchTopPlayers = async (limit = 10, bypassCache = false) => {
  const cacheKey = `top-players-${limit}-${selectedServer.value}`;
  return cachedFetch(
    async () => {
      if (selectedServer.value === "combined") {
        const servers = props.servers.length > 0 ? props.servers : [...catwalkAPI.availableServers];
        return await catwalkAPI.getCombinedTopPlayers(limit, servers);
      } else {
        return await catwalkAPI.getTopPlayers(limit, selectedServer.value);
      }
    },
    cacheKey,
    bypassCache,
  );
};

const fetchHourlyData = async (bypassCache = false): Promise<HourlyDistribution> => {
  const cacheKey = `hourly-data-${selectedServer.value}`;
  return cachedFetch(
    async () => {
      if (selectedServer.value === "combined") {
        const servers = props.servers.length > 0 ? props.servers : [...catwalkAPI.availableServers];
        return await catwalkAPI.getCombinedHourlyDistribution(servers);
      } else {
        return await catwalkAPI.getHourlyDistribution(selectedServer.value);
      }
    },
    cacheKey,
    bypassCache,
  );
};

const loadHourlyData = async (forceRefresh = false) => {
  const cacheKey = `hourly-data-${selectedServer.value}`;
  
  // Try to load from persistent cache first (instant loading)
  if (!forceRefresh && hourlyChartData.value.length === 0) {
    const cachedChartData = loadFromPersistentCache<Array<{hour: number; players: number}>>(cacheKey);
    if (cachedChartData && cachedChartData.length > 0) {
      hourlyChartData.value = cachedChartData;
      nextTick(() => {
        initHourlyChart();
      });
    }
  }

  // Always fetch fresh data in background (unless already loading)
  if (isLoadingHourly.value) return;
  
  // Only show loading indicator if we don't have cached data
  if (hourlyChartData.value.length === 0) {
    isLoadingHourly.value = true;
  }
  hourlyError.value = undefined;

  try {
    const data = await fetchHourlyData(forceRefresh);
    
    if (data && data.hourly_distribution) {
      const chartData = [];
      for (let hour = 0; hour < 24; hour++) {
        const playerCount = data.hourly_distribution[hour.toString()] || 0;
        chartData.push({ hour, players: playerCount });
      }
      
      const newDataString = JSON.stringify(chartData);
      const oldDataString = JSON.stringify(hourlyChartData.value);
      
      // Only update if data actually changed
      if (newDataString !== oldDataString) {
        hourlyChartData.value = chartData;
        
        // Save to persistent cache
        saveToPersistentCache(cacheKey, chartData);
        
        nextTick(() => {
          initHourlyChart();
        });
      }
    }
  } catch (err: unknown) {
    const apiError = err as ApiError;
    hourlyError.value = `${t('failedToLoadHourlyData')}: ${apiError?.message || t('unknownError')}`;
    console.error("Error loading hourly data:", apiError);
  } finally {
    isLoadingHourly.value = false;
  }
};

const initHourlyChart = () => {
  if (!hourlyChart.value || !hourlyChartData.value.length) return;
  
  // Check if chart element is visible (active tab)
  if (activeTab.value !== 0) return;

  // Ensure we have a clean slate
  if (hourlyChartInstance && !hourlyChartInstance.isDisposed()) {
    hourlyChartInstance.dispose();
    hourlyChartInstance = null;
  }

  try {
    hourlyChartInstance = echarts.init(hourlyChart.value);

    const hours = hourlyChartData.value.map(d => `${d.hour.toString().padStart(2, '0')}:00`);
    const playerCounts = hourlyChartData.value.map(d => d.players);

    hourlyChartInstance.setOption({
      backgroundColor: 'transparent',
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 33, 43, 0.95)',
        borderColor: '#10b981',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 14,
        },
        padding: [12, 16],
        extraCssText: 'border-radius: 8px; backdrop-filter: blur(10px);',
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
            <div style="color: #10b981;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 50%; margin-right: 6px;"></span>
              ${data.value} гравців онлайн
            </div>
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: hours,
        axisLine: {
          lineStyle: {
            color: '#34373d'
          }
        },
        axisLabel: {
          color: '#b4bbc5',
          fontSize: 12
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#b4bbc5',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#34373d',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: t('onlinePlayersChart'),
          type: 'line',
          data: playerCounts,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#10b981',
            width: 3
          },
          itemStyle: {
            color: '#10b981',
            borderColor: '#10b981',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(16, 185, 129, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(16, 185, 129, 0.05)'
                }
              ]
            }
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#10b981',
              borderColor: '#fff',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(16, 185, 129, 0.5)'
            }
          }
        }
      ]
    });

    const handleResize = () => {
      if (hourlyChartInstance && !hourlyChartInstance.isDisposed()) {
        hourlyChartInstance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
  } catch (err: unknown) {
    const apiError = err as ApiError;
    console.error('Error initializing hourly chart:', apiError);
  }
};

const loadEssentialData = async (forceRefresh = false) => {
  const cacheKey = `stats-summary-${selectedServer.value}`;
  
  // Load from persistent cache first (instant loading)
  if (!forceRefresh && totalPlayers.value === 0) {
    const cachedStats = loadFromPersistentCache<StatsSummary>(cacheKey);
    if (cachedStats) {
      // Set values immediately from cache (no animation for cached data)
      totalPlayers.value = cachedStats.totalPlayers || 0;
      onlinePlayers.value = cachedStats.onlinePlayers || 0;
      newPlayers.value = cachedStats.newPlayers || 0;
      tps.value = cachedStats.tps?.toString() || "20.0";
      avgPlaytime.value = cachedStats.avgPlaytime || 0;
      
      // Set animated values to match (no jarring jumps)
      animatedTotalPlayers.value = totalPlayers.value;
      animatedOnlinePlayers.value = onlinePlayers.value;
      animatedNewPlayers.value = newPlayers.value;
    }
  }

  isLoading.value = true;
  error.value = null;

  try {
    const summary = await fetchStatsSummary(forceRefresh);

    const newTotalPlayers = summary.totalPlayers || 0;
    const newOnlinePlayers = summary.onlinePlayers || 0;
    const newNewPlayers = summary.newPlayers || 0;
    const newTps = summary.tps?.toString() || "20.0";
    const newAvgPlaytime = summary.avgPlaytime || 0;

    // Only animate and update if values have changed
    if (newTotalPlayers !== totalPlayers.value || 
        newOnlinePlayers !== onlinePlayers.value || 
        newNewPlayers !== newPlayers.value ||
        newTps !== tps.value ||
        newAvgPlaytime !== avgPlaytime.value) {
      
      // Save to persistent cache
      saveToPersistentCache(cacheKey, {
        totalPlayers: newTotalPlayers,
        onlinePlayers: newOnlinePlayers,
        newPlayers: newNewPlayers,
        tps: newTps,
        avgPlaytime: newAvgPlaytime
      });
      
      // Animate numbers smoothly to new values
      animateNumber(
        animatedTotalPlayers.value,
        newTotalPlayers,
        animatedTotalPlayers,
        1200,
      );
      animateNumber(
        animatedOnlinePlayers.value,
        newOnlinePlayers,
        animatedOnlinePlayers,
        1000,
      );
      animateNumber(
        animatedNewPlayers.value,
        newNewPlayers,
        animatedNewPlayers,
        1400,
      );

      totalPlayers.value = newTotalPlayers;
      onlinePlayers.value = newOnlinePlayers;
      newPlayers.value = newNewPlayers;
      tps.value = newTps;
      avgPlaytime.value = newAvgPlaytime;
    }
  } catch (err: unknown) {
    const apiError = err as ApiError;
    error.value = `${t('failedToLoadSummary')}: ${apiError?.message || t('unknownError')}`;
  } finally {
    isLoading.value = false;
  }
};

const loadTopPlayersData = async (forceRefresh = false) => {
  const cacheKey = `top-players-10-${selectedServer.value}`;
  
  // Load from persistent cache first (instant loading)
  if (!forceRefresh && topPlayers.value.length === 0) {
    const cachedPlayers = loadFromPersistentCache<(PlayerItem & { name: string; online: boolean })[]>(cacheKey);
    if (cachedPlayers && cachedPlayers.length > 0) {
      topPlayers.value = cachedPlayers;
    }
  }

  try {
    const players = await fetchTopPlayers(10, forceRefresh);
    if (Array.isArray(players)) {
      const formattedPlayers = players.map((p) => ({
        ...p,
        name:
          (p as TopPlayer & { name?: string }).name ||
          p.displayName ||
          t('unknownPlayer'),
        online: false,
      }));
      
      const newPlayersString = JSON.stringify(formattedPlayers);
      const oldPlayersString = JSON.stringify(topPlayers.value);
      
      // Only update if data changed
      if (newPlayersString !== oldPlayersString) {
        topPlayers.value = formattedPlayers;
        // Save to persistent cache
        saveToPersistentCache(cacheKey, formattedPlayers);
      }
    }
  } catch (err: unknown) {
    const apiError = err as ApiError;
    console.error("Error loading top players:", apiError);
  }
};



const formatPlaytime = (milliseconds: number): string => {
  if (!milliseconds) return "0г 0хв";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days} днів ${remainingHours} годин`;
  } else {
    return `${hours}г ${minutes}хв`;
  }
};


watch(activeTab, async (newTab) => {
  if (newTab === 0) {
    // Switching to chart tab - ensure chart is properly initialized
    await nextTick(); // Wait for DOM to update
    await loadHourlyData();
    // Force chart reinitialization if data exists
    if (hourlyChartData.value.length > 0) {
      await nextTick();
      initHourlyChart();
    }
  } else if (newTab === 1) {
    await loadTopPlayersData();
  }
});

const setupIntersectionObserver = () => {
  if (!props.lazy || !dashboardElement.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(async (entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          if (activeTab.value === 0) {
            await loadHourlyData();
          } else {
            await loadTopPlayersData();
          }
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );

  observer.observe(dashboardElement.value);
};

let refreshInterval: number | null = null;

onMounted(async () => {
  await loadEssentialData();

  dashboardElement.value = document.querySelector(".stats-dashboard");

  if (props.lazy) {
    setupIntersectionObserver();
  } else {
    isVisible.value = true;
    if (activeTab.value === 0) {
      await loadHourlyData();
    } else {
      await loadTopPlayersData();
    }
  }

  if (props.autoRefreshInterval > 0 && props.autoRefreshInterval >= 60) {
    refreshInterval = window.setInterval(() => {
      if (isVisible.value) {
        // Use the persistent caching approach for auto-refresh
        loadEssentialData(true).catch((err) => {
          console.error("Auto-refresh error:", err);
        });

        // Auto-refresh current tab data
        if (activeTab.value === 0) {
          loadHourlyData(true).catch((err) => {
            console.error("Hourly data auto-refresh error:", err);
          });
        } else if (activeTab.value === 1) {
          loadTopPlayersData(true).catch((err) => {
            console.error("Top players auto-refresh error:", err);
          });
        }
      }
    }, props.autoRefreshInterval * 1000);
  }
});

onUnmounted(() => {
  if (refreshInterval !== null) {
    clearInterval(refreshInterval);
  }

  if (hourlyChartInstance) {
    hourlyChartInstance.dispose();
    hourlyChartInstance = null;
  }

  window.removeEventListener('resize', () => {
    if (hourlyChartInstance && !hourlyChartInstance.isDisposed()) {
      hourlyChartInstance.resize();
    }
  });
});
</script>

<style scoped>
.stats-dashboard {
  width: 100%;
  max-width: min(1320px, 95vw);
  margin: 0 auto clamp(50px, 8vw, 100px) auto;
  color: #fff;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.server-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.server-selector label {
  color: #b4bbc5;
  font-size: 16px;
  font-weight: 500;
}

.server-select-dropdown {
  min-width: 140px;
}

.metrics-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}

.metric-card {
  flex: 1;
  min-width: 200px;
  background-color: #1e212b;
  border-radius: 7px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}

.players-icon {
  background-color: rgba(108, 93, 211, 0.2);
  color: #6c5dd3;
}

.online-icon {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.new-icon {
  background-color: rgba(238, 120, 40, 0.2);
  color: #ee7828;
}

.time-icon {
  background-color: rgba(14, 165, 233, 0.2);
  color: #0ea5e9;
}

.metric-content {
  flex: 1;
}

.metric-label {
  color: #b4bbc5;
  font-size: 16px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
}

.charts-container {
  background-color: #1e212b;
  border-radius: 7px;
  overflow: hidden;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.24);
}

.tabs {
  display: flex;
  border-bottom: 1px solid #34373d;
  width: 100%;
}

.tab {
  padding: 16px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #b4bbc5;
  position: relative;
  flex: 1;
  text-align: center;
  border-radius: 8px 8px 0 0;
  font-weight: 500;
  user-select: none;
}

.tab:hover {
  background-color: rgba(52, 55, 61, 0.5);
  color: #fff;
  transform: translateY(-2px);
}

.tab.active {
  background-color: #10b981;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tab.active:hover {
  background-color: #0d9668;
  transform: translateY(-2px);
}

.chart-panel {
  min-height: 400px;
  position: relative;
}

.chart-wrapper {
  height: 400px;
  width: 100%;
}

.chart {
  height: 100%;
  width: 100%;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #b4bbc5;
  z-index: 10;
}


.top-players-list {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.top-player-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #34373d;
  transition: background-color 0.2s ease;
}

.top-player-item:hover {
  background-color: #2a2d33;
}

.player-rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #2a2d33;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
}

.top-player-item:nth-child(1) .player-rank {
  background-color: #ffd700;
  color: #000;
}

.top-player-item:nth-child(2) .player-rank {
  background-color: #c0c0c0;
  color: #000;
}

.top-player-item:nth-child(3) .player-rank {
  background-color: #cd7f32;
  color: #000;
}

.player-info {
  flex: 1;
}

.player-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.player-time {
  font-size: 14px;
  color: #b4bbc5;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(23, 26, 33, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(108, 93, 211, 0.3);
  border-top-color: #6c5dd3;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fade-in-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-left {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse-online {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes number-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.fade-in-up {
  animation: fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
  will-change: opacity, transform;
  backface-visibility: hidden;
}

.slide-in-left {
  animation: slide-in-left 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  will-change: opacity, transform;
  backface-visibility: hidden;
}

.pulse-online {
  animation: pulse-online 2s ease-in-out infinite;
  will-change: opacity, transform;
}

.error-message {
  padding: 16px;
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border-radius: 7px;
  margin-top: 16px;
  text-align: center;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .dashboard-title {
    text-align: center;
    font-size: 28px;
  }

  .server-selector {
    justify-content: center;
  }

  .metrics-container {
    flex-direction: column;
  }

  .metric-card {
    width: 100%;
  }

  .tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
