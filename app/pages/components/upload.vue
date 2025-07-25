<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'upload']
});

useHead({
  title: 'Upload'
});

const file = ref<File>();
const files = ref<File[]>([]);
</script>

<template>
  <div class="w-full p-5">
    <UCard>
      <UFormField
        label="Input"
        class="mb-5"
      >
        <UFileUpload
          v-slot="{ open }"
          v-model="file"
          accept=".pdf"
        >
          <UButtonGroup
            class="w-full"
            size="lg"
          >
            <UButton
              label="Choose file"
              @click="open()"
            />
            <UInput
              :model-value="file?.name"
              placeholder="Upload file here"
              readonly
              class="grow shrink"
              @click="open()"
            />
          </UButtonGroup>
        </UFileUpload>
      </UFormField>

      <UFormField label="Drag &amp; Drop">
        <UFileUpload
          v-model="files"
          multiple
          dropzone
          :interactive="false"
          variant="area"
          accept=".pdf"
        />
      </UFormField>
    </UCard>
  </div>
</template>
