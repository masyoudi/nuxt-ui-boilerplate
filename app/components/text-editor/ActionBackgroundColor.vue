<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

const props = defineProps<{
  editor: Editor;
}>();

const open = ref(false);
const color = ref('');

function onOpen(isOpen: boolean) {
  if (!isOpen) {
    return;
  }

  color.value = props.editor.getAttributes('textStyle').backgroundColor || '#00C16A';
}

function apply() {
  open.value = false;
  props.editor.chain().focus().setBackgroundColor(color.value).run();
}

function unset() {
  open.value = false;
  props.editor.chain().focus().unsetBackgroundColor().run();
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{
      content: 'p-0.5'
    }"
    @update:open="onOpen"
  >
    <UTooltip text="Background Color">
      <UButton
        icon="lucide:paintbrush"
        color="neutral"
        active-color="primary"
        variant="ghost"
        active-variant="soft"
        size="sm"
      />
    </UTooltip>

    <template #content>
      <UColorPicker
        v-model="color"
        format="hex"
        class="p-2"
      />

      <div class="flex justify-end gap-2 px-2 pb-2">
        <UButton
          label="Unset"
          color="neutral"
          variant="outline"
          size="xs"
          @click="unset"
        />
        <UButton
          label="Apply"
          size="xs"
          @click="apply"
        />
      </div>
    </template>
  </UPopover>
</template>
