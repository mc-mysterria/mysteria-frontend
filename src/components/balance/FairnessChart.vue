<template>
  <div ref="host" class="fairness-chart"></div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref, watch} from 'vue';
import * as echarts from 'echarts/core';
import {LineChart} from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {fmt} from '@/utils/coiBalance/model';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent,
  MarkLineComponent, MarkAreaComponent, CanvasRenderer]);

export interface ChartSeries {
  name: string;
  color: string;
  /** one entry per sequence column (S9 → S0); null = gap */
  data: Array<number | null>;
  /** raw metric values, for the tooltip (index mode) */
  raw?: Array<number | null>;
  /** true where the point sits outside the fair band */
  flags?: boolean[];
  /** pre-edit values, drawn as a dashed ghost */
  ghost?: Array<number | null> | null;
}

export interface ChartChrome {
  ink: string;
  muted: string;
  grid: string;
  axis: string;
  surface: string;
  crit: string;
}

const props = defineProps<{
  mode: 'index' | 'absolute';
  series: ChartSeries[];
  /** column medians (absolute mode draws them as a dashed reference series) */
  medians?: Array<number | null>;
  threshold: number;
  metricLabel: string;
  chrome: ChartChrome;
}>();

const host = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let ro: ResizeObserver | null = null;

const SEQ_LABELS = ['S9', 'S8', 'S7', 'S6', 'S5', 'S4', 'S3', 'S2', 'S1', 'S0'];
const GHOST_SUFFIX = ' · before';

const pow2Floor = (x: number) => Math.pow(2, Math.floor(Math.log2(x)));
const pow2Ceil = (x: number) => Math.pow(2, Math.ceil(Math.log2(x)));

function buildOption(): echarts.EChartsCoreOption {
  const c = props.chrome;
  const isIndex = props.mode === 'index';
  const mono = "'JetBrains Mono', monospace";

  const allVals = props.series.flatMap(s => s.data).filter((v): v is number => v != null && v > 0);
  let yMin: number | 'dataMin' = 'dataMin';
  let yMax: number | 'dataMax' = 'dataMax';
  if (isIndex) {
    yMin = Math.min(0.25, allVals.length ? pow2Floor(Math.min(...allVals)) : 0.25);
    yMax = Math.max(4, allVals.length ? pow2Ceil(Math.max(...allVals)) : 4);
  }

  const mainSeries = props.series.map((s, i) => ({
    name: s.name,
    type: 'line' as const,
    data: s.data.map((v, di) => ({
      value: v,
      raw: s.raw?.[di] ?? null,
      symbolSize: s.flags?.[di] ? 9 : 5,
      itemStyle: s.flags?.[di]
          ? {color: s.color, borderColor: c.crit, borderWidth: 2}
          : {color: s.color, borderColor: c.surface, borderWidth: 1},
    })),
    color: s.color,
    symbol: 'circle',
    showSymbol: true,
    connectNulls: false,
    lineStyle: {width: 2},
    emphasis: {focus: 'series' as const, scale: 1.6},
    endLabel: {
      show: true,
      formatter: () => s.name,
      color: c.ink,
      fontSize: 11,
      fontFamily: mono,
      distance: 8,
    },
    labelLayout: {moveOverlap: 'shiftY' as const},
    // reference band + median line ride on the first series only
    ...(i === 0 && isIndex ? {
      markLine: {
        silent: true,
        symbol: 'none',
        label: {
          formatter: 'median',
          position: 'insideStartTop' as const,
          color: c.muted,
          fontSize: 10,
          fontFamily: mono,
        },
        lineStyle: {color: c.axis, type: 'solid' as const, width: 1.5},
        data: [{yAxis: 1}],
      },
      markArea: {
        silent: true,
        itemStyle: {color: 'rgba(137,135,129,0.08)'},
        data: [[{yAxis: 1 - props.threshold}, {yAxis: 1 + props.threshold}]],
      },
    } : {}),
  }));

  const ghostSeries = props.series
      .filter(s => s.ghost)
      .map(s => ({
        name: s.name + GHOST_SUFFIX,
        type: 'line' as const,
        data: s.ghost!.map(v => ({value: v})),
        color: s.color,
        symbol: 'none',
        connectNulls: false,
        silent: true,
        lineStyle: {width: 2, type: 'dashed' as const, opacity: 0.35},
        emphasis: {disabled: true},
        endLabel: {
          show: true,
          formatter: 'before',
          color: c.muted,
          fontSize: 10,
          fontFamily: mono,
          distance: 8,
        },
      }));

  const medianSeries = (!isIndex && props.medians) ? [{
    name: 'median',
    type: 'line' as const,
    data: props.medians.map(v => ({value: v})),
    color: c.muted,
    symbol: 'none',
    connectNulls: false,
    lineStyle: {width: 1.5, type: 'dashed' as const},
    emphasis: {disabled: true},
    endLabel: {
      show: true, formatter: 'median', color: c.muted,
      fontSize: 10, fontFamily: mono, distance: 8,
    },
  }] : [];

  return {
    animationDuration: 300,
    grid: {left: 56, right: 118, top: 18, bottom: 52},
    legend: {
      bottom: 0,
      left: 'center',
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 12,
      data: props.series.map(s => s.name),
      textStyle: {color: c.ink, fontSize: 11, fontFamily: mono},
      inactiveColor: c.axis,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.surface,
      borderColor: c.grid,
      textStyle: {color: c.ink, fontSize: 12, fontFamily: mono},
      axisPointer: {type: 'line', lineStyle: {color: c.axis}},
      formatter: (params: unknown) => {
        interface TipParam {
          seriesName: string;
          color: string;
          value: number | null;
          axisValueLabel: string;
          data?: { raw?: number | null };
        }
        const list = (Array.isArray(params) ? params : [params]) as TipParam[];
        const rows = list.filter(p => !String(p.seriesName).endsWith(GHOST_SUFFIX));
        if (!rows.length) return '';
        let html = `<div style="font-weight:600;margin-bottom:4px">${rows[0].axisValueLabel} · ${props.metricLabel}</div>`;
        for (const p of rows) {
          const v = p.value;
          if (v == null) continue;
          const dot = `<span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${p.color};margin-right:6px"></span>`;
          if (p.seriesName === 'median') {
            html += `<div>${dot}median&nbsp;&nbsp;<b>${fmt(v as number)}</b></div>`;
          } else if (props.mode === 'index') {
            const raw = p.data?.raw;
            html += `<div>${dot}${p.seriesName}&nbsp;&nbsp;<b>${(v as number).toFixed(2)}×</b>`
                + (raw != null ? ` <span style="opacity:.65">(${fmt(raw)})</span>` : '') + `</div>`;
          } else {
            html += `<div>${dot}${p.seriesName}&nbsp;&nbsp;<b>${fmt(v as number)}</b></div>`;
          }
        }
        if (props.mode === 'index') {
          html += `<div style="opacity:.65;margin-top:4px">fair band ±${Math.round(props.threshold * 100)}% of median</div>`;
        }
        return html;
      },
    },
    xAxis: {
      type: 'category',
      data: SEQ_LABELS,
      boundaryGap: false,
      axisLine: {lineStyle: {color: c.axis}},
      axisTick: {show: false},
      axisLabel: {color: c.muted, fontSize: 11, fontFamily: mono},
    },
    yAxis: {
      type: 'log',
      logBase: isIndex ? 2 : 10,
      min: yMin,
      max: yMax,
      axisLine: {show: false},
      splitLine: {lineStyle: {color: c.grid, width: 1}},
      axisLabel: {
        color: c.muted, fontSize: 11, fontFamily: mono,
        formatter: (v: number) => isIndex
            ? (v >= 1 ? `${v}×` : `${parseFloat(v.toFixed(3))}×`)
            : fmt(v),
      },
    },
    series: [...ghostSeries, ...mainSeries, ...medianSeries],
  };
}

function render() {
  if (!chart) return;
  chart.setOption(buildOption(), {notMerge: true});
}

onMounted(() => {
  if (!host.value) return;
  chart = echarts.init(host.value);
  render();
  ro = new ResizeObserver(() => chart?.resize());
  ro.observe(host.value);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  chart?.dispose();
  chart = null;
});

watch(() => [props.series, props.mode, props.medians, props.chrome, props.metricLabel], render, {deep: true});
</script>

<style scoped>
.fairness-chart {
  width: 100%;
  height: 380px;
}
</style>
