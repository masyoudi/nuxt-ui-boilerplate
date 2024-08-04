<template>
  <div class="w-full px-4 lg:px-6 py-10">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7">
        <UCard>
          <div class="text-lg font-semibold">Sales Overview</div>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur asperiores beatae similique quisquam ullam
            repudiandae, itaque molestiae delectus sed et facilis corporis distinctio provident magnam, vero amet, iure quae ex.
          </p>
        </UCard>
      </div>
      <div class="lg:col-span-5">
        <UCard>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur asperiores beatae similique quisquam ullam
            repudiandae, itaque molestiae delectus sed et facilis corporis distinctio provident magnam, vero amet, iure quae ex.
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: 'analytics'
});

useHead({
  title: 'Analytics'
});
</script>
