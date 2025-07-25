<script setup lang="ts">
import { getColors } from 'theme-colors';
import chroma from 'chroma-js';

const colors = [
  {
    label: 'Red',
    value: '#fe1616'
  },
  {
    label: 'Pink',
    value: '#ff006f'
  },
  {
    label: 'Violet',
    value: '#c016fe'
  },
  {
    label: 'Indigo',
    value: '#4c0ae6'
  },
  {
    label: 'Blue',
    value: '#0159F9'
  },
  {
    label: 'Teal',
    value: '#00bba7'
  },
  {
    label: 'Green',
    value: '#03c948'
  },
  {
    label: 'Yellow',
    value: '#ffbb00'
  },
  {
    label: 'Orange',
    value: '#ff6600'
  }
];

const cookieTheme = useCookie('__themecolor');
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light';
  }
});

async function onChangeColor(value: string) {
  document.documentElement.style.setProperty(`--color-primary`, `${chroma(value).css('oklch')}`);
  Object.entries(getColors(value)).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--color-primary-${key}`, `${chroma(color).css('oklch')}`);
  });

  cookieTheme.value = value;
}
</script>

<template>
  <UPopover :content="{ align: 'end' }">
    <UButton
      icon="lucide:paintbrush"
      color="neutral"
      variant="ghost"
    />

    <template #content>
      <div class="w-64 p-3.5">
        <div class="text-sm font-bold mb-2">
          Primary Color
        </div>
        <div class="w-full grid grid-cols-3 gap-2 mb-3.5">
          <div
            v-for="(item, i) in colors"
            :key="i"
            class="relative"
          >
            <UButton
              size="xs"
              block
              class="justify-start"
              color="neutral"
              :variant="item.value === cookieTheme ? 'subtle' : 'outline'"
              @click="onChangeColor(item.value)"
            >
              <span
                class="w-2 h-2 rounded-full"
                :style="`background-color: ${chroma(item.value).css('oklch')}`"
              />
              <span>
                {{ item.label }}
              </span>
            </UButton>
          </div>
        </div>

        <div class="h-px bg-(--ui-border) mb-3.5" />

        <div class="text-sm font-bold mb-2">
          Mode
        </div>

        <div class="flex gap-2">
          <UButton
            icon="lucide:sun"
            size="xs"
            class="justify-start"
            color="neutral"
            :variant="!isDark ? 'subtle' : 'outline'"
            @click="isDark = false"
          >
            Light
          </UButton>

          <UButton
            icon="lucide:moon"
            size="xs"
            class="justify-start"
            color="neutral"
            :variant="isDark ? 'subtle' : 'outline'"
            @click="isDark = true"
          >
            Dark
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
