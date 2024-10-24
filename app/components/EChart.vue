<template>
  <div
    ref="targetRef"
    class="relative"
    :style="{ height: props.height + 'px' }"
  />
</template>

<script setup lang="ts">
import { CanvasRenderer } from 'echarts/renderers';
import { init, use } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { LegendComponent, GridComponent, TooltipComponent, ToolboxComponent, TitleComponent, DataZoomComponent } from 'echarts/components';
import type { ECharts, ComposeOption, SetOptionOpts } from 'echarts/core';
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts';
import type { TitleComponentOption, GridComponentOption } from 'echarts/components';

import { useResizeObserver } from '@vueuse/core';

interface Props {
  options: EChartsOption;
  settings?: SetOptionOpts;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  height: 190
});

const targetRef = useTemplateRef('targetRef');

const chart = shallowRef<ECharts>();

const resizeObserver = shallowRef<ReturnType<typeof useResizeObserver>>();

/**
 * Init chart
 */
function initialize() {
  use([
    LegendComponent,
    BarChart,
    LineChart,
    PieChart,
    GridComponent,
    TooltipComponent,
    TitleComponent,
    ToolboxComponent, // A group of utility tools, which includes export, data view, dynamic type switching, data area zooming, and reset.
    DataZoomComponent, // Used in Line Graph Charts
    CanvasRenderer // If you only need to use the canvas rendering mode, the bundle will not include the SVGRenderer module, which is not needed.
  ]);

  if (!targetRef.value || !props.options) {
    return;
  }

  chart.value = init(targetRef.value);
  resizeObserver.value = useResizeObserver(targetRef.value, () => {
    chart.value?.resize();
  });

  update();
  watch(() => [props.options, props.settings], update, { deep: true });
}

/**
 * Update chart
 */
function update() {
  chart.value?.setOption(props.options, props.settings);
}

defineExpose({
  chart: chart.value,
  update
});

onMounted(initialize);

onBeforeUnmount(() => {
  resizeObserver.value?.stop();
  chart.value?.dispose();
});
</script>

<script lang="ts">
export type EChartsOption = ComposeOption<
  | BarSeriesOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | GridComponentOption
>;
</script>
