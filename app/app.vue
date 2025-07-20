<script setup lang="ts">
import { getColors } from 'theme-colors';
import chroma from 'chroma-js';

useHead({
  titleTemplate: '%s | NuxtApp'
});

const cookieTheme = useCookie('__themecolor');
const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cookieTheme.value ?? '');

async function setThemeColor(value: string) {
  document.documentElement.style.setProperty(`--color-primary`, `${chroma(value).css('oklch')}`);
  Object.entries(getColors(value)).forEach(([key, color]) => {
    document.documentElement.style.setProperty(`--color-primary-${key}`, `${chroma(color).css('oklch')}`);
  });
}

if (isValidColor) {
  setThemeColor(cookieTheme.value!);
}
</script>

<template>
  <UApp
    :toaster="{ position: 'top-right', expand: false }"
    :tooltip="{ delayDuration: 150, skipDelayDuration: 100 }"
  >
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
