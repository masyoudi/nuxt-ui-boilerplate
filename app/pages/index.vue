<script setup lang="ts">
import type { EChartsOption } from '~/components/EChart.vue';

definePageMeta({
  middleware: 'auth',
  activeMenu: 'home'
});

useHead({
  title: 'Home'
});

const barChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    show: false
  },
  grid: {
    left: '0%',
    right: '2%',
    bottom: '0%',
    top: '4%',
    containLabel: true
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01]
  },
  yAxis: {
    type: 'category',
    data: ['UI Design', 'Frontend', 'SEO']
  },
  series: [
    {
      name: 'Total',
      type: 'bar',
      data: [
        {
          value: 26,
          itemStyle: {
            color: '#0084ff',
            borderRadius: [0, 7, 7, 0]
          }
        },
        {
          value: 30,
          itemStyle: {
            color: '#03c948',
            borderRadius: [0, 7, 7, 0]
          }
        },
        {
          value: 12,
          itemStyle: {
            color: '#ffbb00',
            borderRadius: [0, 7, 7, 0]
          }
        }
      ]
    }
  ]
}));

const doughnutChartOptions = computed<EChartsOption>(() => ({
  grid: {
    left: '0%',
    right: '0%',
    bottom: '0%',
    top: '0%',
    containLabel: false
  },
  series: [
    {
      name: 'Completed Task',
      type: 'pie',
      radius: ['80%', '90%'],
      avoidLabelOverlap: true,
      padAngle: -8,
      label: {
        show: true,
        position: 'center',
        formatter: '70%',
        fontSize: 20,
        fontWeight: 600
      },
      emphasis: {
        focus: 'none',
        scale: false
      },
      data: [
        {
          value: 300,
          name: 'Undone',
          itemStyle: {
            color: '#f0f0f0',
            borderRadius: 100
          }
        },
        {
          value: 700,
          name: 'Done',
          itemStyle: {
            color: '#03c948',
            borderRadius: 100
          }
        }
      ]
    }
  ]
}));

const lineChartOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '2%',
    right: '2%',
    bottom: '2%',
    top: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Completed Task',
      type: 'line',
      showSymbol: false,
      clip: true,
      smooth: true,
      lineStyle: {
        color: '#ff6600'
      },
      data: [200, 900, 400, 1200, 500, 1400, 900].map((v) => ({
        value: v,
        itemStyle: {
          color: '#ff6600'
        }
      }))
    }
  ]
}));

const statistics = [
  {
    label: 'Pending',
    progress: 50,
    icon: 'lucide:history',
    color: 'text-orange-500',
    background: {
      soft: 'bg-orange-500/10',
      solid: 'bg-orange-500'
    }
  },
  {
    label: 'In Progress',
    progress: 35,
    icon: 'lucide:loader',
    color: 'text-blue-500',
    background: {
      soft: 'bg-blue-500/10',
      solid: 'bg-blue-500'
    }
  },
  {
    label: 'Done',
    progress: 15,
    icon: 'lucide:circle-check-big',
    color: 'text-green-500',
    background: {
      soft: 'bg-green-500/10',
      solid: 'bg-green-500'
    }
  }
];
</script>

<template>
  <div class="w-full p-5">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-5">
      <div class="relative lg:col-span-2">
        <UCard>
          <div class="text-xl font-semibold mb-5">
            Statistic
          </div>
          <div
            v-for="(item, i) in statistics"
            :key="`statistic-${i}`"
            class="w-full grid grid-cols-[max-content_1fr] gap-3 mb-5"
          >
            <div class="relative">
              <div
                class="inline-flex justify-center items-center rounded-lg p-2.5"
                :class="[item.background.soft, item.color]"
              >
                <UIcon
                  :name="item.icon"
                  class="size-5"
                />
              </div>
            </div>
            <div class="relative">
              <div class="flex justify-between">
                <div class="text-sm font-medium">
                  {{ item.label }}
                </div>
                <div
                  class="text-sm font-medium"
                  :class="item.color"
                >
                  {{ item.progress }}%
                </div>
              </div>
              <UProgress
                :model-value="item.progress"
                :max="100"
                :ui="{
                  indicator: item.background.solid,
                  base: item.background.soft
                }"
              />
            </div>
          </div>
        </UCard>
      </div>
      <div class="relative lg:col-span-3">
        <UCard>
          <div class="text-xl font-semibold mb-5">
            Topic
          </div>
          <EChart
            :options="barChartOptions"
            :height="180"
          />
        </UCard>
      </div>
      <div class="relative lg:col-span-3">
        <UCard>
          <div class="text-xl font-semibold mb-5">
            Activity
          </div>
          <EChart
            :options="lineChartOptions"
            :height="200"
          />
        </UCard>
      </div>
      <div class="relative lg:col-span-2">
        <UCard>
          <div class="text-xl font-semibold mb-5">
            Completed Task
          </div>
          <EChart
            :options="doughnutChartOptions"
            :height="200"
          />
        </UCard>
      </div>
    </div>
  </div>
</template>
