<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';

const props = defineProps<{
  editor: Editor;
  autoOpen?: boolean;
}>();

const open = ref(false);
const url = ref('');

const active = computed(() => props.editor.isActive('link'));
const disabled = computed(() => {
  if (!props.editor.isEditable) {
    return true;
  }

  const { selection } = props.editor.state;
  return selection.empty && !props.editor.isActive('link');
});

function updateUrl(_editor: Editor) {
  const { href } = _editor.getAttributes('link');
  url.value = href || '';
}

function setLink() {
  if (!url.value) {
    return;
  }

  const { selection } = props.editor.state;
  const isEmpty = selection.empty;
  const hasCode = props.editor.isActive('code');
  const markType = hasCode && !isEmpty ? 'code' : 'link';
  // When linking code, extend the code mark range first to select the full code
  let chain = props.editor.chain().focus().extendMarkRange(markType).setLink({ href: url.value });

  if (isEmpty) {
    chain = props.editor.chain().focus().insertContent({ type: 'text', text: url.value });
  }

  chain.run();
  open.value = false;
}

function removeLink() {
  props.editor.chain().focus().extendMarkRange('link').unsetLink().setMeta('preventAutolink', true).run();

  url.value = '';
  open.value = false;
}

function openLink() {
  if (!url.value) {
    return;
  }
  window.open(url.value, '_blank', 'noopener,noreferrer');
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault();
    setLink();
  }
}

watchEffect(() => {
  if (active.value && props.autoOpen) {
    open.value = true;
  }
});

onMounted(async () => {
  await nextTick();
  const editor = props.editor;
  if (!editor) {
    return;
  }

  editor.on('selectionUpdate', () => {
    updateUrl(editor);
  });

  editor.off('selectionUpdate', () => {
    updateUrl(editor);
  });
});
</script>

<template>
  <UPopover
    v-model:open="open"
    :ui="{
      content: 'p-0.5'
    }"
  >
    <UTooltip text="Link">
      <UButton
        icon="i-lucide-link"
        color="neutral"
        active-color="primary"
        variant="ghost"
        active-variant="soft"
        size="sm"
        :active="active"
        :disabled="disabled"
      />
    </UTooltip>

    <template #content>
      <UInput
        v-model="url"
        autofocus
        name="url"
        type="url"
        variant="none"
        placeholder="Paste a link..."
        @keydown="handleKeyDown"
      >
        <div class="flex items-center mr-0.5">
          <UButton
            icon="i-lucide-corner-down-left"
            variant="ghost"
            size="sm"
            :disabled="!url && !active"
            title="Apply link"
            @click="setLink"
          />

          <USeparator
            orientation="vertical"
            class="h-6 mx-1"
          />

          <UButton
            icon="i-lucide-external-link"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="!url && !active"
            title="Open in new window"
            @click="openLink"
          />

          <UButton
            icon="i-lucide-trash"
            color="neutral"
            variant="ghost"
            size="sm"
            :disabled="!url && !active"
            title="Remove link"
            @click="removeLink"
          />
        </div>
      </UInput>
    </template>
  </UPopover>
</template>
