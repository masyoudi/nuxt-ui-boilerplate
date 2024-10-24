<script setup lang="ts">
useHead({
  titleTemplate: '%s | NuxtApp'
});
</script>

<template>
  <UApp :toaster="{ position: 'top-right' }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
