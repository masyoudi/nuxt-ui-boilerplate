<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: 'home'
});

useHead({
  title: 'Home'
});

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
          <div
            class="relative block min-h-44"
            :style="[
              '--vis-tooltip-padding: 5px 7px',
              ' --vis-axis-tick-color: var(--ui-border)',
              '--vis-axis-grid-color: var(--ui-border)'
            ]"
          >
            <HomeChartTopic />
          </div>
        </UCard>
      </div>
      <div class="relative lg:col-span-3">
        <UCard>
          <div class="text-xl font-semibold mb-5">
            Activity
          </div>
          <div
            class="relative block min-h-60"
            :style="[
              '--vis-tooltip-padding: 5px 7px',
              ' --vis-axis-tick-color: var(--ui-border)',
              '--vis-axis-grid-color: var(--ui-border)',
              '--vis-crosshair-line-stroke-color: transparent',
              '--vis-crosshair-circle-stroke-color: transparent'
            ]"
          >
            <HomeChartActivity />
          </div>
        </UCard>
      </div>
      <div class="relative lg:col-span-2">
        <UCard>
          <div class="text-xl font-semibold mb-8">
            Completed Task
          </div>
          <div
            class="size-48 mx-auto"
            style="--vis-donut-central-label-text-color: var(--ui-text)"
          >
            <HomeChartCompleteTask />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
