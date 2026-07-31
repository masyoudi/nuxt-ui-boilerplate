<script setup lang="ts">
import { getColors } from 'theme-colors';
import chroma from 'chroma-js';

useHead({
  titleTemplate: '%s | NuxtApp'
});

const cookieTheme = useCookie('__themecolor');
const isValidColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cookieTheme.value ?? '');

const toast = useToast();
const appToastBus = useAppToastBus();

const tooltipState = useStateAppTooltip();
const tooltipOptions = computed(() => omit(tooltipState.value, 'open'));

appToastBus.on('add', (payload) => {
  const result = toast.add({ ...omit(payload, 'callback') });

  payload.callback?.(result);
});

appToastBus.on('update', (payload) => {
  toast.update(payload.id, { ...omit(payload, 'id') });
});

appToastBus.on('remove', (payload) => {
  toast.remove(payload.id);
});

appToastBus.on('clear', () => {
  toast.clear();
});

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

    <UTooltip
      v-model:open="tooltipState.open"
      v-bind="tooltipOptions"
    />
  </UApp>
</template>
