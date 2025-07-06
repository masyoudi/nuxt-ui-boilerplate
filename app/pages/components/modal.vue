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
        display-directive="show"
      >
        <div class="w-full flex gap-4">
          <UButton @click="second = true">
            Second
          </UButton>
        </div>
        <p
          v-for="val in 10"
          :key="val"
        >
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam. Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
        </p>
      </AppModal>

      <AppModal
        v-model="second"
        class="z-[55]"
      >
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam. Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
        </p>
      </AppModal>

      <AppModal
        v-model="fullscreen"
        :ui="{
          wrapper: 'overflow-y-hidden',
          inner: 'overflow-hidden px-0 py-0',
          content: 'max-w-full h-screen rounded-none p-0'
        }"
      >
        <UCard
          :ui="{
            root: 'flex flex-col h-screen rounded-none',
            header: 'grow-0 shrink-0',
            body: 'grow shrink overflow-y-auto',
            footer: 'flex flex-wrap justify-end gap-3 grow-0 shrink-0'
          }"
        >
          <template #header>
            This is Header
          </template>

          <p
            v-for="val in 20"
            :key="val"
          >
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quisquam tempora repudiandae at error in, molestiae aperiam. Non amet placeat similique suscipit ipsum architecto voluptas deleniti eos laudantium? Labore, dicta nostrum?
          </p>

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
        </UCard>
      </AppModal>
    </UCard>
  </div>
</template>
