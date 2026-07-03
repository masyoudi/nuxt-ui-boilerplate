<script setup lang="ts">
import { TableKit } from '@tiptap/extension-table';
import { CellSelection } from '@tiptap/pm/tables';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { ImageResize } from './ExtensionImageResize';
import { ImageUpload } from './ExtensionImageUpload';
import type { Editor } from '@tiptap/vue-3';
import type { EditorProps, EditorCustomHandlers } from '@nuxt/ui';
import { cn } from 'tailwind-variants';

interface Props extends Omit<EditorProps, 'contentType' | 'modelValue' | 'editable' | 'image'> {
  disabled?: boolean;
}

defineOptions({
  inheritAttrs: false
});

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write, type \'/\' for commands...',
  enableCoreExtensions: true,
  enableInputRules: true,
  enablePasteRules: true,
  enableExtensionDispatchTransaction: true,
  disabled: false
});

const extensions = computed(() => [
  ImageResize,
  ImageUpload,
  TableKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Subscript,
  Superscript,
  TextStyleKit.configure({
    fontSize: false,
    fontFamily: false
  })
]);

const customHandlers = {
  imageUpload: {
    canExecute: (editor: Editor) => editor.can().insertContent({ type: 'imageUpload' }),
    execute: (editor: Editor) => editor.chain().focus().insertContent({ type: 'imageUpload' }),
    isActive: (editor: Editor) => editor.isActive('imageUpload'),
    isDisabled: undefined
  },
  table: {
    canExecute: (editor: Editor) => editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    execute: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
    isActive: (editor: Editor) => editor.isActive('table'),
    isDisabled: undefined
  },
  subscript: {
    canExecute: (editor: Editor) => editor.can().toggleSubscript(),
    execute: (editor: Editor) => editor.chain().focus().toggleSubscript().run(),
    isActive: (editor: Editor) => editor.isActive('subscript'),
    isDisabled: undefined
  },
  superscript: {
    canExecute: (editor: Editor) => editor.can().toggleSuperscript(),
    execute: (editor: Editor) => editor.chain().focus().toggleSuperscript().run(),
    isActive: (editor: Editor) => editor.isActive('superscript'),
    isDisabled: undefined
  }
} satisfies EditorCustomHandlers;

const editorRef = ref<{ editor?: Editor }>();
const vmodel = defineModel<string>({ default: '' });
const content = ref('');
const isFocused = ref(false);

const {
  fixedToolbarItems,
  tableToolbarItems,
  suggestionItems,
  bubbleToolbarItems,
  dragHandleItems,
  imageToolbarItems,
  selectedNode
} = useEditorActions(editorRef);

const { emitFormBlur, emitFormInput, emitFormFocus, color } = useFormField(props, { deferInputValidation: true });
const isError = computed(() => color.value === 'error');

function onUpdateContent(value: string) {
  vmodel.value = toText(value).length > 0 ? value : '';
  emitFormInput();
}

function onFocus() {
  isFocused.value = true;
  emitFormFocus();
}

function onBlur() {
  isFocused.value = false;
  emitFormBlur();
}

function toText(value: string) {
  return value.replace(/(<\/?[^>]+(>|$)|&nbsp;|\s)/g, '');
}

watchEffect(() => {
  const isEqual = toText(vmodel.value) === toText(content.value);
  if (isEqual) {
    return;
  }

  content.value = vmodel.value;
});
</script>

<template>
  <UEditor
    ref="editorRef"
    v-slot="{ editor, handlers }"
    v-model="content"
    v-bind="props"
    :extensions="[...extensions, ...(props.extensions ?? [])]"
    :handlers="{ ...customHandlers, ...props.handlers }"
    :starter-kit="props.starterKit"
    :placeholder="props.placeholder"
    :editor-props="props.editorProps"
    :editable="!props.disabled"
    :image="false"
    content-type="html"
    :class="cn(
      'w-full min-h-[150px] rounded-md ring ring-inset bg-white p-px',
      !isError ? isFocused ? 'ring-primary' : 'ring-accented' : 'ring-error',
      props.class
    )"
    :ui="{
      root: props.ui?.root,
      base: () => cn('prose min-h-[110px] p-8 sm:pr-4 py-4', props.disabled ? 'sm:pl-4' : 'sm:pl-14', props.ui?.base),
      content: props.ui?.content
    }"
    @focus="onFocus"
    @blur="onBlur"
    @update:model-value="onUpdateContent"
  >
    <UEditorToolbar
      v-if="!props.disabled"
      :editor="editor"
      :items="fixedToolbarItems"
      class="sticky top-0 inset-x-0 rounded-t-md bg-default overflow-x-auto p-1"
    >
      <template #table>
        <TextEditorActionTable :editor="editor" />
      </template>

      <template #link>
        <TextEditorActionLink
          :editor="editor"
          auto-open
        />
      </template>

      <template #color>
        <TextEditorActionTextColor :editor="editor" />
      </template>

      <template #background>
        <TextEditorActionBackgroundColor :editor="editor" />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      v-if="!props.disabled"
      :editor="editor"
      :items="bubbleToolbarItems"
      layout="bubble"
      :should-show="({ editor, view, state }) => {
        if (editor.isActive('imageUpload') || editor.isActive('imageResize') || state.selection instanceof CellSelection) {
          return false
        }
        const { selection } = state
        return view.hasFocus() && !selection.empty
      }"
    >
      <template #link>
        <TextEditorActionLink
          :editor="editor"
          auto-open
        />
      </template>

      <template #color>
        <TextEditorActionTextColor :editor="editor" />
      </template>

      <template #background>
        <TextEditorActionBackgroundColor :editor="editor" />
      </template>
    </UEditorToolbar>

    <UEditorToolbar
      v-if="!props.disabled"
      :editor="editor"
      :items="tableToolbarItems"
      layout="bubble"
      :should-show="({ editor, view }: any) => editor.state.selection instanceof CellSelection && view.hasFocus()"
    />

    <UEditorToolbar
      :editor="editor"
      :items="imageToolbarItems"
      layout="bubble"
      :should-show="({ editor, view }: any) => editor.isActive('imageResize') && view.hasFocus()"
    />

    <UEditorDragHandle
      v-if="!props.disabled"
      v-slot="{ ui, onClick }"
      :editor="editor"
      @node-change="selectedNode = $event"
    >
      <UButton
        icon="i-lucide-plus"
        color="neutral"
        variant="ghost"
        size="sm"
        :class="ui.handle({ class: 'px-0.5 py-0.5 rounded-sm' })"
        @click="(e) => {
          e.stopPropagation()

          const selected = onClick()
          handlers.suggestion?.execute(editor, { pos: selected?.pos }).run()
        }"
      />

      <UDropdownMenu
        v-slot="{ open }"
        :modal="false"
        :items="dragHandleItems"
        :content="{
          side: 'left'
        }"
        :ui="{
          content: 'w-48',
          label: 'text-xs'
        }"
        @update:open="editor.chain().setMeta('lockDragHandle', $event).run()"
      >
        <UButton
          color="neutral"
          variant="ghost"
          active-variant="soft"
          size="sm"
          icon="i-lucide-grip-vertical"
          :active="open"
          :class="ui.handle({ class: 'px-0.5 py-0.5 rounded-sm' })"
        />
      </UDropdownMenu>
    </UEditorDragHandle>

    <UEditorSuggestionMenu
      v-if="!props.disabled"
      :editor="editor"
      :items="suggestionItems"
    />
  </UEditor>
</template>
