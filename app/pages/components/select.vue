<script setup lang="ts">
import { FocusScope, PopoverArrow, PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverAnchor } from 'reka-ui';
import { toArray } from '~~/shared/utils';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'select']
});

useHead({
  title: 'Select'
});

const autocomplete = ref();
const multiselects = ref<any[]>([]);

const openPopover = ref(false);

async function onTogglePopover() {
  const open = !openPopover.value;

  await nextTick();
  openPopover.value = open;

  setTimeout(() => trapFocus(document.querySelector('[data-focus]')!));
}
</script>

<template>
  <div class="w-full p-5">
    <UCard :ui="{ body: 'space-y-5' }">
      <UFormField label="Autocomplete">
        <UButtonGroup
          class="w-full"
        >
          <UButton>Group</UButton>
          <MultiSelect
            v-model="autocomplete"
            url="/todos"
            paginated
            placeholder="Search anything..."
            :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
            :debounce="500"
          />
        </UButtonGroup>
      </UFormField>

      <UFormField label="Multiselect">
        <MultiSelect
          v-model="multiselects"
          multiple
          url="/todos"
          paginated
          placeholder="Search anything..."
          :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
          :debounce="500"
        />
      </UFormField>

      <UFormField label="Input">
        <UInput
          size="md"
          placeholder="Input text..."
          class="w-full"
        />
      </UFormField>

      <UFormField label="Within Popover">
        <ClientOnly>
          <PopoverRoot>
            <PopoverAnchor
              class="inline-flex"
              :class="{ 'pointer-events-none': openPopover }"
            >
              <UButton
                label="Open Popover"
                @click="onTogglePopover"
              />
            </PopoverAnchor>
            <PopoverPortal>
              <PopoverContent
                v-show="openPopover"
                side="bottom"
                :side-offset="5"
                :collision-padding="8"
                force-mount
                update-position-strategy="always"
                :data-open="openPopover ? 'true' : 'false'"
                :class="[
                  'rounded-lg p-5 w-[350px] bg-white shadow-sm border border-slate-200',
                  'will-change-[transform,opacity] origin-(--reka-popover-content-transform-origin)',
                  'data-[open=true]:animate-[scale-in_100ms_ease-out] data-[open=false]:animate-[scale-out_100ms_ease-in]'
                ]"
                @escape-key-down="openPopover = false"
                @interact-outside="openPopover = false"
              >
                <FocusScope
                  class="w-full"
                  data-focus=""
                >
                  <div class="flex flex-col gap-2.5">
                    <p class="text-sm leading-[19px] font-semibold mb-2.5">
                      Filter
                    </p>

                    <UFormField
                      label="Hobbies"
                      name="hobbies"
                    >
                      <MultiSelect
                        url="/todos"
                        paginated
                        color="neutral"
                        placeholder="Search anything..."
                        :transform-fetch-data="(res) => toArray(res).map((val) => ({ value: val.id, label: val.task }))"
                        :debounce="500"
                        :portal="false"
                      />
                    </UFormField>
                  </div>
                  <PopoverClose
                    :class="[
                      'inline-flex size-[25px] items-center justify-center absolute top-[8px] right-[8px]',
                      'rounded-full outline-none cursor-default'
                    ]"
                    aria-label="Close"
                    @click="openPopover = false"
                  >
                    <UIcon name="lucide:x" />
                  </PopoverClose>
                </FocusScope>
                <PopoverArrow
                  as="span"
                  :width="10"
                  :height="10"
                  class="relative w-[20px] h-[15px]"
                >
                  <span
                    :class="[
                      'size-[20px] absolute rotate-45 -top-[10px] bg-white',
                      'border border-r-slate-200 border-b-slate-200 border-t-transparent border-l-transparent'
                    ]"
                  />
                </PopoverArrow>
              </PopoverContent>
            </PopoverPortal>
          </PopoverRoot>

          <template #fallback>
            <UButton
              label="Open Popover"
            />
          </template>
        </ClientOnly>
      </UFormField>
    </UCard>
  </div>
</template>
