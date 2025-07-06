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

function onDeleteFile(index: number) {
  files.value = files.value.filter((_, idx) => idx !== index);
}
</script>

<template>
  <div class="w-full p-5">
    <UCard>
      <UFormField label="Input">
        <FormUpload
          v-slot="{ onclick }"
          v-model="file"
          class="mb-5"
          accept=".pdf"
        >
          <UButtonGroup
            class="w-full"
            size="lg"
          >
            <UButton
              label="Choose file"
              @click="onclick"
            />
            <UInput
              :model-value="file?.name"
              placeholder="Upload file here"
              readonly
              class="grow shrink"
              @click="onclick"
            />
          </UButtonGroup>
        </FormUpload>
      </UFormField>

      <UFormField label="Drag &amp; Drop">
        <FormUpload
          v-slot="{ onclick }"
          v-model="files"
          multiple
          drag-drop
          class="mb-5"
          accept=".pdf"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-2">
            <div
              v-for="(_file, i) in files"
              :key="i"
              class="relative border border-slate-300 rounded-md py-3"
            >
              <div
                class="absolute inline-flex justify-center items-center top-0.5 right-0.5 hover:bg-black/10 rounded-sm cursor-pointer select-none"
                @click.prevent.stop="() => onDeleteFile(i)"
              >
                <UIcon name="lucide:x" />
              </div>
              <div class="flex">
                <div class="inline-flex text-sm rounded-r-md bg-slate-600 text-white py-0.5 px-2">
                  {{ _file.name.split('.').pop() }}
                </div>
              </div>
              <div class="flex pt-4 px-3">
                <div class="truncate">
                  {{ _file.name }}
                </div>
              </div>
            </div>
            <div
              class="relative rounded-md select-none p-3"
              :class="{ 'md:col-span-2 lg:col-span-4': !files.length }"
              @click.stop.prevent="onclick"
            >
              <p class="text-center mb-1">
                Drop files here
              </p>
              <p class="text-center mb-1">
                or
              </p>
              <div class="flex justify-center">
                <UButton>
                  Click Here
                </UButton>
              </div>
            </div>
          </div>
        </FormUpload>
      </UFormField>
    </UCard>
  </div>
</template>
