<script setup lang="ts">
import { TableKit } from '@tiptap/extension-table';
import { CellSelection } from '@tiptap/pm/tables';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import type { Editor } from '@tiptap/vue-3';
import type { EditorProps, EditorCustomHandlers } from '@nuxt/ui';
import { cn } from 'tailwind-variants';

interface Props extends Omit<EditorProps, 'contentType' | 'modelValue' | 'editable'> {
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

const extensions = [
  TableKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Subscript,
  Superscript
];

const customHandlers = {
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

const {
  fixedToolbarItems,
  tableToolbarItems,
  suggestionItems,
  bubbleToolbarItems,
  dragHandleItems,
  selectedNode
} = useEditorActions(editorRef);
const isFocused = ref(false);
</script>

<template>
  <UEditor
    ref="editorRef"
    v-slot="{ editor, handlers }"
    v-model="vmodel"
    v-bind="props"
    :extensions="[...extensions, ...(props.extensions ?? [])]"
    :handlers="{ ...customHandlers, ...props.handlers }"
    :starter-kit="props.starterKit"
    :placeholder="props.placeholder"
    :editor-props="props.editorProps"
    :editable="!props.disabled"
    content-type="html"
    :class="cn('w-full rounded-md ring ring-inset p-px', isFocused ? 'ring-primary' : 'ring-accented', props.class)"
    :ui="{
      root: props.ui?.root,
      base: () => cn('content p-8 sm:pr-4 py-4', props.disabled ? 'sm:pl-4' : 'sm:pl-14', props.ui?.base),
      content: cn('min-h-[150px]', props.ui?.content)
    }"
    @focus="isFocused = true"
    @blur="isFocused = false"
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
    </UEditorToolbar>

    <UEditorToolbar
      v-if="!props.disabled"
      :editor="editor"
      :items="bubbleToolbarItems"
      layout="bubble"
      :should-show="({ editor, view, state }) => {
        if (editor.isActive('imageUpload') || editor.isActive('image') || state.selection instanceof CellSelection) {
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
    </UEditorToolbar>

    <UEditorToolbar
      v-if="!props.disabled"
      :editor="editor"
      :items="tableToolbarItems"
      layout="bubble"
      :should-show="({ editor, view }: any) => {
        return editor.state.selection instanceof CellSelection && view.hasFocus()
      }"
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
