<script setup lang="ts">
useHead({
  titleTemplate: '%s | NuxtApp'
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
  </UApp>
</template>
