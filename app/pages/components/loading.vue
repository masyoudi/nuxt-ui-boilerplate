<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'loading']
});

useHead({
  title: 'Loading'
});

const loading = ref(false);

watch(() => loading.value, (open) => {
  if (open) {
    setTimeout(() => loading.value = false, 3000);
  }
});
</script>

<template>
  <div class="w-full p-5">
    <UCard>
      <div class="w-full mb-5">
        <LoadingSpinner />
      </div>
      <div class="w-full">
        <UButton @click="loading = true">
          Open
        </UButton>
      </div>

      <LoadingOverlay v-model="loading" />
    </UCard>
  </div>
</template>
