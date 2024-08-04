<template>
  <div ref="target" class="relative" :style="{ height: props.height + 'px' }"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { useResizeObserver } from '@vueuse/core';

interface Props {
  options?: Record<string, any>;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  options: undefined,
  height: 190
});
const target = ref<HTMLElement>();
const chart = shallowRef<ReturnType<typeof echarts.init>>();

const resizeObserver = shallowRef<ReturnType<typeof useResizeObserver>>();

/**
 * Init chart
 */
function init() {
  if (!target.value || !props.options) {
    return;
  }

  resizeObserver.value = useResizeObserver(target.value, () => {
    chart.value?.resize();
  });

  chart.value = echarts.init(target.value);
  update();
  watch(() => props.options, update, { deep: true });
}

/**
 * Update chart
 */
function update() {
  chart.value?.setOption(props.options as echarts.EChartsOption);
}

defineExpose({
  chart: chart.value,
  update
});

onMounted(init);

onBeforeUnmount(() => {
  resizeObserver.value?.stop();
  chart.value?.dispose();
});
</script>
