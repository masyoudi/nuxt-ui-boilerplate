<template>
  <div class="w-full px-4 lg:px-6 py-10">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <UCard v-for="(item, i) in overviews" :key="i">
        <div class="grid grid-cols-[max-content_1fr] gap-3">
          <div class="inline-flex justify-center items-center w-12 h-12 rounded-md" :class="item.icon.class">
            <UIcon :name="item.icon.name" class="w-5 h-5"></UIcon>
          </div>
          <div>
            <div class="text-sm font-medium mb-1">{{ item.label }}</div>
            <div class="text-xl font-bold">{{ item.total }}</div>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7">
        <UCard>
          <div class="text-lg font-medium mb-4">Project Overview</div>
          <ClientOnly>
            <EChart :options="chartOptions" :height="225"></EChart>
          </ClientOnly>
        </UCard>
      </div>
      <div class="lg:col-span-5">
        <UCard>
          <div class="text-lg font-medium mb-4">Team Members</div>
          <div v-for="(team, i) in teams" :key="'team-' + i" class="grid grid-cols-[max-content_1fr] gap-x-3 mb-4">
            <div>
              <UAvatar icon="i-heroicons-user-circle" size="md"></UAvatar>
            </div>
            <div>
              <div class="text-md text-slate-700 dark:text-slate-300">{{ team.name }}</div>
              <div class="text-xs font-medium text-slate-500 dark:text-slate-300">{{ team.position }}</div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: 'index'
});

useHead({
  title: 'Home'
});

const overviews = [
  {
    label: 'Active Projects',
    total: 10,
    icon: {
      name: 'i-heroicons:document-text',
      class: 'bg-green-100 dark:bg-green-300 text-green-500 dark:text-green-700'
    }
  },
  {
    label: 'Total Employees',
    total: 10,
    icon: {
      name: 'i-heroicons:user-group',
      class: 'bg-blue-100 dark:bg-blue-300 text-blue-500 dark:text-blue-700'
    }
  },
  {
    label: 'Project Reviews',
    total: 10,
    icon: {
      name: 'i-heroicons:star',
      class: 'bg-purple-100 dark:bg-purple-300 text-purple-500 dark:text-purple-700'
    }
  },
  {
    label: 'New Projects',
    total: 10,
    icon: {
      name: 'i-heroicons:folder-plus',
      class: 'bg-orange-100 dark:bg-orange-300 text-orange-500 dark:text-orange-700'
    }
  }
];

const chartOptions = computed(() => ({
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
    data: ['Product Design', 'Web Development', 'Illustration Design', 'UI/UX Design']
  },
  series: [
    {
      name: 'Total Project',
      type: 'bar',
      data: [
        {
          value: 26,
          itemStyle: {
            color: '#fc9b24',
            borderRadius: [0, 7, 7, 0]
          }
        },
        {
          value: 30,
          itemStyle: {
            color: '#e684a7',
            borderRadius: [0, 7, 7, 0]
          }
        },
        {
          value: 12,
          itemStyle: {
            color: '#88d29a',
            borderRadius: [0, 7, 7, 0]
          }
        },
        {
          value: 8,
          itemStyle: {
            color: '#5374e8',
            borderRadius: [0, 7, 7, 0]
          }
        }
      ]
    }
  ]
}));

const teams = [
  {
    name: 'John',
    position: 'Web Developer'
  },
  {
    name: 'Jane',
    position: 'Product Designer'
  },
  {
    name: 'Lucky',
    position: 'UI/UX'
  },
  {
    name: 'Rambo',
    position: 'Illustration Design'
  }
];
</script>
