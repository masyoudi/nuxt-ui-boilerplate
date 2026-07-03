<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'modal']
});

useHead({
  title: 'Modal'
});

const nested = ref(false);
const second = ref(false);
const fullscreen = ref(false);
</script>

<template>
  <div class="w-full p-5">
    <UCard>
      <UEditor />
      <div class="flex flex-wrap gap-4">
        <UButton
          @click="nested = true"
        >
          Nested
        </UButton>
        <UButton
          color="success"
          @click="fullscreen = true"
        >
          Fullscreen
        </UButton>
      </div>

      <AppModal
        v-model="nested"
        title="Nested Modal"
      >
        <template #body>
          <p
            v-for="val in 2"
            :key="val"
          >
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam.
            Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
          </p>
        </template>

        <template #footer>
          <UButton @click="second = true">
            Second
          </UButton>
        </template>
      </AppModal>

      <AppModal v-model="second">
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam.
          Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
        </p>
      </AppModal>

      <AppModal
        v-model="fullscreen"
        fullscreen
        :scrollable="false"
      >
        <template #header>
          This is Header
        </template>

        <template #body>
          <p
            v-for="val in 20"
            :key="val"
          >
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam.
            Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
          </p>
        </template>

        <template #footer>
          <UButton
            color="neutral"
            variant="outline"
            @click="fullscreen = false"
          >
            Close
          </UButton>
          <UButton>
            Submit
          </UButton>
        </template>
      </AppModal>
    </UCard>
  </div>
</template>
