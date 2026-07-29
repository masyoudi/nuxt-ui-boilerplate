<script setup lang="ts">
useHead({
  titleTemplate: '%s | NuxtApp'
});

const toast = useToast();
const appToastBus = useAppToastBus();

const tooltipState = useStateAppTooltip();
const restTooltipState = computed(() => omit(tooltipState.value, 'open'));

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
      v-bind="restTooltipState"
    />
  </UApp>
</template>
