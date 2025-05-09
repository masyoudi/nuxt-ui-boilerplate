<script setup lang="ts">
import { PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'upload']
});

useHead({
  title: 'Upload'
});

const file = ref<File>();
const files = ref<File[]>([]);
const show = ref(false);

function onDeleteFile(index: number) {
  files.value = files.value.filter((_, idx) => idx !== index);
}
</script>

<template>
  <div class="w-full p-5">
    <div class="w-full shadow rounded-xl bg-white p-5">
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

      <PopoverRoot>
        <PopoverTrigger
          class="inline-flex "
          aria-label="Update dimensions"
        >
          <UButton
            label="Popover"
            @click="show = true"
          />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverContent
            v-show="show"
            side="bottom"
            :side-offset="5"
            force-mount
            class="rounded-lg p-5 w-[260px] bg-white shadow-sm border border-slate-300 will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
          >
            <div class="flex flex-col gap-2.5">
              <p class="text-mauve12 text-sm leading-[19px] font-semibold mb-2.5">
                Dimensions
              </p>

              <UFormField
                label="Hobbies"
                name="hobbies"
              >
                <MultiSelect
                  url="/todos"
                  paginated
                  color="neutral"
                  item-color="primary"
                  item-variant="subtle"
                  placeholder="Search anything..."
                  :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
                  :debounce="500"
                />
              </UFormField>
            </div>
            <PopoverClose
              class="rounded-full h-[25px] w-[25px] inline-flex items-center justify-center text-grass11 absolute top-[8px] right-[8px] hover:bg-green4 focus:shadow-[0_0_0_2px] focus:shadow-green7 outline-none cursor-default"
              aria-label="Close"
            >
              <UIcon name="lucide:x" />
            </PopoverClose>
            <PopoverArrow class="fill-white stroke-gray-200" />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </div>
  </div>
</template>
